#!/usr/bin/env tsx
/**
 * Duplicate a Wild Apricot event to multiple dates (TypeScript, no build).
 * Run from repo root:
 *   pnpm run -w run scripts/duplicateEvent.ts
 * or:
 *   pnpm tsx scripts/duplicateEvent.ts
 *
 * Credentials: set via env vars OR inline in CONFIG below.
 *   WA_CLIENT_ID, WA_CLIENT_SECRET, WA_SCOPE (default "auto"), WA_ACCOUNT_ID
 */

import "dotenv/config";

// ---- Option A: import via source to avoid building the shared package
import { makeClient, getEvent, createEvent, makeDuplicatePayload, WAEvent } from "../packages/wa-api/src";

// ---- Option B: if you prefer package import, enable tsconfig "paths" (see above)
// import { makeClient, getEvent, createEvent, makeDuplicatePayload, WAEvent } from "@wmi/wa-api";

// ---------- CONFIG (edit here) ----------
const CONFIG = {
  clientId: process.env.WA_CLIENT_ID || "YOUR_CLIENT_ID",
  clientSecret: process.env.WA_CLIENT_SECRET || "YOUR_CLIENT_SECRET",
  scope: process.env.WA_SCOPE || "auto",
  accountId: Number(process.env.WA_ACCOUNT_ID || 123456),

  // The source event to copy from:
  sourceEventId: 78910,

  // New dates/times to create (ISO strings; EndDate optional)
  // Examples below: three Mondays 6–8pm in Sept
  instances: [
    { start: "2025-09-01T18:00:00", end: "2025-09-01T20:00:00" },
    { start: "2025-09-08T18:00:00", end: "2025-09-08T20:00:00" },
    { start: "2025-09-15T18:00:00", end: "2025-09-15T20:00:00" },
  ],

  // Optional suffix function to tweak the event Name per instance:
  nameSuffixFor: (idx: number, isoStart: string) => {
    const d = new Date(isoStart);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `(${mm}/${dd})`;
  },

  // Safety lever: true = show what would be created but don't POST
  dryRun: false,
};
// ---------------------------------------

function assertConfig() {
  const missing: string[] = [];
  if (!CONFIG.clientId || CONFIG.clientId === "YOUR_CLIENT_ID") missing.push("WA_CLIENT_ID / clientId");
  if (!CONFIG.clientSecret || CONFIG.clientSecret === "YOUR_CLIENT_SECRET") missing.push("WA_CLIENT_SECRET / clientSecret");
  if (!CONFIG.accountId) missing.push("WA_ACCOUNT_ID / accountId");
  if (!CONFIG.sourceEventId) missing.push("sourceEventId");
  if (!CONFIG.instances?.length) missing.push("instances[]");
  if (missing.length) {
    throw new Error("Missing config: " + missing.join(", "));
  }
}

async function main() {
  assertConfig();

  const client = await makeClient({
    clientId: CONFIG.clientId,
    clientSecret: CONFIG.clientSecret,
    scope: CONFIG.scope,
  });

  // 1) Pull the template event
  const template: WAEvent = await getEvent(client, CONFIG.accountId, CONFIG.sourceEventId);
  console.log(`📥 Loaded template: [${template.Id}] ${template.Name}`);

  // 2) Build payloads for each new date
  const payloads: WAEvent[] = CONFIG.instances.map((inst, idx) => {
    const suffix = CONFIG.nameSuffixFor?.(idx, inst.start) ?? "";
    return makeDuplicatePayload(template, {
      newStart: inst.start,
      newEnd: inst.end,
      nameSuffix: suffix ? ` ${suffix}` : undefined,
    });
  });

  // Show preview
  console.log("\n🧪 Preview of events to create:");
  payloads.forEach((p, i) => {
    console.log(
      ` - #${i + 1} ${p.Name} | Start ${p.StartDate}` + (p.EndDate ? ` → End ${p.EndDate}` : "")
    );
  });

  const killIt = true;

  if (CONFIG.dryRun || killIt) {
    console.log("\n(dry run) No events were created.");
    return;
  }

  // 3) Create the events
  console.log("\n🚀 Creating events...");
  for (const [i, payload] of payloads.entries()) {
    try {
      const created = await createEvent(client, CONFIG.accountId, payload);
      console.log(
        ` ✅ Created #${i + 1}: [${created.Id}] ${created.Name} | ${created.StartDate}` +
        (created.Url ? ` | ${created.Url}` : "")
      );
    } catch (e: any) {
      console.error(` ❌ Failed to create #${i + 1}:`, e?.response?.data ?? e?.message ?? e);
    }
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("❌ Error:", e?.response?.data ?? e?.message ?? e);
  process.exit(1);
});