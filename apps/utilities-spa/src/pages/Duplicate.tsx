import { useState } from "react";
import { duplicateFromTemplate } from "@lib/api";

export default function Duplicate() {
  const [templateId, setTemplateId] = useState<number | "">("");
  const [dates, setDates] = useState<string>("2025-09-01T18:00:00,2025-09-08T18:00:00");
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    if (!templateId) return;
    setStatus("Working...");
    try {
      const starts = dates.split(",").map(s => s.trim()).filter(Boolean);
      const created = await duplicateFromTemplate(Number(templateId), starts);
      setStatus(`Created ${created.length} events.`);
    } catch (e: any) {
      setStatus(`Error: ${e?.message ?? e}`);
    }
  };

  return (
    <section>
      <h1>Duplicate Events</h1>
      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <label>
          Template Event ID
          <input
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : "")}
            placeholder="e.g. 78910"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </label>

        <label>
          Start dates (comma-separated ISO)
          <textarea
            rows={3}
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", fontFamily: "monospace" }}
          />
        </label>

        <button onClick={submit} style={{ padding: "0.6rem 0.8rem", width: "fit-content" }}>
          Duplicate
        </button>

        {status && <p>{status}</p>}
      </div>
    </section>
  );
}