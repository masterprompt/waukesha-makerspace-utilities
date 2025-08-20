#!/usr/bin/env node
import "dotenv/config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { makeClient, getEvent } from "@wmi/wa-api";

const argv = yargs(hideBin(process.argv))
  .scriptName("wmi-event-show")
  .usage("$0 --account <id> --event <id>")
  .option("account", {
    type: "number",
    description: "Wild Apricot accountId",
    default: process.env.WA_DEFAULT_ACCOUNT_ID ? Number(process.env.WA_DEFAULT_ACCOUNT_ID) : undefined,
    demandOption: true
  })
  .option("event", {
    type: "number",
    description: "Event Id to fetch",
    demandOption: true
  })
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
  const event = await getEvent(client, argv.account as number, argv.event as number);

  // Pretty-print the most useful bits; fall back safely if fields are missing
  const lines = [
    ["ID", event.Id],
    ["Name", event.Name],
    ["StartDate", event.StartDate],
    ["EndDate", event.EndDate],
    ["Location", event.Location?.Venue || event.Location?.Name || event.Location || ""],
    ["Timezone", event.Timezone],
    ["RegistrationsCount", event.RegistrationsCount],
    ["Public URL", event.Url],
  ];

  console.log("📅 Event Details");
  console.log("────────────────────────────────────────");
  for (const [label, value] of lines) {
    if (value !== undefined && value !== null && value !== "") {
      console.log(`${label}: ${value}`);
    }
  }

  // If you want to see everything:
  // console.log("\nFull JSON:\n", JSON.stringify(event, null, 2));
}

main().catch((e) => {
  console.error("Error:", e.response?.data ?? e.message ?? e);
  process.exit(1);
});