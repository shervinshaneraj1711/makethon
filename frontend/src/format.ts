export function formatNumber(value: number | null | undefined, digits = 2): string {
  return value == null ? "—" : value.toFixed(digits);
}

export function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "Waiting for data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
}

export function formatDeviceTimestamp(value: string): string {
  const [date, time] = value.split("T");
  return date && time ? `${date} ${time}` : value;
}

export function connectionLabel(state: string): string {
  return state.replaceAll("_", " ");
}

