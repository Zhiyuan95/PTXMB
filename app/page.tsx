"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef, Suspense } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenNib,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import EntryModal from "./components/entry-modal";
import SearchInput from "./components/search-input";
import PracticeCard from "./components/practice-card";
import Navigation from "./components/navigation";
import { formatShortDate, todayISO, addDays, fromISODate, getWeekStart } from "@/lib/dates";
import { type Template } from "@/lib/storage";
import { sumEntriesForDate } from "@/lib/records";
import { useSystemData } from "@/hooks/use-system-data";
import { upsertJournalLog, getJournalLog } from "@/lib/actions/journal";

function HomeContent() {
  const { templates, entries, addEntry } = useSystemData();
  const searchParams = useSearchParams(); // Read URL params
  
  // Initialize with URL param 'date' if valid, else today
  const initialDate = searchParams.get("date");
  // Simple validation to check if it's a valid date string YYYY-MM-DD
  const isValidDate = initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate);

  const [selectedDate, setSelectedDate] = useState(isValidDate ? initialDate : todayISO());
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Journal State
  const [journalContent, setJournalContent] = useState("");
  const [isJournalSaving, setIsJournalSaving] = useState(false);

  // Load Journal
  useEffect(() => {
    async function loadJournal() {
      const log = await getJournalLog(selectedDate);
      if (log) setJournalContent(log.content);
      else setJournalContent("");
    }
    loadJournal();
  }, [selectedDate]);

  // Auto-save Journal
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (journalContent) {
        setIsJournalSaving(true);
        await upsertJournalLog(selectedDate, journalContent);
        setIsJournalSaving(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [journalContent, selectedDate]);

  // Derived Data
  const activeTemplates = useMemo(
    () => templates.filter((template) => template.isActive),
    [templates],
  );

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return activeTemplates;
    return activeTemplates.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [activeTemplates, searchQuery]);

  const today = todayISO();
  const totalRecordedCount = activeTemplates.filter(
    (t) => sumEntriesForDate(entries, t.id, selectedDate) > 0,
  ).length;
  const globalProgress = Math.round(
    (totalRecordedCount / (activeTemplates.length || 1)) * 100,
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const dateDisplay = useMemo(() => {
    if (selectedDate === today) return "今天";
    return formatShortDate(selectedDate);
  }, [selectedDate, today]);

  const weeklyTrendData = useMemo(() => {
    const days = [];
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const startOfWeek = getWeekStart(today);

    for (let i = 0; i < 7; i++) {
      const dateStr = addDays(startOfWeek, i);
      const dateDate = fromISODate(dateStr);
      const label = dayLabels[dateDate.getDay()];

      const completedCount = activeTemplates.filter(
        (t) => sumEntriesForDate(entries, t.id, dateStr) > 0,
      ).length;

      const total = activeTemplates.length || 1;
      const percentage = Math.round((completedCount / total) * 100);

      days.push({
        date: dateStr,
        label,
        percentage,
        isToday: dateStr === today,
      });
    }
    return days;
  }, [activeTemplates, entries, today]);

  const handleSaveEntry = (amount: number, note?: string) => {
    if (!activeTemplate) return;
    addEntry(
      activeTemplate.id,
      amount,
      activeTemplate.unit,
      selectedDate,
      note,
    );
    setActiveTemplate(null);
  };

  return (
    <div className="font-sans antialiased min-h-screen pb-20">
      {/* Navigation */}
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24">
        {/* Header */}
        <header className="mb-14 relative animate-fade-in">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-[color:var(--accent)]/10 rounded-full blur-[80px]"></div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs font-bold text-[color:var(--primary)] uppercase tracking-[0.2em] mb-4">
              <span className="w-2 h-2 rounded-full bg-[color:var(--primary)] animate-pulse"></span>
              Daily Progress
            </span>
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-4 tracking-tight leading-tight text-[color:var(--ink)]">
              静心 · 极简 · 精进
            </h2>
            <p className="text-[color:var(--muted)] max-w-2xl text-lg leading-relaxed">
              如是记录，如是观照。让每日的修行成为生命中最温柔的坚持。
            </p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Calendar / Date Picker */}
              <div className="flex items-center gap-3">
                <div className="glass-card px-5 py-2.5 rounded-xl text-sm font-bold text-[color:var(--ink)] shadow-sm">
                  {dateDisplay}{" "}
                  <span className="text-[color:var(--muted)]/50 ml-2 text-xs">
                    {selectedDate === today
                      ? formatShortDate(today)
                      : selectedDate}
                  </span>
                </div>

                <div className="relative">
                  {/* 图标按钮：仅作视觉展示，不处理点击 */}
                  <div
                    className="w-10 h-10 rounded-xl bg-[color:var(--surface)] border border-[color:var(--line)] hover:bg-white/80 transition-all flex items-center justify-center text-[color:var(--primary)] shadow-sm"
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-lg" />
                  </div>
                  
                  {/* 透明 Input：覆盖在按钮上方，处理真实点击 */}
                  <input
                    id="date-picker-input"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="选择日期"
                  />
                </div>
              </div>
              {/* --- 修改结束 --- */}

              {/* Expanding Search Input */}
              <div
                className={`relative transition-all duration-300 ease-in-out ${isSearchFocused ? "w-full sm:w-96" : "w-full sm:w-64"}`}
              >
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="搜索功课..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Practice Cards */}
            <div className="space-y-6 stagger">
              {filteredTemplates.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-[2.5rem]">
                  <p className="text-[color:var(--muted)]">
                    暂无相关功课。去设置页添加一个新的吧！
                  </p>
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <PracticeCard
                    key={template.id}
                    template={template}
                    entries={entries}
                    selectedDate={selectedDate}
                    onRecord={setActiveTemplate}
                  />
                ))
              )}
            </div>

            {/* Add New Button */}
            <Link
              href="/settings?new=true"
              className="glass-card p-8 rounded-3xl border-dashed border-2 border-[color:var(--line)] flex items-center justify-center cursor-pointer hover:border-[color:var(--primary)] hover:bg-white/50 transition-all group h-32"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-[color:var(--muted)]/50 flex items-center justify-center group-hover:bg-[color:var(--primary)] group-hover:text-white transition-all duration-500 transform group-hover:rotate-90">
                  <FontAwesomeIcon icon={faPlus} className="text-xl" />
                </div>
                <span className="font-display text-2xl font-bold text-[color:var(--muted)] group-hover:text-[color:var(--primary)] transition-colors">
                  开启新的修行功课
                </span>
              </div>
            </Link>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Summary Section */}
            <section className="glass-card p-8 rounded-[2rem]">
              <h4 className="font-black text-sm text-[color:var(--muted)] uppercase tracking-[0.3em] mb-8">
                Summary • 每日小结
              </h4>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[color:var(--secondary)]/10 blur-2xl rounded-full"></div>
                  <span className="text-7xl font-display font-bold text-[color:var(--secondary)] relative">
                    {totalRecordedCount}{" "}
                    <span className="text-3xl text-[color:var(--muted)]/30">
                      / {activeTemplates.length}
                    </span>
                  </span>
                </div>
                <h5 className="text-xl font-bold mb-3 text-[color:var(--ink)]">
                  {globalProgress >= 100 ? "法喜充满" : "尚需精进"}
                </h5>
                <p className="text-[color:var(--muted)] leading-relaxed mb-8">
                  {globalProgress >= 100
                    ? "当日功课圆满，回向众生，功德无量。"
                    : "修行如细水长流，不在一时猛进。当日尚未记录，先从三次深呼吸开始。"}
                </p>
              </div>
            </section>

            {/* Spiritual Journal */}
            <section className="glass-card p-8 rounded-[2rem] bg-[color:var(--secondary)]/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <FontAwesomeIcon
                  icon={faPenNib}
                  className="text-9xl text-[color:var(--secondary)]"
                />
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faPenNib}
                    className="text-[color:var(--secondary)]"
                  />
                  <h4 className="font-display text-2xl font-bold text-[color:var(--ink)]">
                    修行日志
                  </h4>
                </div>
                {isJournalSaving && (
                  <span className="text-xs text-[color:var(--muted)] animate-pulse">
                    保存中...
                  </span>
                )}
              </div>
              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                className="w-full h-40 bg-transparent border-none focus:ring-0 p-0 text-[color:var(--ink)]/80 placeholder-[color:var(--muted)]/60 text leading-relaxed resize-none font-medium focus:outline-none"
                placeholder="此刻的心境如何？有哪些感悟或障碍..."
              />
            </section>

            {/* Weekly Trends */}
            <section className="glass-card p-8 rounded-[2rem]">
              <h4 className="text-[10px] font-black text-[color:var(--muted)] uppercase tracking-[0.3em] mb-10">
                Weekly Trends
              </h4>
              <div className="h-44 flex items-end justify-between gap-3 px-1">
                {weeklyTrendData.map((data, idx) => {
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-3 flex-1 group"
                    >
                        <div className="relative w-full h-32 md:h-40 flex items-end">
                             <div className="w-full bg-white/20 rounded-full h-full absolute top-0 left-0"></div>
                             <div
                                className={`w-full rounded-full transition-all duration-700 relative z-10 ${data.isToday ? "bg-[color:var(--accent)] shadow-[0_0_15px_rgba(217,119,6,0.3)]" : "bg-[color:var(--primary)]/30 group-hover:bg-[color:var(--primary)]/50"}`}
                                style={{ height: `${Math.max(data.percentage, 5)}%` }} // Min height for visibility
                              ></div>
                        </div>
                      <span
                        className={`text-[9px] font-black ${data.isToday ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]/50"}`}
                      >
                        {data.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>

      <EntryModal
        template={activeTemplate}
        entries={entries}
        selectedDate={selectedDate}
        onClose={() => setActiveTemplate(null)}
        onSave={handleSaveEntry}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}