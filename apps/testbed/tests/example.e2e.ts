/**
 * The test bed's example e2e test, a template: copy it under another name in
 * this folder (copies stay out of git), fill in the constants below with what
 * the Jira your app's credentials reach actually has, and run it from the
 * app's folder with `bunx mfw e2e ../../tests/<copy>.e2e.ts`. As it is, it
 * runs nowhere; it's committed so the typecheck keeps it in step with the
 * test format.
 *
 * The case: two read-only lookups by name, a project and a person, which the
 * Jira skill says to do with `project search` and `user search`, each with
 * its `--select`.
 */
import { e2e } from "@mercury-fw/cli/e2e";

/** A project's name as people say it, and the key Jira gives it. */
const PROJECT_NAME = "<project name>";
const PROJECT_KEY = "<KEY>";
/** Part of a person's name, and their full display name in Jira. */
const PERSON_QUERY = "<surname>";
const PERSON_NAME = "<First Last>";

/** The command line of a `jiraCommand` call. */
const command = (input: unknown) => String((input as { command?: unknown }).command ?? "");

export default e2e({
  plugins: ["jira"],
  cases: [
    {
      name: "a project key and a person, by name, at the first try",
      turns: [`On Jira, what is the project key of ${PROJECT_NAME}, and is there a user whose name contains ${PERSON_QUERY}?`],
      check: (run, expect) => {
        expect.call("read_skill", (c) => (c.input as { name?: string }).name === "jira", "loads the jira skill");
        expect.call("jiraCommand", (c) => command(c.input).startsWith("jira project search"), "searches the project");
        expect.call("jiraCommand", (c) => command(c.input).startsWith("jira user search"), "searches the user");
        expect.everyCall("jiraCommand", (c) => command(c.input).includes("--select "), "every jira command has --select");
        // Only Jira's calls: the skill has the model look in the wiki first,
        // where a new app may have nothing yet.
        expect.everyCall("jiraCommand", (c) => c.ok, "no jira command failed");
        expect.callCount({ max: 2 }, "jiraCommand");
        expect.answer(PROJECT_KEY);
        expect.answer(PERSON_NAME);
      },
    },
  ],
});
