import { describe, it, expect } from "bun:test";
import { notifyAdmin } from "./admin-notify.ts";
import type { sendMessage } from "../router/channels/google-chat-client.ts";
import type { runCli } from "../tools/cli-executor.ts";

const runCliFn: typeof runCli = async () => ({ ok: true, data: {} });

describe("notifyAdmin", () => {
  // Base send-to-admin-space primitive — same "Mercury reasons, never
  // a blind template" delivery philosophy as personalized per-user
  // findings elsewhere, just a direct call here since this specific
  // message (identity bridge fallback) is a deterministic system notice,
  // not a personalized per-user finding.
  it("sends the given text to the configured admin space", async () => {
    let receivedArgs: { space?: string; text?: string; runCliFn?: unknown } = {};
    const sendMessageFn: typeof sendMessage = async (space, text, fn) => {
      receivedArgs = { space, text, runCliFn: fn };
      return { name: "spaces/ADMIN/messages/1" };
    };

    await notifyAdmin("non ho un id Chat per mario@example.com", {
      adminSpace: "spaces/ADMIN",
      sendMessageFn,
      runCliFn,
    });

    expect(receivedArgs.space).toBe("spaces/ADMIN");
    expect(receivedArgs.text).toBe("non ho un id Chat per mario@example.com");
  });
});
