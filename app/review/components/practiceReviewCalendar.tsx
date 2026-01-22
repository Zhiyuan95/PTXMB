import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
  isToday,
  isSameDay,
  subMonths,
  addMonths,
} from "date-fns";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { type Entry, type Template } from "@/lib/storage";
import PracticeDetailModal from "./PracticeDetailModal";

interface CalendarHeatmapProps {
  entries: Entry[];
  templates?: Template[];
}

export default function PracticeReviewCalendar({
  entries,
  templates = [],
}: CalendarHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // DEBUG: Help user locate file
  console.log("Rendering PracticeReviewCalendar", { entries, templates });

  // --- Calendar Logic ---
  // --- Calendar Logic ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = getDay(monthStart);
  const paddingFront = (startDay + 6) % 7;

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayEntries = entries.filter((e) => e.entryDate === dateStr);

    // Group by template to get colors
    const dots = dayEntries
      .map((e) => {
        const tmpl = templates.find((t) => t.id === e.templateId);
        return { color: tmpl?.color || "var(--primary)", id: e.id };
      })
      .slice(0, 5);

    return {
      hasEntry: dayEntries.length > 0,
      count: dayEntries.length,
      dots,
      dayEntries,
    };
  };

  // Collapse State
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="space-y-8 relative">
      <PracticeDetailModal 
        selectedDate={selectedDate}
        entries={entries}
        templates={templates}
        onClose={() => setSelectedDate(null)}
      />

      {/* Calendar Section */}
      <section className="glass-card p-8 rounded-[2rem] transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <h3 className="font-display text-2xl font-bold text-[color:var(--ink)]">
                {format(currentDate, "yyyy年 M月")} 修行日历
             </h3>
             <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[color:var(--surface)] text-[color:var(--muted)] hover:text-[color:var(--primary)] transition-colors"
                title={isCollapsed ? "Expand" : "Collapse"}
             >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                 </svg>
             </button>
          </div>
          
          {/* Controls - Hide when collapsed for cleaner look, or keep? Keep them. */}
          <div className={`flex gap-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-lg transition-colors text-[color:var(--ink)]"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-lg transition-colors text-[color:var(--ink)]"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>

        <div className={`transition-all duration-500 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
            <div className="grid grid-cols-7 gap-4 mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                <div
                key={d}
                className={`text-center text-xs font-bold uppercase tracking-widest ${
                    i >= 5
                    ? "text-[color:var(--accent)]"
                    : "text-[color:var(--muted)]"
                }`}
                >
                {d.charAt(0)}
                </div>
            ))}
            </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3 md:gap-4">
          {/* Padding Days */}
          {Array.from({ length: paddingFront }).map((_, i) => (
            <div
              key={`pad-${i}`}
              className="h-14 sm:h-20 md:h-24 glass-card bg-black/5 border-none rounded-2xl p-2 opacity-20"
            />
          ))}

          {/* Days */}
          {daysInMonth.map((day) => {
            const { hasEntry, count, dots } = getDayStatus(day);
            const isCurrentDay = isToday(day);
            const isSelected = selectedDate
              ? isSameDay(day, selectedDate)
              : false;

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`h-14 sm:h-20 md:h-24 rounded-2xl p-2 flex flex-col justify-between transition-all cursor-pointer relative group overflow-hidden ${
                  hasEntry
                    ? "glass-card border-2 border-[color:var(--primary)]/40 bg-[color:var(--surface)] hover:scale-[1.02] hover:shadow-lg"
                    : "glass-card border border-[color:var(--line)] hover:bg-white/60 hover:border-[color:var(--primary)]/20"
                } ${isCurrentDay ? "ring-2 ring-[color:var(--primary)]" : ""} ${isSelected ? "ring-4 ring-[color:var(--accent)]/50 scale-[0.98]" : ""}`}
              >
                {/* Today's background highlight */}
                {isCurrentDay && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--primary)]/20 to-[color:var(--accent)]/10 rounded-2xl -z-10"></div>
                )}

                <div className="flex justify-between items-start z-10">
                  <span
                    className={`text-xs font-bold ${
                      isCurrentDay
                        ? "text-[color:var(--primary)]"
                        : hasEntry
                          ? "text-[color:var(--primary)]"
                          : "text-[color:var(--muted)]"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Dots visualization */}
                {hasEntry && (
                  <div className="flex flex-wrap gap-1 content-end z-10 transition-transform group-hover:-translate-y-1">
                    {dots.map((dot, idx) => (
                      <span
                        key={`${dot.id}-${idx}`}
                        className="w-1.5 h-1.5 rounded-full shadow-sm"
                        style={{ backgroundColor: dot.color }}
                      ></span>
                    ))}
                    {count > 5 && (
                      <span className="text-[8px] text-[color:var(--muted)] font-bold">
                        +{count - 5}
                      </span>
                    )}
                  </div>
                )}

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            );
          })}
        </div>
        </div>
      </section>
    </div>
  );
}
