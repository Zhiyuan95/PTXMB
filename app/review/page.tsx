"use client";

import { useEffect, useMemo, useState } from "react";
import { useSystemData } from "@/hooks/use-system-data";
import { getRecentJournalLogs, type JournalLog } from "@/lib/actions/journal";
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
import { faCalendarAlt, faSpa, faChartLine } from "@fortawesome/free-solid-svg-icons";

export default function ReviewPage() {
  const { entries, templates } = useSystemData();
  const [logs, setLogs] = useState<JournalLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Logs
  useEffect(() => {
    getRecentJournalLogs(20).then(setLogs);
  }, []);

  // --- Stats Calculation ---
  const totalCount = useMemo(
    () => entries.reduce((sum, e) => sum + e.amount, 0),
    [entries],
  );

  const activeDays = useMemo(() => {
    const uniqueDays = new Set(entries.map((e) => e.entryDate));
    return uniqueDays.size;
  }, [entries]);

  // Mock Duration (e.g. assume 'minutes' unit is duration, else standard time per entry?)
  // For now, just sum amounts where unit is 'minutes'
  const totalDuration = useMemo(() => {
    return entries.reduce((sum, e) => {
      if (e.unit === "minutes") return sum + e.amount / 60; // Convert mins to hours
      return sum;
    }, 0);
  }, [entries]);

  // Mock Streak
  const streak = 14;

  // Insights logic
  const insight =
    "你在清晨的修行质量比其他时段高出 24%。保持清晨第一缕阳光下的持诵，能带给你全天的平和。";

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
              <button className="hover:text-[color:var(--primary)] transition-colors">
                周
              </button>
              <button className="text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]">
                月
              </button>
              <button className="hover:text-[color:var(--primary)] transition-colors">
                季
              </button>
              <button className="hover:text-[color:var(--primary)] transition-colors">
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
        />

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Calendar & Content */}
          <div className="col-span-12 lg:col-span-8 space-y-8 stagger">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                label="本月修行天数"
                value={activeDays}
                subValue="/ 30"
                icon={faCalendarAlt}
                iconColorClass="text-green-600"
                bottomText="Keep it up"
                bottomIcon={faChartLine}
                bottomColorClass="text-green-600"
              />
              <StatCard
                label="累计修行总量"
                value={
                  totalCount > 10000
                    ? (totalCount / 10000).toFixed(1) + "W"
                    : totalCount
                }
                subValue="次"
                icon={faSpa}
                iconColorClass="text-[color:var(--accent)]"
              />
            </div>
            <DistributionSection templates={templates} entries={entries} />

            <section className="glass-card p-8 rounded-[2rem] bg-[color:var(--primary)]/5 border-[color:var(--primary)]/20">
              <div className="flex items-center gap-3 mb-4 text-[color:var(--primary)]">
                {/* Reuse InsightCard style or wrap it? The user design had a specific structure. 
                         The existing InsightCard has lightbulb icon. 
                         I will just use InsightCard here for simplicity as it matches the need. */}
                <InsightCard text={insight} />
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
