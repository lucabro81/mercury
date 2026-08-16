import { describe, expect, test } from "bun:test";
import { parseSubscriptionName } from "./google-chat-pubsub-stream.ts";

describe("parseSubscriptionName", () => {
  test("splits a well-formed resource name into its project and subscription ids", () => {
    expect(parseSubscriptionName("projects/my-proj/subscriptions/my-sub")).toEqual({
      projectId: "my-proj",
      subscriptionId: "my-sub",
    });
  });

  test("throws a clear error on a malformed resource name, rather than failing deep inside the SDK", () => {
    expect(() => parseSubscriptionName("my-sub")).toThrow(/unexpected Pub\/Sub subscription resource name/);
  });
});
