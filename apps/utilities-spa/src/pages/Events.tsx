import { useEvents } from "@hooks/useEvents";
import { Stack, TextField, CircularProgress, Typography } from "@mui/material";
import EventListItem from "@components/EventListItem";

export default function Events() {
  const { data: events = [], isLoading, isError, search, setSearch } = useEvents({
    debounceMs: 400,
    top: 50,
  });

  return (
    <section>
      <Typography variant="h4" sx={{ mb: 2 }}>Events</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          label="Search events…"
          fullWidth
          size="small"
        />
        {isLoading && <CircularProgress size={24} sx={{ alignSelf: "center" }} />}
      </Stack>

      {isError && <Typography color="error">Failed to load events</Typography>}

      <Stack spacing={1}>
        {events.map((e: any) => (
          <EventListItem key={e.Id} event={e} />
        ))}
      </Stack>
    </section>
  );
}