import { describe, it, expect } from "bun:test";
import { composeStaleTicketMessage } from "./notification-composer.ts";
import type { LanguageModel } from "ai";
import type { EpisodicSummary } from "../memory/episodic-store.ts";

const MODEL = "fake-model" as unknown as LanguageModel;

type ReceivedParams = { model: LanguageModel; system: string; prompt: string };

describe("composeStaleTicketMessage", () => {
  it("includes the finding's key, summary, and stale-days count in the prompt", async () => {
    let received: ReceivedParams | undefined;
    const generateTextFn = async (params: ReceivedParams) => {
      received = params;
      return { text: "Il ticket KAN-123 è fermo da un po', ti va di darci un'occhiata?" };
    };

    const text = await composeStaleTicketMessage(
      { key: "KAN-123", summary: "Fix login bug", staleDays: 7 },
      [],
      { model: MODEL, generateTextFn },
    );

    expect(received?.prompt).toContain("KAN-123");
    expect(received?.prompt).toContain("Fix login bug");
    expect(received?.prompt).toContain("7");
    expect(text).toContain("KAN-123");
  });

  it("includes past notification history in the prompt when present", async () => {
    let received: ReceivedParams | undefined;
    const generateTextFn = async (params: ReceivedParams) => {
      received = params;
      return { text: "ok" };
    };
    const history: EpisodicSummary[] = [
      { userId: "users/42", sessionKey: "terminal", summary: "Mercury ha notificato KAN-123 il 2026-07-14.", timestamp: "2026-07-14T09:00:00Z" },
      { userId: "users/42", sessionKey: "terminal", summary: "Mercury ha notificato KAN-123 il 2026-07-17.", timestamp: "2026-07-17T09:00:00Z" },
    ];

    await composeStaleTicketMessage({ key: "KAN-123", summary: "Fix login bug", staleDays: 10 }, history, {
      model: MODEL,
      generateTextFn,
    });

    expect(received?.prompt).toContain("2026-07-14");
    expect(received?.prompt).toContain("2026-07-17");
  });

  it("tells the model explicitly when there's no prior notification history", async () => {
    let received: ReceivedParams | undefined;
    const generateTextFn = async (params: ReceivedParams) => {
      received = params;
      return { text: "ok" };
    };

    await composeStaleTicketMessage({ key: "KAN-1", summary: "x", staleDays: 5 }, [], {
      model: MODEL,
      generateTextFn,
    });

    expect(received?.prompt.toLowerCase()).toMatch(/nessuna notifica|prima volta|mai notificat/);
  });

  // Never a fixed template — the system prompt must actually instruct
  // personalization based on history, not just describe the task.
  it("instructs the model to personalize tone/frequency based on history, in the system prompt", async () => {
    let received: ReceivedParams | undefined;
    const generateTextFn = async (params: ReceivedParams) => {
      received = params;
      return { text: "ok" };
    };

    await composeStaleTicketMessage({ key: "KAN-1", summary: "x", staleDays: 5 }, [], {
      model: MODEL,
      generateTextFn,
    });

    expect(received?.system.toLowerCase()).toMatch(/personalizz|tono|frequenza/);
  });

  it("passes the model through unchanged", async () => {
    let received: ReceivedParams | undefined;
    const generateTextFn = async (params: ReceivedParams) => {
      received = params;
      return { text: "ok" };
    };

    await composeStaleTicketMessage({ key: "KAN-1", summary: "x", staleDays: 5 }, [], {
      model: MODEL,
      generateTextFn,
    });

    expect(received?.model).toBe(MODEL);
  });

  it("returns the generated text verbatim", async () => {
    const generateTextFn = async () => ({ text: "messaggio composto da Mercury" });

    const text = await composeStaleTicketMessage({ key: "KAN-1", summary: "x", staleDays: 5 }, [], {
      model: MODEL,
      generateTextFn,
    });

    expect(text).toBe("messaggio composto da Mercury");
  });
});
