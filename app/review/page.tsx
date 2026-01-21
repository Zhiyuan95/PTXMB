"use client";

import { useEffect, useMemo, useState } from "react";
import { useSystemData } from "@/hooks/use-system-data";
import { getRecentJournalLogs, type JournalLog } from "@/lib/actions/journal";
import {
  subDays,
  subMonths,
  isAfter,
  startOfDay,
  subQuarters,
  subYears,
} from "date-fns";
import Navigation from "../components/navigation";
import Footer from "../components/footer";
import SearchInput from "../components/search-input";
import JournalList from "./components/journal-list";
import { InsightCard } from "./components/InsightCard";
import StatCard from "./components/stat-card";
import StatsGrid from "./components/stats-grid";
import PracticeReviewCalendar from "./components/practiceReviewCalendar";
import DistributionSection from "./components/distribution-section";
import StreakCard from "./components/streak-card";
import HeatmapSection from "./components/heatmap";
import TrendChart from "./components/trend-chart";
import {
  faCalendarAlt,
  faSpa,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

export default function ReviewPage() {
  const { entries, templates } = useSystemData();
  const [logs, setLogs] = useState<JournalLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Logs
  useEffect(() => {
    getRecentJournalLogs(20).then(setLogs);
  }, []);

  // Time Range State
  const [timeRange, setTimeRange] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  // Filter Data based on Range
  const filteredEntries = useMemo(() => {
    const now = new Date();
    let startDate = now;

    switch (timeRange) {
      case "week":
        startDate = subDays(now, 7);
        break;
      case "month":
        startDate = subMonths(now, 1);
        break;
      case "quarter":
        startDate = subQuarters(now, 1);
        break;
      case "year":
        startDate = subYears(now, 1);
        break;
    }

    // Reset to start of that day to be inclusive if needed, or exact logic
    startDate = startOfDay(startDate);

    return entries.filter((e) => isAfter(new Date(e.entryDate), startDate));
  }, [entries, timeRange]);

  // --- Stats Calculation ---
  const totalCount = useMemo(
    () => filteredEntries.reduce((sum, e) => sum + e.amount, 0),
    [filteredEntries],
  );

  const activeDays = useMemo(() => {
    const uniqueDays = new Set(filteredEntries.map((e) => e.entryDate));
    return uniqueDays.size;
  }, [filteredEntries]);

  // Mock Duration (e.g. assume 'minutes' unit is duration, else standard time per entry?)
  // For now, just sum amounts where unit is 'minutes'
  const totalDuration = useMemo(() => {
    return filteredEntries.reduce((sum, e) => {
      if (e.unit === "minutes") return sum + e.amount / 60; // Convert mins to hours
      return sum;
    }, 0);
  }, [filteredEntries]);

  // Mock Streak
  const streak = 14;

  // Determine cycle length for denominator
  const cycleLength = useMemo(() => {
    switch (timeRange) {
      case "week":
        return 7;
      case "quarter":
        return 90;
      case "year":
        return 365;
      default:
        return 30;
    }
  }, [timeRange]);
  return (
    <div className="font-sans antialiased min-h-screen pb-20">
      {/* Navigation */}
      <Navigation />
      <main className="max-w-7xl mx-auto px-8 pb-20">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <span className="text-[color:var(--primary)] font-bold tracking-widest text-xs uppercase opacity-80">
              Practice Insights
            </span>
            <h2 className="font-display text-5xl font-bold mb-2 text-[color:var(--ink)]">
              精进、回望、觉察
            </h2>
            <p className="text-[color:var(--muted)] max-w-2xl text-lg">
              通过数据洞察，见证每一刻的专注与慈悲。
            </p>
          </div>
          <div className="flex gap-4">
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-4 text-sm font-bold uppercase tracking-wider">
              <button
                onClick={() => setTimeRange("week")}
                className={`transition-colors ${timeRange === "week" ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]" : "hover:text-[color:var(--primary)]"}`}
              >
                周
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`transition-colors ${timeRange === "month" ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]" : "hover:text-[color:var(--primary)]"}`}
              >
                月
              </button>
              <button
                onClick={() => setTimeRange("quarter")}
                className={`transition-colors ${timeRange === "quarter" ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]" : "hover:text-[color:var(--primary)]"}`}
              >
                季
              </button>
              <button
                onClick={() => setTimeRange("year")}
                className={`transition-colors ${timeRange === "year" ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]" : "hover:text-[color:var(--primary)]"}`}
              >
                年
              </button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <StatsGrid
          activeDays={activeDays}
          totalCount={totalCount}
          totalDuration={totalDuration}
          period={
            timeRange === "week"
              ? "本周"
              : timeRange === "month"
                ? "本月"
                : timeRange === "quarter"
                  ? "本季"
                  : "本年"
          }
          totalDays={cycleLength}
        />

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Calendar & Content */}
          <div className="col-span-12 lg:col-span-8 space-y-8 stagger">
            <TrendChart
              entries={entries}
              templates={templates}
              timeRange={timeRange}
            />
            <PracticeReviewCalendar entries={entries} templates={templates} />
            <HeatmapSection entries={entries} />

            {/* Journal Section (Moved here based on plan) */}
            <div className="glass-card p-8 rounded-[2rem]">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h3 className="font-display text-2xl font-bold text-[color:var(--ink)]">
                  修行随笔
                </h3>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="搜索"
                  className="w-full sm:w-64"
                />
              </div>
              <JournalList
                logs={logs.filter((log) =>
                  log.content.toLowerCase().includes(searchQuery.toLowerCase()),
                )}
              />
            </div>
          </div>

          {/* Right Column: Distribution & Insights */}
          <div className="col-span-12 lg:col-span-4 space-y-8 stagger">
            <DistributionSection templates={templates} entries={entries} />
            <div className="glass-card p-8 rounded-[2rem]">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h4 className="font-display text-xl font-bold text-[color:var(--ink)]">
                  修行随笔
                </h4>
              </div>
              <div className="flex flex-col gap-4">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="搜索"
                  className="w-full sm:w-64"
                />
                <JournalList
                  logs={logs.filter((log) =>
                    log.content
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  )}
                />
              </div>
            </div>

            <section className="glass-card p-8 rounded-[2rem] bg-[color:var(--primary)]/5 border-[color:var(--primary)]/20">
              <div className="flex items-center gap-3 mb-4 text-[color:var(--primary)]">
                <InsightCard
                  text={
                    "你在清晨的修行质量比其他时段高出 24%。保持清晨第一缕阳光下的持诵，能带给你全天的平和。"
                  }
                />
              </div>
              <button className="w-full py-3 bg-[color:var(--surface)]/50 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[color:var(--surface)] transition-all border border-[color:var(--primary)]/10 text-[color:var(--ink)] mt-4">
                生成本月修行报告
              </button>
            </section>

            <StreakCard streak={streak} />
          </div>
        </div>

        <Footer className="mt-16 border-[color:var(--accent)]/20" />
      </main>
    </div>
  );
}
