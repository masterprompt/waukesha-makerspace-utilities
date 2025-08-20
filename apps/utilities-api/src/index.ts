import "dotenv/config";
import express from "express";
import cors from "cors";
import eventsRouter from "./routes/events.js";

const app = express();
const PORT = Number(process.env.PORT || 8787);

app.use(cors({ origin: true, credentials: false }));
app.use(express.json());

// Health
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "utilities-api", time: new Date().toISOString() });
});

// Events routes
app.use("/api", eventsRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    details: err.response?.data ?? undefined
  });
});

app.listen(PORT, () => {
  console.log(`utilities-api listening on http://localhost:${PORT}`);
});