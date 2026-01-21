"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarAlt, 
  faChartLine, faSpa, faLightbulb, faSearch, faPenFancy
} from "@fortawesome/free-solid-svg-icons";
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
import JournalEditor from "./components/journal-editor";
import Navigation from "../components/navigation";

// --- Components ---

function StatCard({ 
    icon, 
    trend, 
    label, 
    value, 
    subValue, 
    colorClass 
}: { 
    icon: any, 
    trend?: string, 
    label: string, 
    value: string | number, 
    subValue: string, 
    colorClass: string 
}) {
    return (
        <div className="glass-card p-6 rounded-3xl group transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 text-current`}>
                    <FontAwesomeIcon icon={icon} />
                </div>
                {trend && (
                    <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                        <FontAwesomeIcon icon={faChartLine} className="text-xs" /> {trend}
                    </span>
                )}
            </div>
            <p className="text-[color:var(--muted)] text-sm mb-1">{label}</p>
            <h3 className="text-3xl font-display font-bold text-[color:var(--ink)]">
                {value} <span className="text-base font-sans font-normal opacity-40">{subValue}</span>
            </h3>
        </div>
    );
}

function InsightCard({ text }: { text: string }) {
    return (
        <div className="glass-card p-8 rounded-3xl border-l-4 border-[color:var(--primary)]/40">
            <div className="flex items-center gap-3 mb-3">
                <FontAwesomeIcon icon={faLightbulb} className="text-[color:var(--primary)]" />
                <h4 className="font-bold text-lg text-[color:var(--ink)]">修行建议</h4>
            </div>
            <p className="text-[color:var(--muted)] italic text-sm leading-relaxed">
                “{text}”
            </p>
        </div>
    );
}

