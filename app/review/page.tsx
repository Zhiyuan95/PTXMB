"use client";

import { useEffect, useMemo, useState } from "react";
import { faCalendarAlt, faSpa } from "@fortawesome/free-solid-svg-icons";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useSystemData } from "@/hooks/use-system-data";
import { getRecentJournalLogs, type JournalLog } from "@/lib/actions/journal";
import Navigation from "../components/navigation";
import { InsightCard, StatCard } from "./components/InsightCard";
import JournalList from "./components/journal-list";
import SearchInput from "../components/search-input";
import Footer from "../components/footer";

export default function ReviewPage() {
  const { entries } = useSystemData();
  const [logs, setLogs] = useState<JournalLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Logs
  useEffect(() => {
    getRecentJournalLogs(20).then(setLogs);
  }, []);

  // --- Analytics ---
  const chartData = useMemo(() => {
    // Generate last 7 days for the chart default
    const end = new Date();
    const start = subDays(end, 6);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayEntries = entries.filter((e) => e.entryDate === dateStr);
      // Simplify: Just count total items for now to map to the bar chart height visual
      const totalCount = dayEntries.reduce((sum, e) => sum + e.amount, 0);
      return {
        date: format(day, "EEE", { locale: zhCN }).toUpperCase(), // MON, TUE...
        fullDate: dateStr,
        value: totalCount,
      };
    });
  }, [entries]);

  // Overall Stats
  const totalCount = useMemo(
    () => entries.reduce((sum, e) => sum + e.amount, 0),
    [entries],
  );
  const activeDays = useMemo(() => {
    const uniqueDays = new Set(entries.map((e) => e.entryDate));
    return uniqueDays.size;
  }, [entries]);

  // Insights logic (Simple mock for now)
  const insight = useMemo(() => {
    const maxDay = chartData.reduce(
      (prev, current) => (current.value > prev.value ? current : prev),
      chartData[0],
    );
    return `发现你在过去一周的修行中，${maxDay?.date || "近日"}的精进程度最高。建议保持这份勇猛心，同时注意劳逸结合。`;
  }, [chartData]);

  return (
    <div className="font-sans antialiased min-h-screen pb-20">
      {/* Navigation */}
      <Navigation />
      <main className="max-w-7xl mx-auto px-8 pb-20">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <span className="text-[color:var(--primary)] font-bold tracking-widest text-xs uppercase opacity-80">
              Practice Review & Insights
            </span>
            <h2 className="font-display text-5xl font-bold mb-2 text-[color:var(--ink)]">
              精进、回望、觉察
            </h2>
            <p className="text-[color:var(--muted)] max-w-2xl text-lg">
              回顾修行的点滴，体悟心性的成长。
            </p>
          </div>
          {/* Range Selector Placeholder - Functional implementation can be ported later if needed */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="glass-card px-2 py-1.5 rounded-2xl flex items-center gap-1 text-sm font-bold uppercase tracking-wider">
              <button className="px-4 py-1.5 rounded-xl bg-[color:var(--primary)] text-white shadow-lg">
                周
              </button>
              <button className="px-4 py-1.5 rounded-xl hover:bg-white/40 text-[color:var(--muted)]">
                月
              </button>
              <button className="px-4 py-1.5 rounded-xl hover:bg-white/40 text-[color:var(--muted)]">
                年
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Stats & Charts */}
          <div className="col-span-12 lg:col-span-7 space-y-8 stagger">
            {/* Chart Section */}
            <section className="glass-card p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[color:var(--ink)]">
                    修行周度趋势
                  </h3>
                  <p className="text-xs text-[color:var(--muted)] mt-1 uppercase tracking-widest font-bold">
                    Weekly Trend
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorCount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--primary)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--primary)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--line)"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "var(--muted)",
                        fontWeight: "bold",
                      }}
                      dy={10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "var(--shadow-soft)",
                      }}
                      itemStyle={{ color: "var(--ink)", fontWeight: "bold" }}
                      cursor={{ stroke: "var(--primary)", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorCount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                icon={faCalendarAlt}
                label="本月修行天数"
                value={activeDays}
                subValue="/ 30"
                colorClass="bg-green-100 text-green-600"
                trend="Keep it up"
              />
              <StatCard
                icon={faSpa}
                label="累计修行总量"
                value={
                  totalCount > 10000
                    ? (totalCount / 10000).toFixed(1) + "W"
                    : totalCount
                }
                subValue="次"
                colorClass="bg-[color:var(--accent)] text-[color:var(--accent)]"
              />
            </div>

            {/* Insight */}
            <InsightCard text={insight} />
          </div>

          {/* Right Column: Journal List */}
          <div
            className="col-span-12 lg:col-span-5 space-y-6 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <section className="flex flex-col h-full">
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-bold text-[color:var(--ink)]">
                    修行随笔
                  </h3>
                  <span className="text-sm font-bold text-[color:var(--muted)] uppercase tracking-widest">
                    {logs.length} 篇记录
                  </span>
                </div>

                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="搜索随笔或感悟..."
                  className="w-full"
                />
              </div>

              <JournalList
                logs={logs.filter((log) =>
                  log.content.toLowerCase().includes(searchQuery.toLowerCase()),
                )}
              />
            </section>
          </div>
        </div>

        <Footer className="mt-20" />
      </main>
    </div>
  );
}
