#!/usr/bin/env node
import "dotenv/config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { makeClient, getEvent, createEvent, makeDuplicatePayload } from "@wmi/wa-api";

const argv = yargs(hideBin(process.argv))
  .scriptName("wmi-dup-event")
  .usage("$0 --account <id> --event <id> [options]")
  .option("account", {
    type: "number",
    description: "Wild Apricot accountId",
    default: process.env.WA_DEFAULT_ACCOUNT_ID ? Number(process.env.WA_DEFAULT_ACCOUNT_ID) : undefined,
    demandOption: true
  })
  .option("event", {
    type: "number",
    description: "Event Id to duplicate",
    demandOption: true
  })
  .option("newStart", {
    type: "string",
    description: "New StartDate ISO (e.g., 2025-09-01T18:00:00)"
  })
  .option("newEnd", {
    type: "string",
    description: "New EndDate ISO"
  })
  .option("offsetMinutes", {
    type: "number",
    description: "Offset original Start/End by N minutes"
  })
  .option("nameSuffix", {
    type: "string",
    description: "Suffix to append to the event Name, e.g. '(Sept 1)'"
  })
  .example([
    [
      "$0 --account 123456 --event 78910 --newStart 2025-09-01T18:00:00 --newEnd 2025-09-01T20:00:00 --nameSuffix '(Sept 1)'",
      "Duplicate event with an explicit new time"
    ],
    [
      "$0 --account 123456 --event 78910 --offsetMinutes 10080",
      "Duplicate event by adding 7 days (10080 minutes) to start/end"
    ]
  ])
  .help()
  .parseSync();

async function main() {
  const clientId = process.env.WA_CLIENT_ID;
  const clientSecret = process.env.WA_CLIENT_SECRET;
  const scope = process.env.WA_SCOPE || "auto";

  if (!clientId || !clientSecret) {
    console.error("Missing WA_CLIENT_ID / WA_CLIENT_SECRET in environment");
    process.exit(1);
  }

  const client = await makeClient({ clientId, clientSecret, scope });

  const original = await getEvent(client, argv.account as number, argv.event as number);

  const payload = makeDuplicatePayload(original, {
    newStart: argv.newStart as string | undefined,
    newEnd: argv.newEnd as string | undefined,
    offsetMinutes: argv.offsetMinutes as number | undefined,
    nameSuffix: argv.nameSuffix as string | undefined
  });

  const created = await createEvent(client, argv.account as number, payload);
  console.log("✅ Created new event:");
  console.log(`Name: ${created.Name}`);
  console.log(`Start: ${created.StartDate}`);
  if (created.EndDate) console.log(`End: ${created.EndDate}`);
  if (created.Url) console.log(`URL: ${created.Url}`);
}

main().catch((e) => {
  console.error("Error:", e.response?.data ?? e.message ?? e);
  process.exit(1);
});