export default function ReviewPage() {
  const { entries, templates } = useSystemData();
  const [logs, setLogs] = useState<JournalLog[]>([]);
  const [showEditor, setShowEditor] = useState(false);
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
  const totalCount = useMemo(() => entries.reduce((sum, e) => sum + e.amount, 0), [entries]);
  const activeDays = useMemo(() => {
      const uniqueDays = new Set(entries.map(e => e.entryDate));
      return uniqueDays.size;
  }, [entries]);

  // Insights logic (Simple mock for now)
  const insight = useMemo(() => {
      const maxDay = chartData.reduce((prev, current) => (current.value > prev.value ? current : prev), chartData[0]);
      return `发现你在过去一周的修行中，${maxDay?.date || '近日'}的精进程度最高。建议保持这份勇猛心，同时注意劳逸结合。`;
  }, [chartData]);


  return (
    <div className="font-sans antialiased min-h-screen pb-20">
      {/* Navigation */}
      <Navigation />

      <main className="max-w-7xl mx-auto px-8 pb-20">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <span className="text-[color:var(--primary)] font-bold tracking-widest text-xs uppercase opacity-80">Practice Review & Insights</span>
            <h2 className="font-display text-5xl font-bold mb-2 text-[color:var(--ink)]">精进、回望、觉察</h2>
            <p className="text-[color:var(--muted)] max-w-2xl text-lg">回顾修行的点滴，体悟心性的成长。</p>
          </div>
          {/* Range Selector Placeholder - Functional implementation can be ported later if needed */}
          <div className="flex flex-wrap items-center gap-4">
             <div className="glass-card px-2 py-1.5 rounded-2xl flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                <button className="px-4 py-1.5 rounded-xl bg-[color:var(--primary)] text-white shadow-lg">周</button>
                <button className="px-4 py-1.5 rounded-xl hover:bg-white/40 text-[color:var(--muted)]">月</button>
                <button className="px-4 py-1.5 rounded-xl hover:bg-white/40 text-[color:var(--muted)]">年</button>
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
                  <h3 className="font-display text-2xl font-bold text-[color:var(--ink)]">修行周度趋势</h3>
                  <p className="text-xs text-[color:var(--muted)] mt-1 uppercase tracking-widest font-bold">Weekly Trend</p>
                </div>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: 'var(--muted)', fontWeight: 'bold'}} 
                        dy={10}
                    />
                    <Tooltip 
                        contentStyle={{backgroundColor: 'var(--surface)', borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-soft)'}}
                        itemStyle={{color: 'var(--ink)', fontWeight: 'bold'}}
                        cursor={{stroke: 'var(--primary)', strokeWidth: 1}}
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
                  value={totalCount > 10000 ? (totalCount / 10000).toFixed(1) + 'W' : totalCount} 
                  subValue="次" 
                  colorClass="bg-[color:var(--accent)] text-[color:var(--accent)]"
               />
            </div>

            {/* Insight */}
            <InsightCard text={insight} />
          </div>

          {/* Right Column: Journal List */}
          <div className="col-span-12 lg:col-span-5 space-y-6 animate-fade-up" style={{animationDelay: '0.2s'}}>
            <section className="flex flex-col h-full">
               <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="font-display text-2xl font-bold text-[color:var(--ink)]">修行随笔</h3>
                     <span className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-widest">{logs.length} 篇记录</span>
                  </div>
                  <div className="relative group">
                     <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
                     <input 
                        className="w-full bg-white/40 border-[color:var(--line)] rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[color:var(--primary)] placeholder-[color:var(--muted)]/50 text-sm backdrop-blur-md transition-all focus:bg-white/60" 
                        placeholder="搜索随笔或感悟..." 
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                     />
                  </div>
               </div>

               <div className="space-y-4 custom-scrollbar overflow-y-auto max-h-[700px] pr-2">
                  {/* Journal List */}
                  {logs
                    .filter(log => log.content.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((log) => (
                      <article key={log.id} className="glass-card p-6 rounded-3xl transition-all hover:bg-white/60 cursor-pointer">
                          <div className="flex justify-between items-start mb-3">
                              <span className="px-3 py-1 rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)] text-[10px] font-bold uppercase tracking-wider">日志</span>
                              <time className="text-[10px] text-[color:var(--muted)] font-bold uppercase tracking-wider">{log.logDate}</time>
                          </div>
                          <p className="text-sm text-[color:var(--ink)]/80 leading-relaxed line-clamp-3 font-medium">
                              {log.content}
                          </p>
                      </article>
                  ))}
                  
                  {logs.length === 0 && (
                      <div className="p-8 text-center text-[color:var(--muted)] text-sm">
                          暂无随笔，记录下第一篇吧。
                      </div>
                  )}

                  {/* Add New / Editor Toggle */}
                  {showEditor ? (
                      <div className="glass-card p-6 rounded-3xl animate-fade-in">
                          <h4 className="font-bold text-lg mb-4 text-[color:var(--ink)]">记录新随笔</h4>
                          <JournalEditor />
                          <button 
                            onClick={() => setShowEditor(false)}
                            className="mt-4 text-xs text-[color:var(--muted)] hover:underline"
                          >
                              收起
                          </button>
                      </div>
                  ) : (
                    <button 
                        onClick={() => setShowEditor(true)}
                        className="mt-8 w-full py-4 bg-[color:var(--primary)] text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <FontAwesomeIcon icon={faPenFancy} />
                        记录新的随笔
                    </button>
                  )}
               </div>
            </section>
          </div>
        </div>

        <footer className="mt-20 glass-card p-10 rounded-3xl text-center">
            <h4 className="text-[color:var(--muted)] text-[10px] font-bold tracking-[0.6em] uppercase mb-6">Witnessing Growth</h4>
            <p className="font-display text-2xl md:text-3xl text-[color:var(--ink)]/80 italic mb-4 max-w-3xl mx-auto leading-relaxed">
                 “不积跬步，无以至千里；不积小流，无以成江海。”
            </p>
        </footer>
      </main>
    </div>
  );
}
