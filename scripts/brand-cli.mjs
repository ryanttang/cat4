#!/usr/bin/env node
/**
 * Brand platform CLI — clone, sync, diff, status, doctor.
 *
 *   npm run brand:clone
 *   npm run brand:sync -- pull --from ../CAT4
 *   npm run brand:sync -- push --to ../CAT4
 *   npm run brand:diff -- --peer ../acme
 *   npm run brand:status
 *   npm run brand:doctor
 */
import { runClone } from "./brand/clone.mjs";
import { runDiff, runSync } from "./brand/sync.mjs";
import { runStatus } from "./brand/status.mjs";
import { runDoctor } from "./brand/doctor.mjs";
import { c } from "./brand/shared.mjs";

const USAGE = `
${c("Brand platform tooling", "bold")}

  brand:clone                 Interactive white-label clone wizard
  brand:sync pull --from <p>  Pull platform paths from peer into this repo
  brand:sync push --to <p>    Push platform paths from this repo into peer
  brand:diff --peer <p>       Show platform drift both ways
  brand:status                Lineage + path inventory
  brand:doctor                Find leftover brand strings

Sync flags:
  --dry-run          Preview only
  --yes / -y         Apply without confirm
  --path <rel>       Limit to one path (repeatable)
  --include-skin     Also overwrite skin (dangerous)

Clone flags:
  --name --id --dir --url --yes
`;

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const rest = argv.slice(1);

  try {
    if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
      console.log(USAGE);
      return;
    }
    if (cmd === "clone") await runClone(rest);
    else if (cmd === "sync") await runSync(rest);
    else if (cmd === "diff") runDiff(rest);
    else if (cmd === "status") runStatus(rest);
    else if (cmd === "doctor") runDoctor(rest);
    else {
      console.error(`Unknown command: ${cmd}`);
      console.log(USAGE);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(c(`\nError: ${err.message || err}`, "red"));
    process.exitCode = 1;
  }
}

main();
