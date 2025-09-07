import { Link as RouterLink } from "react-router-dom";
import { Card, CardContent, Stack, Typography, Button } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { EventLink } from "@components/EventLink";

type EventLike = {
  Id: number;
  Name: string;
  StartDate?: string;
  EndDate?: string;
  Url?: string;
};

function formatLocalRange(startISO?: string, endISO?: string) {
  if (!startISO) return "";
  const start = new Date(startISO);
  const end = endISO ? new Date(endISO) : undefined;

  const dateFmt = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const timeFmt = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const datePart = dateFmt.format(start);
  const startTime = timeFmt.format(start);

  if (!end) return `${datePart} • ${startTime}`;

  // Same day? show a compact time range; otherwise show full second timestamp
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    const endTime = timeFmt.format(end);
    // remove timezone from the first time to avoid duplication
    const startTimeNoTZ = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(start);
    return `${datePart} • ${startTimeNoTZ}–${endTime}`;
  } else {
    const endStamp = `${dateFmt.format(end)} • ${timeFmt.format(end)}`;
    return `${datePart} • ${startTime} → ${endStamp}`;
  }
}

export default function EventListItem({ event }: { event: EventLike }) {
  const when = formatLocalRange(event.StartDate, event.EndDate);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={600}>
              {event.Name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {when}
            </Typography>
            <Typography variant="body2">
              <EventLink eventId={event.Id}>View on site</EventLink>
            </Typography>
          </Stack>

          <Button
            variant="contained"
            size="small"
            startIcon={<ContentCopyIcon />}
            component={RouterLink}
            to={`/duplicate?templateId=${event.Id}`}
          >
            Duplicate
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}