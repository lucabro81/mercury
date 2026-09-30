#!/usr/bin/env bun
/**
 * `create-mercury-agent`: what `bun create mercury-agent <folder>` runs. It is
 * `mfw create` under the name the `create` convention looks for, with the same
 * arguments and the same result.
 */
import { main } from "@mercury-fw/cli";

process.exit(await main(["create", ...process.argv.slice(2)]));
