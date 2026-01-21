import { type Entry } from "@/lib/storage";
import {
  format,
  eachDayOfInterval,
  endOfYear,
  startOfYear,
  getDay,
  parseISO,
  isSameYear,
  getYear,
} from "date-fns";
import { useState, useMemo } from "react";
import { zhCN } from "date-fns/locale";

interface HeatmapProps {
  entries: Entry[];
}

export default function Heatmap({ entries }: HeatmapProps) {
  // 1. Get available years from entries
  const availableYears = useMemo(() => {
    const years = new Set(entries.map((e) => getYear(parseISO(e.entryDate))));
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a); // Descending
  }, [entries]);

  const [selectedYear, setSelectedYear] = useState(
    availableYears[0] || new Date().getFullYear(),
  );

  // 2. Generate days for the selected year
  const daysInYear = useMemo(() => {
    const start = startOfYear(new Date(selectedYear, 0, 1));
    const end = endOfYear(new Date(selectedYear, 0, 1));
    return eachDayOfInterval({ start, end });
  }, [selectedYear]);

  // 3. Calculate intensity map
  const intensityMap = useMemo(() => {
    const map = new Map<string, { level: number; count: number }>();

    // Aggregate counts per day
    const dailyCounts = new Map<string, number>();
    entries.forEach((e) => {
      if (isSameYear(parseISO(e.entryDate), new Date(selectedYear, 0, 1))) {
        const current = dailyCounts.get(e.entryDate) || 0;
        dailyCounts.set(e.entryDate, current + 1);
      }
    });

    // Determine level 0-4
    dailyCounts.forEach((count, date) => {
      let level = 0;
      if (count >= 1) level = 1;
      if (count >= 3) level = 2;
      if (count >= 5) level = 3;
      if (count >= 8) level = 4;
      map.set(date, { level, count });
    });

    return map;
  }, [entries, selectedYear]);

  // Helper colors for intensity
  const getColorClass = (level: number) => {
    switch (level) {
      case 1:
        return "bg-[color:var(--primary)]/20";
      case 2:
        return "bg-[color:var(--primary)]/50";
      case 3:
        return "bg-[color:var(--primary)]/80";
      case 4:
        return "bg-[color:var(--primary)]";
      default:
        return "bg-stone-200 dark:bg-stone-800"; // Level 0
    }
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  // return (
  // Collapse State

  return (
    <section className="glass-card p-8 rounded-[2rem] flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold text-[color:var(--ink)]">
              {selectedYear} 年修行热力图
            </h3>
            <p
              className={`text-sm text-[color:var(--muted)] mt-1 transition-opacity ${isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}
            >
              {daysInYear.length} days of practice visualization
            </p>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[color:var(--surface)] text-[color:var(--muted)] hover:text-[color:var(--primary)] transition-colors self-start mt-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 15.75l7.5-7.5 7.5 7.5"
              />
            </svg>
          </button>
        </div>

        {/* Legend - Hide when collapsed */}
        <div
          className={`flex items-center gap-2 text-[10px] text-[color:var(--muted)] uppercase font-bold tracking-tighter hidden sm:flex transition-opacity ${isCollapsed ? "opacity-0" : "opacity-100"}`}
        >
          <span>Less</span>
          <div className={`w-3 h-3 rounded-sm ${getColorClass(0)}`}></div>
          <div className={`w-3 h-3 rounded-sm ${getColorClass(1)}`}></div>
          <div className={`w-3 h-3 rounded-sm ${getColorClass(2)}`}></div>
          <div className={`w-3 h-3 rounded-sm ${getColorClass(3)}`}></div>
          <div className={`w-3 h-3 rounded-sm ${getColorClass(4)}`}></div>
          <span>More</span>
        </div>
      </div>

      {/* Collapsible Content Wrapper */}
      <div
        className={`flex flex-col md:flex-row gap-8 transition-all duration-300 overflow-hidden ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"}`}
      >
        {/* Main Heatmap Area */}
        <div className="flex-1 min-w-0">
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            {/* Grid Container */}
            <div
              className="grid grid-flow-col gap-1 auto-cols-max"
              style={{
                gridTemplateRows: `repeat(7, minmax(0, 1fr))`,
                height: "140px",
              }}
            >
              {/* Padding for start of year alignment */}
              {Array.from({ length: getDay(daysInYear[0]) }).map((_, i) => (
                <div key={`pad-${i}`} className="w-3 h-3"></div>
              ))}

              {daysInYear.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const data = intensityMap.get(dateStr) || {
                  level: 0,
                  count: 0,
                };

                return (
                  <div
                    key={dateStr}
                    className={`w-3 h-3 rounded-sm transition-all hover:scale-125 hover:ring-2 ring-[color:var(--accent)]/50 ${getColorClass(data.level)}`}
                    title={`${format(day, "MM-dd")}: 打卡${data.count} 次`}
                  ></div>
                );
              })}
            </div>

            {/* Month Labels */}
            <div className="relative h-6 mt-2 text-[10px] text-[color:var(--muted)] font-bold uppercase pointer-events-none">
              {availableYears.length > 0 &&
                Array.from({ length: 12 }).map((_, i) => {
                  const monthDate = new Date(selectedYear, i, 1);
                  // Calculate column index
                  // 1. Find index of this date in the days array (diff in days from start of year)
                  const startOfCurrentYear = startOfYear(
                    new Date(selectedYear, 0, 1),
                  );
                  const dayIndex = Math.floor(
                    (monthDate.getTime() - startOfCurrentYear.getTime()) /
                      (1000 * 60 * 60 * 24),
                  );

                  // 2. Add padding (start day of week for Jan 1)
                  const padding = getDay(startOfCurrentYear);
                  const colIndex = Math.floor((dayIndex + padding) / 7);

                  // 3. Position: Each col is w-3 (12px) + gap-1 (4px) = 16px approx.
                  // We need to match the grid's specialized layout.
                  // Using inline style for left offset.
                  return (
                    <span
                      key={i}
                      className="absolute transform -translate-x-1" // Slight adjustment to center or align left
                      style={{ left: `${colIndex * 16}px` }}
                    >
                      {format(monthDate, "MMM", { locale: zhCN })}
                    </span>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Year Selector (Right Side) */}
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`
                    px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                    ${
                      selectedYear === year
                        ? "bg-[color:var(--primary)] text-white shadow-lg shadow-[color:var(--primary)]/30"
                        : "bg-[color:var(--surface)] text-[color:var(--muted)] hover:bg-white hover:text-[color:var(--ink)]"
                    }
                `}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
