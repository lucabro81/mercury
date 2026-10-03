/**
 * The test bed's example e2e test: Jira read-only lookups, a project by name
 * and a user by name, which the skill says to do with `project search` and
 * `user search`, each with its `--select`. It reads from the Jira the app's
 * credentials reach, so the expected key and name are this instance's: copy
 * the file under another name and adapt them (copies stay out of git).
 */
import { e2e } from "@mercury-fw/cli/e2e";

/** The command line of a `jiraCommand` call. */
const command = (input: unknown) => String((input as { command?: unknown }).command ?? "");

export default e2e({
  plugins: ["jira"],
  cases: [
    {
      name: "a project key and a user, by name, at the first try",
      turns: ["On Jira, what is the project key of Customer Support, and is there a user whose name contains Brognara?"],
      check: (run, expect) => {
        expect.call("read_skill", (c) => (c.input as { name?: string }).name === "jira", "loads the jira skill");
        expect.call("jiraCommand", (c) => command(c.input).startsWith("jira project search"), "searches the project");
        expect.call("jiraCommand", (c) => command(c.input).startsWith("jira user search"), "searches the user");
        expect.everyCall("jiraCommand", (c) => command(c.input).includes("--select "), "every jira command has --select");
        // Not noFailedCalls: the skill has the model look for a project-name
        // mapping in the wiki first, and a new app's wiki doesn't have it yet.
        expect.everyCall("jiraCommand", (c) => c.ok, "no jira command failed");
        expect.callCount({ max: 2 }, "jiraCommand");
        expect.answer(/\bCS\b/);
        expect.answer("Luca Brognara");
      },
    },
  ],
});
