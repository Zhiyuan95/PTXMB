"use client";

import { useMemo, useState } from "react";
import { type Entry, type Template, unitLabels } from "@/lib/storage";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, eachDayOfInterval, subMonths } from "date-fns";
import { zhCN } from "date-fns/locale";

interface TrendChartProps {
  entries: Entry[];
  templates: Template[];
  timeRange: "week" | "month" | "quarter" | "year";
}

export default function TrendChart({
  entries,
  templates,
  timeRange,
}: TrendChartProps) {
  // State for selected templates (Multi-select)
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  // Toggle Selection
  const toggleTemplate = (id: string) => {
    setSelectedTemplateIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((tid) => tid !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 1. Determine Date Range
  const dateRange = useMemo(() => {
    const end = new Date();
    let start = subDays(end, 7);

    switch (timeRange) {
      case "week":
        start = subDays(end, 6); // Last 7 days including today
        break;
      case "month":
        start = subDays(end, 29);
        break;
      case "quarter":
        start = subDays(end, 89);
        break;
      case "year":
        start = subMonths(end, 12);
        break;
    }
    return { start, end };
  }, [timeRange]);

  // 2. Prepare Data (Detailed Breakdown)
  const chartData = useMemo(() => {
    const days = eachDayOfInterval(dateRange);

    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");

      // Filter entries for this day
      const dailyEntries = entries.filter((e) => e.entryDate === dateStr);

      // Calculate totals per template
      const breakdown: Record<string, number> = {};
      let dailyTotal = 0;

      dailyEntries.forEach((e) => {
        // Only count if it matches filter (if filter is active)
        if (
          selectedTemplateIds.length === 0 ||
          selectedTemplateIds.includes(e.templateId)
        ) {
          breakdown[e.templateId] = (breakdown[e.templateId] || 0) + e.amount;
          dailyTotal += e.amount;
        }
      });

      return {
        date: dateStr,
        displayDate: format(day, timeRange === "year" ? "MMM" : "MM-dd", {
          locale: zhCN,
        }),
        amount: dailyTotal,
        fullDate: format(day, "yyyy年MM月dd日", { locale: zhCN }),
        ...breakdown, // Spread individual counts into the data object
      };
    });
  }, [entries, dateRange, selectedTemplateIds, timeRange]);

  // Collapse State
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="glass-card p-8 rounded-[2rem] relative overflow-hidden transition-all duration-300">
      {/* Header & Filter */}
      <div className="flex flex-col gap-6 mb-8 z-10 relative">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-[color:var(--ink)]">
                修行趋势
              </h3>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[color:var(--surface)] text-[color:var(--muted)] hover:text-[color:var(--primary)] transition-colors"
              >
                {/* Simple chevron using text or implement Icon if available. Using FA icons from other files. */}
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
            <p className="text-sm text-[color:var(--muted)] mt-1">
              {timeRange === "week" && "本周"}
              {timeRange === "month" && "过去 30 天"}
              {timeRange === "quarter" && "过去 90 天"}
              {timeRange === "year" && "过去一年"}
              的精进轨迹
            </p>
          </div>
        </div>

        {/* Multi-select Chips - Only visible when not collapsed */}
        <div
          className={`flex flex-wrap gap-2 transition-all duration-300 overflow-hidden ${isCollapsed ? "max-h-0 opacity-0" : "max-h-32 opacity-100"}`}
        >
          <button
            onClick={() => setSelectedTemplateIds([])}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedTemplateIds.length === 0
                ? "bg-[color:var(--primary)] text-white shadow-lg shadow-[color:var(--primary)]/30"
                : "bg-[color:var(--surface)] text-[color:var(--muted)] hover:bg-[color:var(--surface)]/80"
            }`}
          >
            全部
          </button>
          {templates.map((t) => {
            const isSelected = selectedTemplateIds.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleTemplate(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  isSelected
                    ? "bg-[color:var(--primary)]/10 border-[color:var(--primary)]/50 text-[color:var(--primary)]"
                    : "bg-[color:var(--surface)] border-transparent text-[color:var(--muted)] hover:bg-[color:var(--surface)]/80"
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div
        className={`h-[300px] w-full -ml-4 transition-all duration-300 overflow-hidden ${isCollapsed ? "max-h-0 opacity-0 !mt-0" : "max-h-[300px] opacity-100"}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            {/* ... */}
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.3}
                />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--line)"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 10, fontWeight: "bold" }}
              interval={
                timeRange === "year"
                  ? 30
                  : timeRange === "quarter"
                    ? 7
                    : "preserveStartEnd"
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 10, fontWeight: "bold" }}
            />
            <Tooltip
              cursor={false}
              content={(props) => (
                <CustomTooltip
                  {...props}
                  templates={templates}
                  selectedTemplateIds={selectedTemplateIds}
                />
              )}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAmount)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

// 3. Custom Tooltip (Detailed) - Moved Outside
const CustomTooltip = ({
  active,
  payload,
  label,
  templates,
  selectedTemplateIds,
}: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    // Determine which templates to show in tooltip
    const visibleTemplates = templates.filter((t: Template) => {
      const amount = data[t.id];
      // Logic: Show if amount > 0 AND (no filter OR is in filter)
      const isSelected =
        selectedTemplateIds.length === 0 || selectedTemplateIds.includes(t.id);
      return amount > 0 && isSelected;
    });

    return (
      <div className="glass-card px-4 py-3 rounded-xl text-xs backdrop-blur-xl bg-white/90 dark:bg-stone-900/90 border border-white/20 shadow-2xl min-w-[180px]">
        <p className="font-bold text-[color:var(--ink)] mb-3 border-b border-[color:var(--line)]/30 pb-2">
          {data.fullDate}
        </p>

        <div className="space-y-2">
          {visibleTemplates.map((t: Template) => (
            <div key={t.id} className="flex justify-between items-center gap-4">
              <span className="text-[color:var(--muted)]">{t.name}</span>
              <span className="font-bold text-[color:var(--primary)] font-display">
                {(data[t.id] || 0).toLocaleString()}{" "}
                <span className="text-[10px] font-sans font-normal opacity-70">
                  {unitLabels[t.unit]}
                </span>
              </span>
            </div>
          ))}

          {/* Total Row */}
          <div className="flex justify-between items-center gap-4 pt-2 mt-2 border-t border-[color:var(--line)]/50">
            <span className="font-bold text-[color:var(--ink)]">总计</span>
            <span className="font-bold text-[color:var(--ink)] font-display text-sm">
              {payload[0].value.toLocaleString()}{" "}
              <span className="text-[10px] font-sans font-normal opacity-70">
                遍
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
