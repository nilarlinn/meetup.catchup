// Turns a DB time value like "17:30:00" into "5:30 PM" for display.
export function formatTime(time: string | null | undefined): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Builds a display string from an event's start_time / end_time, e.g.
// "2:00 PM - 4:00 PM", "2:00 PM" (start only), or "" if neither is set.
export function formatEventTimeRange(startTime?: string | null, endTime?: string | null): string {
  if (startTime && endTime) return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  if (startTime) return formatTime(startTime);
  if (endTime) return `Until ${formatTime(endTime)}`;
  return "";
}
