import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { listEvents } from "@lib/api";

type UseEventsOptions = {
  initialSearch?: string;
  debounceMs?: number;
  top?: number;
  skip?: number;
  startDateFrom?: string;
  endDateTo?: string;
};

export function useEvents(opts: UseEventsOptions = {}) {
  const [search, setSearch] = useState(opts.initialSearch ?? "");
  const [debounced] = useDebounce(search, opts.debounceMs ?? 400);

  const query = useQuery({
    queryKey: ["events", { q: debounced, top: opts.top, skip: opts.skip, s: opts.startDateFrom, e: opts.endDateTo }],
    queryFn: () =>
      listEvents({
        search: debounced || undefined,
        top: opts.top,
        skip: opts.skip,
        startDateFrom: opts.startDateFrom,
        endDateTo: opts.endDateTo,
      }),
  });

  return {
    ...query,     // data, isLoading, isError, refetch, etc.
    search,
    setSearch,    // bind to input
  };
}
