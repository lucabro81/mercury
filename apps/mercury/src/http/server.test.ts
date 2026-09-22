import { describe, it, expect } from "bun:test";
import { handleTurnRequest, type HttpConfirmDeps } from "./server.ts";
import type { HandleTurn, InboundTurn } from "../router/provider.ts";
import type { StepInfo } from "../session/step-info.ts";

/**
 * The conversational endpoint's streaming behaviour, exercised without a socket:
 * a normal turn streams reasoning/text/final SSE events and hands the model an
 * http InboundTurn; a bare token is resolved via tryConfirm without ever calling
 * the model; a staged confirm-required action surfaces as a `pending` event with
 * its token. The confirm deps are never touched here — `tryConfirmFn` is stubbed.
 */
const confirmDeps = {} as unknown as HttpConfirmDeps;

const turnReq = (body: unknown): Request =>
  new Request("http://x/turn", { method: "POST", body: JSON.stringify(body) });

describe("handleTurnRequest", () => {
  it("streams reasoning, text and final events and passes an http InboundTurn keyed by conversationId", async () => {
    let seen: InboundTurn | undefined;
    const handleTurn: HandleTurn = async (turn, sink) => {
      seen = turn;
      sink.onReasoningChunk?.("thinking", "r1");
      sink.onReasoningEnd?.("r1", false);
      sink.onTextChunk?.("Hello");
      await sink.finalize("Hello world");
    };
    const res = await handleTurnRequest(turnReq({ text: "hi", conversationId: "conv-1" }), {
      handleTurn,
      confirmDeps,
      tryConfirmFn: async () => null,
    });
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    const body = await res.text();
    expect(body).toContain("event: reasoning");
    expect(body).toContain("event: text");
    expect(body).toContain("event: final");
    expect(body).toContain("Hello world");
    expect(seen?.sessionKey).toBe("conv-1");
    expect(seen?.channel).toBe("http");
    expect(seen?.multiUser).toBe(false);
    expect(seen?.wikiUserId).toBe("conv-1");
  });

  it("resolves a confirmation token via tryConfirm without ever calling the model", async () => {
    let modelCalled = false;
    const handleTurn: HandleTurn = async () => {
      modelCalled = true;
    };
    const res = await handleTurnRequest(turnReq({ text: "SOME-TOKEN", conversationId: "c" }), {
      handleTurn,
      confirmDeps,
      tryConfirmFn: async () => "Confermato ed eseguito: {}",
    });
    const body = await res.text();
    expect(modelCalled).toBe(false);
    expect(body).toContain("event: final");
    expect(body).toContain("Confermato ed eseguito");
  });

  it("surfaces a staged confirm-required action as a pending event with its command and token", async () => {
    const pendingStep: StepInfo = {
      toolCalls: [{ toolCallId: "1", toolName: "runCommand", input: { command: "jira issue delete KAN-1" } }],
      toolResults: [
        { toolCallId: "1", toolName: "runCommand", output: { ok: false, pendingConfirmation: true, token: "TOK-123", summary: "jira issue delete KAN-1" } },
      ],
      content: [],
    } as unknown as StepInfo;
    const handleTurn: HandleTurn = async (_turn, sink) => {
      sink.onStep?.(pendingStep);
      await sink.finalize("staged");
    };
    const res = await handleTurnRequest(turnReq({ text: "delete KAN-1", conversationId: "c" }), {
      handleTurn,
      confirmDeps,
      tryConfirmFn: async () => null,
    });
    const body = await res.text();
    expect(body).toContain("event: pending");
    expect(body).toContain("jira issue delete KAN-1");
    expect(body).toContain("TOK-123");
  });

  it("uses a fresh ephemeral session key when the client supplies no conversationId", async () => {
    let seenKey: string | undefined;
    const handleTurn: HandleTurn = async (turn, sink) => {
      seenKey = turn.sessionKey;
      await sink.finalize("x");
    };
    await handleTurnRequest(turnReq({ text: "hi" }), {
      handleTurn,
      confirmDeps,
      tryConfirmFn: async () => null,
      newSessionKey: () => "ephemeral-123",
    });
    expect(seenKey).toBe("ephemeral-123");
  });

  it("reports a mid-turn failure as an error event rather than throwing", async () => {
    const handleTurn: HandleTurn = async () => {
      throw new Error("model exploded");
    };
    const res = await handleTurnRequest(turnReq({ text: "hi", conversationId: "c" }), {
      handleTurn,
      confirmDeps,
      tryConfirmFn: async () => null,
    });
    const body = await res.text();
    expect(body).toContain("event: error");
    expect(body).toContain("model exploded");
  });

  it("returns 400 for a body with no text", async () => {
    const res = await handleTurnRequest(turnReq({ conversationId: "c" }), {
      handleTurn: async () => {},
      confirmDeps,
      tryConfirmFn: async () => null,
    });
    expect(res.status).toBe(400);
  });
});
