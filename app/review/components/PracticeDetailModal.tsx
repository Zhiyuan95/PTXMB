import { format, isToday } from "date-fns";
import { zhCN } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faQuoteLeft,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { type Entry, type Template, unitLabels } from "@/lib/storage";
import { useState, useEffect } from "react";
import Link from "next/link";

interface PracticeDetailModalProps {
  selectedDate: Date | null;
  entries: Entry[];
  templates: Template[];
  onClose: () => void;
}

export default function PracticeDetailModal({
  selectedDate,
  entries,
  templates,
  onClose,
}: PracticeDetailModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Animation Control ---
  useEffect(() => {
    if (selectedDate) {
      setIsModalOpen(true);
    } else {
      // Wait for exit animation
      const timer = setTimeout(() => setIsModalOpen(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedDate]);

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const dayEntries = selectedDate
    ? entries.filter((e) => e.entryDate === dateStr)
    : [];
  const isTodayDate = selectedDate ? isToday(selectedDate) : false;

  // Calculate daily total stats by unit
  const unitTotals = dayEntries.reduce(
    (acc, entry) => {
      const u = entry.unit;
      acc[u] = (acc[u] || 0) + entry.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (!selectedDate && !isModalOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${
        selectedDate
          ? "opacity-100 backdrop-blur-sm bg-black/5"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`
              relative w-full max-w-lg overflow-hidden rounded-[2.5rem] 
              bg-white/80 dark:bg-stone-900/80 backdrop-filter backdrop-blur-2xl 
              shadow-2xl ring-1 ring-white/50 dark:ring-white/10
              transition-all duration-500 transform
              ${
                selectedDate
                  ? "scale-100 translate-y-0 opacity-100"
                  : "scale-95 translate-y-8 opacity-50"
              }
          `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Header Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[color:var(--primary)]/20 to-[color:var(--accent)]/20 blur-3xl opacity-60 pointer-events-none"></div>

        <div className="relative p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="font-display text-4xl font-bold text-[color:var(--ink)] tracking-tight">
                  {selectedDate ? format(selectedDate, "d") : ""}
                </h2>
                <span className="text-xl font-bold text-[color:var(--muted)]">
                  {selectedDate
                    ? format(selectedDate, "MMM", { locale: zhCN })
                    : ""}
                  / {selectedDate ? format(selectedDate, "yyyy") : ""}
                </span>
              </div>
              <p className="text-sm font-bold text-[color:var(--primary)] uppercase tracking-widest opacity-80 flex items-center gap-2">
                {isTodayDate && (
                  <span className="w-2 h-2 rounded-full bg-[color:var(--primary)] animate-pulse"></span>
                )}
                {selectedDate
                  ? format(selectedDate, "EEEE", { locale: zhCN })
                  : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:rotate-90 duration-300"
            >
              <FontAwesomeIcon
                icon={faTimes}
                className="text-[color:var(--muted)]"
              />
            </button>
          </div>

          {/* Stats Overview */}
          {Object.keys(unitTotals).length > 0 && (
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 custom-scrollbar">
              {Object.entries(unitTotals).map(([unit, total]) => (
                <div
                  key={unit}
                  className=" flex-1 min-w-[100px] p-4 rounded-2xl bg-[color:var(--surface)]/50 border border-[color:var(--line)]/50 text-center"
                >
                  <div className="text-2xl font-display font-bold text-[color:var(--ink)]">
                    {total.toLocaleString()}{" "}
                    <span className="text-sm text-[color:var(--muted)] uppercase tracking-wider font-bold">
                      {unitLabels[unit as keyof typeof unitLabels] || unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List */}
          <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 -mr-2">
            {dayEntries.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[color:var(--line)]/30 mx-auto mb-4 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faQuoteLeft}
                    className="text-[color:var(--muted)]/50 text-xl"
                  />
                </div>
                <p className="text-[color:var(--muted)] text-sm mb-6">
                  此日暂无记录
                </p>
                <Link
                  href={`/?date=${dateStr}`}
                  className="px-6 py-2 rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)] text-sm font-bold hover:bg-[color:var(--primary)] hover:text-white transition-all flex items-center gap-2 mx-auto inline-flex"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  前往补录
                </Link>
              </div>
            ) : (
              dayEntries.map((entry, idx) => {
                const tmpl = templates.find((t) => t.id === entry.templateId);
                return (
                  <div
                    key={entry.id}
                    className="group p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-[color:var(--line)]/50 hover:bg-white/60 hover:border-[color:var(--primary)]/30 hover:shadow-lg transition-all duration-300 flex items-center gap-4 animate-fade-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                      style={{
                        backgroundColor: `${tmpl?.color || "gray"}15`,
                        color: tmpl?.color || "gray",
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tmpl?.color || "gray" }}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-[color:var(--ink)] text-base group-hover:text-[color:var(--primary)] transition-colors">
                        {tmpl?.name || "未知功课"}
                      </h5>
                      {entry.note && (
                        <p className="text-xs text-[color:var(--muted)] mt-1 line-clamp-1 italic opacity-80">
                          {entry.note}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-display font-bold text-[color:var(--ink)] group-hover:scale-110 display-inline-block transition-transform">
                        {entry.amount}
                      </span>
                      <span className="text-xs text-[color:var(--muted)] ml-1 font-bold lowercase opacity-60">
                        {unitLabels[entry.unit] || entry.unit}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
