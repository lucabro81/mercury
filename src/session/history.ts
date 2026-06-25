export type Message = { role: "user" | "assistant"; content: string };

// ~15K tokens estimated via the char/4 heuristic, well within the
// 16-20K slice of the 32K context budget (D-19).
export const MAX_HISTORY_CHARS = 60_000;

export type SessionHistory = {
  addUserMessage(content: string): Promise<void>;
  addAssistantMessage(content: string): Promise<void>;
  getMessages(): Message[];
};

function summaryMessage(summary: string): Message {
  return { role: "assistant", content: `Earlier conversation summary: ${summary}` };
}

export function createSessionHistory(
  summarize: (messages: Message[]) => Promise<string>,
): SessionHistory {
  let rawMessages: Message[] = [];
  let summary: string | null = null;

  async function add(message: Message): Promise<void> {
    rawMessages.push(message);

    const total = rawMessages.reduce((sum, m) => sum + m.content.length, 0);
    if (total > MAX_HISTORY_CHARS) {
      const batch = summary ? [summaryMessage(summary), ...rawMessages] : rawMessages;
      summary = await summarize(batch);
      rawMessages = [];
    }
  }

  return {
    addUserMessage: (content) => add({ role: "user", content }),
    addAssistantMessage: (content) => add({ role: "assistant", content }),
    getMessages: () => (summary ? [summaryMessage(summary), ...rawMessages] : [...rawMessages]),
  };
}
