import type { Entry, Template } from "@/lib/storage";
import { isSameWeek } from "@/lib/dates";

export const sumEntriesForDate = (
  entries: Entry[],
  templateId: string,
  date: string
) =>
  entries
    .filter(
      (entry) => entry.templateId === templateId && entry.entryDate === date
    )
    .reduce((total, entry) => total + entry.amount, 0);

export const sumEntriesAll = (entries: Entry[], templateId: string) =>
  entries
    .filter((entry) => entry.templateId === templateId)
    .reduce((total, entry) => total + entry.amount, 0);

export const sumEntriesForWeek = (
  entries: Entry[],
  templateId: string,
  date: string
) =>
  entries
    .filter(
      (entry) =>
        entry.templateId === templateId && isSameWeek(entry.entryDate, date)
    )
    .reduce((total, entry) => total + entry.amount, 0);

export const totalWithInitial = (entries: Entry[], template: Template) =>
  (template.initialTotal ?? 0) + sumEntriesAll(entries, template.id);
