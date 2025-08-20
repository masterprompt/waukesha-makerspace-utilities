import { useEffect, useState } from "react";

export default function Settings() {
  const [apiBase, setApiBase] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("UTILS_API_BASE");
    if (saved) setApiBase(saved);
  }, []);

  const save = () => {
    localStorage.setItem("UTILS_API_BASE", apiBase);
    alert("Saved.");
  };

  return (
    <section>
      <h1>Settings</h1>
      <p>Point this UI at your local backend/proxy (do not put secrets in the browser).</p>
      <label>
        API Base URL
        <input
          value={apiBase}
          onChange={(e) => setApiBase(e.target.value)}
          placeholder="http://localhost:8787/api"
          style={{ width: "100%", padding: "0.5rem", marginTop: 6 }}
        />
      </label>
      <div style={{ marginTop: 10 }}>
        <button onClick={save} style={{ padding: "0.5rem 0.75rem" }}>Save</button>
      </div>
    </section>
  );
}