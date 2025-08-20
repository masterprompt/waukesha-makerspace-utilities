/**
 * Frontend API client (no secrets). It reads the base URL from localStorage.
 * You'll proxy to a tiny backend that talks to Wild Apricot using your API key.
 */

function base() {
  const url = localStorage.getItem("UTILS_API_BASE") || "/api";
  return url.replace(/\/+$/, "");
}

export async function listEvents(opts: { search?: string } = {}) {
  const u = new URL(base() + "/events", window.location.origin);
  if (opts.search) u.searchParams.set("q", opts.search);
  const res = await fetch(u.toString());
  if (!res.ok) throw new Error(`Failed to load events: ${res.status}`);
  return res.json();
}

export async function duplicateFromTemplate(templateId: number, starts: string[]) {
  const res = await fetch(base() + "/events/duplicate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateId, starts })
  });
  if (!res.ok) throw new Error(`Duplicate failed: ${res.status}`);
  return res.json();
}