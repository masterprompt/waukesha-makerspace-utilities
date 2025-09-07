import { IconButton, Grid } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import type { Dayjs } from "dayjs";

export type DateTimeRowValue = {
  id: string;
  date: Dayjs | null;
  time: Dayjs | null;
};

type Props = {
  value: DateTimeRowValue;
  index: number;
  disableDelete?: boolean;
  onChange: (next: DateTimeRowValue) => void;
  onDelete: (id: string) => void;
};

export default function DateTimeRow({
  value,
  index,
  disableDelete,
  onChange,
  onDelete,
}: Props) {
  return (
    <Grid container spacing={1.5} alignItems="center">
      <Grid size={{ xs: 12, sm: 5 }}>
        <DatePicker
          label={`Date ${index + 1}`}
          value={value.date}
          onChange={(v) => onChange({ ...value, date: v })}
          slotProps={{ textField: { size: "small", fullWidth: true } }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 5 }}>
        <TimePicker
          label="Time"
          value={value.time}
          onChange={(v) => onChange({ ...value, time: v })}
          slotProps={{ textField: { size: "small", fullWidth: true } }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }} textAlign="right">
        <IconButton
          aria-label="Remove row"
          onClick={() => onDelete(value.id)}
          disabled={disableDelete}
        >
          <DeleteOutlineIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}