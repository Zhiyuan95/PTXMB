"use client";

import { useSystemData } from "@/hooks/use-system-data";
import { useDateRange, DateRangeType } from "@/hooks/use-date-range";
import { aggregateChartData, calculateSummary } from "@/lib/analytics";
import { format } from "date-fns";
import PageHeader from "../components/page-header";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState, useRef, useEffect } from "react";
import { faChevronDown, faChevronUp, faCheck, faLayerGroup, faBullseye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import JournalEditor from "./components/journal-editor";
import { differenceInDays } from "date-fns";

const rangeOptions: { value: DateRangeType; label: string }[] = [
  { value: "week", label: "本周" },
  { value: "fortnight", label: "近半月" },
  { value: "month", label: "本月" },
  { value: "quarter", label: "本季" },
  { value: "year", label: "本年" },
  { value: "all", label: "至今" },
];

export default function ReviewPage() {
  const { templates, entries, preferences, updateDedication } = useSystemData();
  const { rangeType, setRangeType, range } = useDateRange();
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [isSnapshotExpanded, setIsSnapshotExpanded] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  
  // Dropdown state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTemplateSelection = (id: string) => {
      setSelectedTemplateIds(prev => {
          if (prev.includes(id)) {
              return prev.filter(tid => tid !== id);
          } else {
              return [...prev, id];
          }
      });
  };

  const clearSelection = () => {
      setSelectedTemplateIds([]); // Empty means "All"
      setIsFilterOpen(false);
      setShowTarget(false); // Reset target view
  };
    
  // Prepare Data
  const filteredTemplates = useMemo(() => {
    if (selectedTemplateIds.length === 0) return templates;
    return templates.filter((t) => selectedTemplateIds.includes(t.id));
  }, [templates, selectedTemplateIds]);

  const chartData = useMemo(
    () => aggregateChartData(filteredTemplates, entries, range),
    [filteredTemplates, entries, range],
  );

  const summary = useMemo(
    () =>
      calculateSummary(
        entries,
        range,
        selectedTemplateIds.length === 0 ? undefined : selectedTemplateIds,
      ),
    [entries, range, selectedTemplateIds],
  );

  // Today's Snapshot Data
  const todaySnapshot = useMemo(() => {
    // 1. Calculate today's total
    const today = new Date(); // Local today
    const todayEntries = entries.filter((e) => {
      const entryDate = e.entryDate;
      const todayStr = format(today, "yyyy-MM-dd");
      return entryDate === todayStr;
    });

    const totalCount = todayEntries.reduce((sum, e) => sum + e.amount, 0);

    // 2. Aggregate Details
    const templateTotals: Record<string, number> = {};
    todayEntries.forEach((e) => {
      if (!templateTotals[e.templateId]) templateTotals[e.templateId] = 0;
      templateTotals[e.templateId] += e.amount;
    });

    const details = Object.entries(templateTotals)
      .map(([tId, amount]) => {
        const t = templates.find((temp) => temp.id === tId);
        return {
          id: tId,
          name: t?.name || "未知",
          color: t?.color || "var(--muted)",
          amount,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { totalCount, details };
  }, [entries, templates]);

    // Derive selected templates for display (single or multiple)
  const activeSelectedTemplates = useMemo(() => {
    if (selectedTemplateIds.length > 0) {
      return templates.filter((t) => selectedTemplateIds.includes(t.id));
    }
    return [];
  }, [selectedTemplateIds, templates]);

  // Target Calculation
  const targetStats = useMemo(() => {
    // Only available when exactly 1 template is selected
    if (activeSelectedTemplates.length !== 1) return null;

    const template = activeSelectedTemplates[0];
    const dailyTarget = template.dailyTarget || 0;
    
    if (dailyTarget === 0) return null;

    if (!range.start) return null;
    const daysInPeriod = differenceInDays(range.end, range.start) + 1;
    const periodTarget = dailyTarget * daysInPeriod;
    const actualTotal = summary.totalCount;
    const gap = actualTotal - periodTarget;

    return {
        dailyTarget,
        periodTarget,
        actualTotal,
        gap,
        progress: Math.min(Math.round((actualTotal / periodTarget) * 100), 999), // Cap at reasonable number
    };

  }, [activeSelectedTemplates, range, summary.totalCount]);


  return (
    <div className="min-h-screen pb-20">
      <div className="mx-auto max-w-2xl px-6 pt-10">
        <PageHeader
          eyebrow="Review"
          title="修行洞察"
          description="回顾过往的积累，见证一点一滴的改变。"
        />

        {/* ... (Today's Snapshot Section - Unchanged) ... */}
        {/* ... (Summary Cards code remains the same but omitted here for brevity if replace_file_content cannot handle huge skips, but I will assume I am replacing the surrounding logic to support imports and state, so I will replace from imports down to return start, then jump to chart section) */}

        {/* REPLACING WHOLE COMPONENT STRUCTURE TO BE SAFE WITH IMPORTS AND STATE */}
        {/* Actually, the file is large. I will use multi-chunk replace effectively */}
        
        {/* ... (Today Section Skipped) ... */}
         <div className="relative mt-8 overflow-hidden rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-sm transition-all duration-300">
          <div className="relative z-10">
            {/* Header Section */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[color:var(--muted)]">
                  今日修持总量
                </p>
                <p className="mt-2 font-serif text-3xl font-medium text-[color:var(--ink)]">
                  {todaySnapshot.totalCount.toLocaleString()}
                </p>
              </div>

              {/* Expand Toggle */}
              {todaySnapshot.details.length > 0 && (
                <button
                  onClick={() => setIsSnapshotExpanded(!isSnapshotExpanded)}
                  className="flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-white/50 px-3 py-1.5 text-xs font-medium text-[color:var(--muted)] backdrop-blur-sm transition-colors hover:bg-white hover:text-[color:var(--ink)]"
                >
                  {isSnapshotExpanded ? "收起明细" : "查看明细"}
                  <FontAwesomeIcon
                    icon={isSnapshotExpanded ? faChevronUp : faChevronDown}
                  />
                </button>
              )}
            </div>

            {/* Top Item Summary (Only shown when collapsed and has data) */}
            {!isSnapshotExpanded && todaySnapshot.details.length > 0 && (
              <div className="mt-4 flex items-center gap-2 border-t border-[color:var(--line)] pt-4">
                <span className="text-xs text-[color:var(--muted)]">
                  今日之最:
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: todaySnapshot.details[0].color }}
                  />
                  <span className="font-serif text-sm text-[color:var(--ink)]">
                    {todaySnapshot.details[0].name}
                  </span>
                  <span className="text-xs text-[color:var(--muted)]">
                    {todaySnapshot.details[0].amount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Expanded List */}
            {isSnapshotExpanded && (
              <div className="mt-4 animate-fade-in border-t border-[color:var(--line)] pt-2">
                <div className="max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[color:var(--line)]">
                  {todaySnapshot.details.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b border-[color:var(--line)]/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-serif text-sm text-[color:var(--ink)]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[color:var(--ink)]">
                        {item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {todaySnapshot.details.length === 0 && (
              <p className="mt-4 text-xs text-[color:var(--muted)]">
                今日暂无记录，随喜您的精进之心！
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-serif text-lg font-medium text-[color:var(--ink)]">
            历史回顾
          </h3>
          <div className="flex gap-2">
            {/* Templates Filter (Multi-select) */}
            <div className="relative" ref={filterRef}>
                <button
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                        isFilterOpen || selectedTemplateIds.length > 0
                            ? "border-[color:var(--accent)] bg-[color:var(--surface)] text-[color:var(--ink)]"
                            : "border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--ink)]"
                    }`}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    <FontAwesomeIcon icon={faLayerGroup} className={selectedTemplateIds.length > 0 ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]"} />
                    <span>
                        {selectedTemplateIds.length === 0 
                            ? "所有功课" 
                            : `已选 ${selectedTemplateIds.length} 项`}
                    </span>
                    <FontAwesomeIcon icon={faChevronDown} className={`text-xs text-[color:var(--muted)] transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {isFilterOpen && (
                    <div className="absolute left-0 mt-2 w-56 origin-top-left overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white shadow-xl animate-fade-in z-50">
                       <div className="p-2">
                           <button
                               onClick={clearSelection}
                               className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                                   selectedTemplateIds.length === 0
                                     ? "bg-[color:var(--accent)] text-white font-medium" 
                                     : "text-[color:var(--ink)] hover:bg-[color:var(--surface)]"
                               }`}
                           >
                               <span>所有功课</span>
                               {selectedTemplateIds.length === 0 && <FontAwesomeIcon icon={faCheck} />}
                           </button>
                           
                           <div className="my-1 h-px bg-[color:var(--line)]/50" />
                           
                           <div className="max-h-60 overflow-y-auto">
                               {templates.map((t) => {
                                   const isSelected = selectedTemplateIds.includes(t.id);
                                   return (
                                       <button
                                           key={t.id}
                                           onClick={() => toggleTemplateSelection(t.id)}
                                           className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[color:var(--ink)] transition-colors hover:bg-[color:var(--surface)]"
                                       >
                                           <div className="flex items-center gap-2">
                                               <div 
                                                    className={`h-3 w-3 rounded-full border ${isSelected ? "border-transparent" : "border-[color:var(--line)]"}`}
                                                    style={{ backgroundColor: isSelected ? (t.color || "var(--accent)") : "transparent" }}
                                               />
                                               <span className={isSelected ? "font-medium" : ""}>{t.name}</span>
                                           </div>
                                           {isSelected && <FontAwesomeIcon icon={faCheck} className="text-[color:var(--accent)]" />}
                                       </button>
                                   );
                               })}
                           </div>
                       </div>
                    </div>
                )}
            </div>

            {/* Range Filter */}
            <div className="relative">
              <select
                className="appearance-none rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] py-2 pl-4 pr-9 text-sm font-medium text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                value={rangeType}
                onChange={(e) => setRangeType(e.target.value as DateRangeType)}
              >
                {rangeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 relative overflow-hidden">
             {/* Background Decoration for selected templates */}
             {activeSelectedTemplates.length > 0 && (
                 <div 
                    className="absolute right-0 top-0 h-16 w-16 translate-x-1/3 -translate-y-1/3 rounded-full opacity-20 blur-xl"
                    style={{ backgroundColor: activeSelectedTemplates[0].color || "var(--accent)" }}
                 />
             )}
            
            <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-1.5 min-h-[1.25rem] mb-1">
                    <span className="text-xs font-medium text-[color:var(--muted)]">累计修持</span>
                    {activeSelectedTemplates.map((t) => (
                      <span
                        key={t.id}
                        className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] text-[color:var(--ink)] whitespace-nowrap"
                      >
                        {t.name}
                      </span>
                    ))}
                </div>
                <p className="mt-1 font-serif text-2xl text-[color:var(--ink)]">
                  {summary.totalCount.toLocaleString()}
                </p>
                {showTarget && targetStats && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-[color:var(--muted)]">
                        <span>目标: {targetStats.periodTarget.toLocaleString()}</span>
                        <span className={targetStats.gap >= 0 ? "text-green-600" : "text-red-500"}>
                            {targetStats.gap >= 0 ? "+" : ""}{targetStats.gap.toLocaleString()}
                        </span>
                    </div>
                )}
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5">
            <p className="text-xs font-medium text-[color:var(--muted)] h-5 flex items-center">
              精进天数
            </p>
            <p className="mt-1 font-serif text-2xl text-[color:var(--ink)]">
              {summary.uniqueDays}{" "}
              <span className="text-sm text-[color:var(--muted)]">天</span>
            </p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="mt-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-medium text-[color:var(--muted)] whitespace-nowrap">
                趋势分析
              </h4>
              {activeSelectedTemplates.map((t) => (
                  <div key={t.id} className="flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-2 py-0.5 animate-fade-in">
                      <div 
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: t.color || "var(--accent)" }}
                      />
                      <span className="text-xs font-medium text-[color:var(--ink)]">
                          {t.name}
                      </span>
                  </div>
              ))}
            </div>

            {targetStats && (
                <button
                    onClick={() => setShowTarget(!showTarget)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        showTarget
                            ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                            : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                    }`}
                >
                    <FontAwesomeIcon icon={faBullseye} />
                    {showTarget ? "隐藏目标" : "显示目标"}
                </button>
            )}
          </div>
          <div className="h-[500px] w-full rounded-3xl border border-[color:var(--line)] bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  {templates.map((t) => (
                    <linearGradient
                      key={t.id}
                      id={`color-${t.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={t.color || "#e0b090"}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={t.color || "#e0b090"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis
                  dataKey="dateKey"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  minTickGap={30}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  width={30}
                />
                <Tooltip
                  cursor={{
                    stroke: "var(--muted)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      // Start with the total (if available in payload from an invisible line, or calc it)
                      const areas = payload.filter((p) => p.dataKey !== "targetLine");
                      const total = areas.reduce(
                        (sum, entry) => sum + (entry.value as number),
                        0,
                      );

                      // Sort areas by value
                      const sortedAreas = [...areas].sort(
                        (a, b) => (b.value as number) - (a.value as number),
                      );

                      return (
                        <div className="rounded-xl border border-[color:var(--line)] bg-white p-3 shadow-lg">
                          <p className="mb-2 text-xs font-medium text-[color:var(--muted)]">
                            {label}
                          </p>
                          {sortedAreas.map((entry: any) => (
                            <div
                              key={entry.name}
                              className="flex items-center justify-between gap-4 text-xs"
                            >
                              <span style={{ color: entry.color }}>
                                {entry.name}
                              </span>
                              <span
                                style={{ color: entry.color }}
                                className="mt-1 font-semibold text-[color:var(--ink)]"
                              >
                                {entry.value}
                              </span>
                            </div>
                          ))}
                          
                           {showTarget && targetStats && (
                                <div className="mt-2 flex items-center justify-between gap-4 text-xs text-[color:var(--muted)]">
                                    <span>日课目标:</span>
                                    <span>{targetStats?.dailyTarget}</span>
                                </div>
                           )}

                          <div className="my-2 h-px bg-[color:var(--line)]" />
                          <div className="flex items-center justify-between gap-4 text-xs font-bold">
                            <span className="text-[color:var(--muted)]">
                              总计:
                            </span>
                            <span className="text-[color:var(--ink)]">
                              {total}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {templates.map((t) => (
                  <Area
                    key={t.id}
                    type="monotone"
                    dataKey={t.name}
                    stackId="1" // Stack for total height
                    stroke={t.color || "#e0b090"}
                    fill={`url(#color-${t.id})`}
                    strokeWidth={2}
                    fillOpacity={0.8}
                    animationDuration={1000}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Journal */}
        <div className="mt-8">
            <JournalEditor />
        </div>

        {/* Dedication Section */}
        <div className="mt-10 mb-8">
          <h4 className="mb-3 text-sm font-medium text-[color:var(--muted)]">
            回向文
          </h4>
          <textarea
            className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--muted)]/50 focus:border-[color:var(--accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]"
            rows={4}
            placeholder="愿以此功德，普及于一切..."
            value={preferences?.dedicationText || ""}
            onChange={(e) => updateDedication(e.target.value)}
          />
          <p className="mt-2 text-xs text-[color:var(--muted)] text-right">
            自动保存
          </p>
        </div>
      </div>
    </div>
  );
}
