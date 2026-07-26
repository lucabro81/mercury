import { describe, expect, test } from "bun:test";
import { createNotifyUserTool } from "./notify-user.ts";
import type { Notifier } from "../router/provider.ts";
import type { findChatUserByEmail } from "../cron/identity-bridge.ts";

function fakeNotifier(overrides: Partial<Notifier> = {}): Notifier {
  return {
    notify: async () => ({ sessionKey: "spaces/DM1" }),
    notifyAdmin: async () => {},
    ...overrides,
  };
}

describe("createNotifyUserTool", () => {
  test("a known email sends directly via notifier.notify and returns its sessionKey", async () => {
    let notifyArgs: [string, string] | undefined;
    const notifier = fakeNotifier({
      notify: async (userId, text) => {
        notifyArgs = [userId, text];
        return { sessionKey: "spaces/DM1" };
      },
    });
    const findChatUserByEmailFn: typeof findChatUserByEmail = async () => ({
      userId: "users/42",
      displayName: "Mario Rossi",
    });

    const { notifyUser } = createNotifyUserTool({ notifier, vaultPath: "/vault", findChatUserByEmailFn });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = await notifyUser.execute({ email: "mario@example.com", text: "ciao" }, {} as never);

    expect(result).toEqual({ ok: true, sessionKey: "spaces/DM1" });
    expect(notifyArgs).toEqual(["users/42", "ciao"]);
  });

  test("an unknown email returns a clean error and never calls notify", async () => {
    let notifyCalled = false;
    const notifier = fakeNotifier({
      notify: async () => {
        notifyCalled = true;
        return { sessionKey: "spaces/DM1" };
      },
    });
    const findChatUserByEmailFn: typeof findChatUserByEmail = async () => null;

    const { notifyUser } = createNotifyUserTool({ notifier, vaultPath: "/vault", findChatUserByEmailFn });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = await notifyUser.execute({ email: "nobody@example.com", text: "ciao" }, {} as never);

    expect(result).toEqual({ ok: false, error: 'no cached Chat user for "nobody@example.com"' });
    expect(notifyCalled).toBe(false);
  });

  test("passes vaultPath and the given email through to findChatUserByEmailFn", async () => {
    let receivedArgs: [string, string] | undefined;
    const findChatUserByEmailFn: typeof findChatUserByEmail = async (vaultPath, email) => {
      receivedArgs = [vaultPath, email];
      return null;
    };

    const { notifyUser } = createNotifyUserTool({ notifier: fakeNotifier(), vaultPath: "/my-vault", findChatUserByEmailFn });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    await notifyUser.execute({ email: "someone@example.com", text: "hi" }, {} as never);

    expect(receivedArgs).toEqual(["/my-vault", "someone@example.com"]);
  });
});
