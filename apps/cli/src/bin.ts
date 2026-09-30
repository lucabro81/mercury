#!/usr/bin/env bun
/** The `mfw` executable: runs the command line through `main`. */
import { main } from "./main.ts";

process.exit(await main(process.argv.slice(2)));
