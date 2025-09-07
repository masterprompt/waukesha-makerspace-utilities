import { useCallback } from "react";
import { Stack, Button, Paper } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DateTimeRow, { type DateTimeRowValue } from "@components/DateTimeRow";
import dayjs, { Dayjs } from "dayjs";

export type StartDateRowsValue = DateTimeRowValue[];

type Props = {
  value: StartDateRowsValue;
  onChange: (next: StartDateRowsValue) => void;
  addLabel?: string;
};

function newRow(at?: Dayjs): DateTimeRowValue {
  const now = at ?? dayjs();
  return {
    id: Math.random().toString(36).slice(2),
    date: now.startOf("day"),
    time: now.minute(0).second(0).millisecond(0),
  };
}

export default function StartDateRows({ value, onChange, addLabel = "Add another" }: Props) {
  const handleAdd = useCallback(() => {
    onChange([...value, newRow()]);
  }, [value, onChange]);

  const handleDelete = useCallback(
    (id: string) => {
      if (value.length === 1) return; // keep at least one row
      onChange(value.filter((r) => r.id !== id));
    },
    [value, onChange]
  );

  const handleChangeRow = useCallback(
    (nextRow: DateTimeRowValue) => {
      onChange(value.map((r) => (r.id === nextRow.id ? nextRow : r)));
    },
    [value, onChange]
  );

  return (
    <Stack spacing={1}>
      {value.map((row, idx) => (
        <Paper key={row.id} variant="outlined" sx={{ p: 1.5 }}>
          <DateTimeRow
            value={row}
            index={idx}
            onChange={handleChangeRow}
            onDelete={handleDelete}
            disableDelete={value.length === 1}
          />
        </Paper>
      ))}
      <Button
        variant="outlined"
        startIcon={<AddCircleOutlineIcon />}
        onClick={handleAdd}
        sx={{ alignSelf: "flex-start" }}
      >
        {addLabel}
      </Button>
    </Stack>
  );
}