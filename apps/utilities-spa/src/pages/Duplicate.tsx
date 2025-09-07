import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { duplicateFromTemplate } from "@lib/api";
import { Stack, TextField, Button, Typography, Alert } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import StartDateRows, { type StartDateRowsValue } from "@components/StartDateRows";
import dayjs from "dayjs";

/** combine local date+time into a single ISO string in UTC (server-friendly) */
function toISO(date: dayjs.Dayjs | null, time: dayjs.Dayjs | null): string | null {
  if (!date || !time) return null;
  const combined = date
    .hour(time.hour())
    .minute(time.minute())
    .second(0)
    .millisecond(0);
  return new Date(combined.toDate()).toISOString();
}

export default function Duplicate() {
  const [params] = useSearchParams();
  const [templateId, setTemplateId] = useState<number | "">("");
  const [rows, setRows] = useState<StartDateRowsValue>([
    { id: Math.random().toString(36).slice(2), date: dayjs().startOf("day"), time: dayjs().minute(0).second(0).millisecond(0) }
  ]);

  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Prefill from ?templateId=123
  useEffect(() => {
    const v = params.get("templateId");
    if (v && /^\d+$/.test(v)) setTemplateId(Number(v));
  }, [params]);

  // Assemble ISO starts whenever rows change
  const starts: string[] = useMemo(
    () =>
      rows
        .map((r) => toISO(r.date, r.time))
        .filter((x): x is string => Boolean(x)),
    [rows]
  );

  const submit = async () => {
    setError(null);
    setStatus(null);
    if (!templateId) {
      setError("Please provide a template event ID.");
      return;
    }
    if (starts.length === 0) {
      setError("Please add at least one valid date & time.");
      return;
    }
    try {
      setStatus("Working…");
      const created = await duplicateFromTemplate(Number(templateId), starts);
      setStatus(`Created ${created.length} events.`);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    }
  };

  return (
    <section>
      <Typography variant="h4" sx={{ mb: 2 }}>Duplicate Events</Typography>

      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        {!!error && <Alert severity="error">{error}</Alert>}
        {!!status && <Alert severity="info">{status}</Alert>}

        <TextField
          label="Template Event ID"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : "")}
          placeholder="e.g. 78910"
          size="small"
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <StartDateRows value={rows} onChange={setRows} />
        </LocalizationProvider>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={submit}
          >
            Duplicate
          </Button>
          <Typography variant="body2" color="text.secondary">
            {starts.length ? `Will create ${starts.length} event${starts.length > 1 ? "s" : ""}.` : ""}
          </Typography>
        </Stack>
      </Stack>
    </section>
  );
}