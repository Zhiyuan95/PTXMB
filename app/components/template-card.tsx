"use client";

import { unitLabels, type Template, type Entry } from "@/lib/storage";
import { sumEntriesForDate, totalWithInitial } from "@/lib/records";
import { todayISO } from "@/lib/dates";

interface TemplateCardProps {
  template: Template;
  entries: Entry[];
  selectedDate: string;
  onRecord: (template: Template) => void;
}

export default function TemplateCard({
  template,
  entries,
  selectedDate,
  onRecord,
}: TemplateCardProps) {
  const dayTotal = sumEntriesForDate(entries, template.id, selectedDate);
  const overall = totalWithInitial(entries, template);
  const target = template.dailyTarget ?? 0;
  const totalTarget = template.totalTarget ?? 0;

  // Calculate progress percentages
  const totalProgress =
    totalTarget > 0 ? Math.min((overall / totalTarget) * 100, 100) : 0;
  const totalProgressLabel =
    totalProgress < 1
      ? totalProgress.toFixed(1)
      : Math.round(totalProgress).toString();
  const progress = target > 0 ? Math.min((dayTotal / target) * 100, 100) : 0;

  const minimumMet =
    template.minimumTarget && dayTotal >= template.minimumTarget;

  // Derive styles from template color
  // Default to a warm gray if no color set
  const baseColor = template.color || "#a09080";
  // Hex Alpha: 10 = ~6%, 20 = ~12%, 40 = ~25%
  const bgStyle = {
    backgroundColor: `${baseColor}35`, // Very subtle tint
    borderColor: `${baseColor}40`,     // Semi-transparent border
  };
  const elementStyle = {
    backgroundColor: baseColor,
  };

  return (
    <div 
      className="rounded-3xl border p-5 shadow-[var(--shadow-soft)] transition-all hover:shadow-md"
      style={bgStyle}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {template.category ? (
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              {template.category}
            </p>
          ) : null}
          <h3 className="mt-2 text-xl font-semibold text-[color:var(--ink)] font-serif">
            {template.name}
          </h3>
        </div>
        <button
          className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
          style={elementStyle}
          type="button"
          onClick={() => onRecord(template)}
        >
          {selectedDate === todayISO() ? "记录" : "补录"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {/* Daily Total */}
        <div className="rounded-2xl border border-white/50 bg-white/60 p-4 backdrop-blur-[2px]">
          <p className="text-xs text-[color:var(--muted)]">当日已记</p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
            {dayTotal}
            <span className="ml-1 text-sm text-[color:var(--muted)]">
              {unitLabels[template.unit]}
            </span>
          </p>
        </div>

        {/* Overall Total */}
        <div className="rounded-2xl border border-white/50 bg-white/60 p-4 backdrop-blur-[2px]">
          <p className="text-xs text-[color:var(--muted)]">累计总量</p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
            {overall}
            <span className="ml-1 text-sm text-[color:var(--muted)]">
              {unitLabels[template.unit]}
            </span>
          </p>
        </div>

        {/* Total Target Progress */}
        {totalTarget > 0 ? (
          <div className="rounded-2xl border border-white/50 bg-white/60 p-4 backdrop-blur-[2px]">
            <p className="text-xs text-[color:var(--muted)]">总目标</p>
            <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">
              {totalTarget}
              <span className="ml-1 text-sm text-[color:var(--muted)]">
                {unitLabels[template.unit]}
              </span>
            </p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              已完成 {totalProgressLabel}%
            </p>
            <div className="mt-2 h-1 rounded-full bg-[color:var(--line)]/50">
              <div
                className="h-1 rounded-full opacity-80"
                style={{ width: `${totalProgress}%`, ...elementStyle }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Daily Target Progress Bar */}
      {template.dailyTarget ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
            <span>
              今日目标 {template.dailyTarget}
              {unitLabels[template.unit]}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[color:var(--line)]/50">
            <div
              className="h-2 rounded-full opacity-80"
              style={{ width: `${progress}%`, ...elementStyle }}
            />
          </div>
        </div>
      ) : null}

      {/* Minimum Target Status */}
      {template.minimumTarget ? (
        <div className="mt-3 text-xs text-[color:var(--muted)]">
          保底目标 {template.minimumTarget}
          {unitLabels[template.unit]} · {minimumMet ? "已达成" : "尚未达成"}
        </div>
      ) : null}
    </div>
  );
}
