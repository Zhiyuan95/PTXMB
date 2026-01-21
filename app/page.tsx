"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenNib,
  faMagicWandSparkles,
} from "@fortawesome/free-solid-svg-icons";
import EntryModal from "./components/entry-modal";
import SearchInput from "./components/search-input";
import PracticeCard from "./components/practice-card";
import Navigation from "./components/navigation";
import { formatShortDate, todayISO } from "@/lib/dates";
import { unitLabels, type Template } from "@/lib/storage";
import { sumEntriesForDate, totalWithInitial } from "@/lib/records";
import { useSystemData } from "@/hooks/use-system-data";
import { upsertJournalLog, getJournalLog } from "@/lib/actions/journal";

export default function Home() {
  const { templates, entries, addEntry } = useSystemData();
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Journal State
  const [journalContent, setJournalContent] = useState("");
  const [isJournalSaving, setIsJournalSaving] = useState(false);

  // Load Journal
  useEffect(() => {
    async function loadJournal() {
      const today = todayISO();
      if (selectedDate === today) {
        const log = await getJournalLog(today);
        if (log) setJournalContent(log.content);
        else setJournalContent("");
      }
    }
    loadJournal();
  }, [selectedDate]);

  // Auto-save Journal
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (journalContent) {
        setIsJournalSaving(true);
        await upsertJournalLog(todayISO(), journalContent);
        setIsJournalSaving(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [journalContent]);

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
    (t) => sumEntriesForDate(entries, t.id, today) > 0,
  ).length;
  const globalProgress = Math.round(
    (totalRecordedCount / (activeTemplates.length || 1)) * 100,
  );

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
              <div className="flex items-center gap-1 glass-card p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto">
                <button className="px-5 py-2.5 rounded-xl bg-white/60 shadow-sm text-sm font-bold whitespace-nowrap text-[color:var(--ink)]">
                  今天
                </button>
                <span className="text-xs text-[color:var(--muted)] px-3">
                  {formatShortDate(today)}
                </span>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
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
              <h4 className="text-[10px] font-black text-[color:var(--muted)] uppercase tracking-[0.3em] mb-8">
                Summary • 今日小结
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
                <p className="text-sm text-[color:var(--muted)] leading-relaxed mb-8">
                  {globalProgress >= 100
                    ? "今日功课圆满，回向众生，功德无量。"
                    : "修行如细水长流，不在一时猛进。今日尚未记录，先从三次深呼吸开始。"}
                </p>
              </div>
            </section>

            {/* AI Spiritual Journal */}
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
                  <h4 className="font-display text-xl font-bold text-[color:var(--ink)]">
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
                className="w-full h-40 bg-transparent border-none focus:ring-0 p-0 text-[color:var(--ink)]/80 placeholder-[color:var(--muted)]/60 text-sm leading-relaxed resize-none font-medium focus:outline-none"
                placeholder="此刻的心境如何？有哪些感悟或障碍..."
              />
              <div className="mt-4 pt-4 border-t border-[color:var(--line)]">
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[color:var(--primary)]/10 hover:bg-[color:var(--primary)]/20 transition-colors text-[10px] font-bold text-[color:var(--primary)] uppercase disabled:opacity-50">
                    <FontAwesomeIcon icon={faMagicWandSparkles} />
                    寻求指引 (AI)
                  </button>
                </div>
              </div>
            </section>

            {/* Weekly Trends */}
            <section className="glass-card p-8 rounded-[2rem]">
              <h4 className="text-[10px] font-black text-[color:var(--muted)] uppercase tracking-[0.3em] mb-10">
                Weekly Trends
              </h4>
              <div className="h-44 flex items-end justify-between gap-3 px-1">
                {/* Placeholder Trend Data - for visual only as per design, real chart is in Review page */}
                {[40, 70, 30, 90, 50, 65, 45].map((val, idx) => {
                  const days = [
                    "MON",
                    "TUE",
                    "WED",
                    "THU",
                    "FRI",
                    "SAT",
                    "SUN",
                  ];
                  const isToday = idx === 6;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-3 flex-1 group"
                    >
                      <div className="w-full bg-white/20 rounded-full h-32 md:h-40 relative overflow-hidden">
                        <div
                          className={`absolute bottom-0 w-full transition-all duration-700 ${isToday ? "bg-[color:var(--accent)] shadow-[0_0_15px_rgba(217,119,6,0.3)]" : "bg-[color:var(--primary)]/30 group-hover:bg-[color:var(--primary)]/50"}`}
                          style={{ height: `${val}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-[9px] font-black ${isToday ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]/50"}`}
                      >
                        {days[idx]}
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
