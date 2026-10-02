import { z } from "zod";

export const eventTypes = [
  "possible_seizure",
  "woke_up",
  "went_to_sleep",
  "other",
] as const;
export type EventType = (typeof eventTypes)[number];
export const labels: Record<EventType, string> = {
  possible_seizure: "Possible seizure",
  woke_up: "Woke up",
  went_to_sleep: "Went to sleep",
  other: "Other event",
};
export type DiaryEvent = {
  id: string;
  type: EventType;
  occurredAt: string;
  notes: string;
};
export const eventInput = z.object({
  type: z.enum(eventTypes),
  notes: z
    .string()
    .trim()
    .max(2000, "Keep notes to 2,000 characters or fewer."),
});
export function localDateTime(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function parseLocalDateTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) || localDateTime(parsed) !== value
    ? null
    : parsed;
}
export const timeLabel = (date: Date) =>
  date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
export const dateLabel = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
