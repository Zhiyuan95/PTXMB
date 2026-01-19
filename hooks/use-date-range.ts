"use client";

import { useState, useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  startOfYear,
  endOfYear,
  startOfQuarter,
  endOfQuarter,
} from "date-fns";

export type DateRangeType =
  | "week"
  | "fortnight"
  | "month"
  | "quarter"
  | "year"
  | "all";

export interface DateRange {
  start: Date | null; // null indicates "from the beginning"
  end: Date;
  label: string;
}

export function useDateRange() {
  const [rangeType, setRangeType] = useState<DateRangeType>("week");

  const range = useMemo<DateRange>(() => {
    const now = new Date();
    // Reset time to end of day for 'end'
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    switch (rangeType) {
      case "week":
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }), // Monday start
          end: endOfWeek(now, { weekStartsOn: 1 }),
          label: "本周",
        };
      case "fortnight":
        return {
          start: subDays(now, 14),
          end: endOfToday,
          label: "近半月",
        };
      case "month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          label: "本月",
        };
      case "quarter":
        return {
          start: startOfQuarter(now),
          end: endOfQuarter(now),
          label: "本季",
        };
      case "year":
        return {
          start: startOfYear(now),
          end: endOfYear(now),
          label: "本年",
        };
      case "all":
        return {
            start: null,
            end: endOfToday,
            label: "至今"
        };
      default:
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
          label: "本周",
        };
    }
  }, [rangeType]);

  return { rangeType, setRangeType, range };
}
