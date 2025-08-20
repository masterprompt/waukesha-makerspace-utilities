import { useEffect, useState } from "react";
import { listEvents } from "@lib/api";

export default function Events() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async () => {
    setLoading(true); setError(null);
    try {
      const data = await listEvents({ search: q });
      setEvents(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runSearch(); /* initial */ }, []);

  return (
    <section>
      <h1>Events</h1>
      <div style={{ display: "flex", gap: 8, margin: "0.75rem 0" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events..."
          style={{ padding: "0.5rem", flex: 1 }}
        />
        <button onClick={runSearch} disabled={loading} style={{ padding: "0.5rem 0.75rem" }}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <ul style={{ padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
        {events.map((e) => (
          <li key={e.Id} style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "0.75rem" }}>
            <div style={{ fontWeight: 600 }}>{e.Name}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              {e.StartDate}{e.EndDate ? ` → ${e.EndDate}` : ""}{e.Url ? ` • ` : ""}{e.Url && <a href={e.Url} target="_blank">View</a>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}