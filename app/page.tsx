"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "./components/page-header";
import TemplateCard from "./components/template-card";
import SearchInput from "./components/search-input";
import EntryModal from "./components/entry-modal";
import { addDays, formatShortDate, todayISO } from "@/lib/dates";
import { unitLabels, type Template } from "@/lib/storage";
import { sumEntriesForDate } from "@/lib/records";
import { useSystemData } from "@/hooks/use-system-data";

export default function Home() {
  const { templates, entries, addEntry } = useSystemData();
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const activeTemplates = useMemo(
    () => templates.filter((template) => template.isActive),
    [templates],
  );

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return activeTemplates;
    return activeTemplates.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTemplates, searchQuery]);

  const recordedCount = useMemo(
    () =>
      activeTemplates.filter(
        (template) => sumEntriesForDate(entries, template.id, selectedDate) > 0,
      ).length,
    [activeTemplates, entries, selectedDate],
  );

  const handleSaveEntry = (amount: number, note?: string) => {
    if (!activeTemplate) return;

    addEntry(activeTemplate.id, amount, activeTemplate.unit, selectedDate, note);

    setNotice(
      `${activeTemplate.name} 已记录 ${amount}${
        unitLabels[activeTemplate.unit]
      }`,
    );
    setActiveTemplate(null);
  };

  const today = todayISO();
  const todayLabel =
    selectedDate === today ? "今日" : formatShortDate(selectedDate);
  const yesterday = addDays(today, -1);

  return (
    <div className="min-h-screen">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-10">
        <PageHeader
          eyebrow="System of Record"
          title="修行记录"
          description="极简记录，温和复盘。先证明你愿意记录。"
        />

        {notice ? (
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--ink)] shadow-[var(--shadow-soft)] animate-fade-in">
            {notice}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  {selectedDate === today ? "今日记录" : "补录功课"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ink)] font-serif">
                  {todayLabel}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <button
                  className="rounded-full border border-[color:var(--line)] px-3 py-1 text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                  type="button"
                  onClick={() => setSelectedDate(today)}
                >
                  今天
                </button>
                <button
                  className="rounded-full border border-[color:var(--line)] px-3 py-1 text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                  type="button"
                  onClick={() => setSelectedDate(yesterday)}
                >
                  昨天
                </button>
                <input
                  className="rounded-full border border-[color:var(--line)] bg-transparent px-3 py-1 text-sm text-[color:var(--ink)]"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    if (event.target.value) {
                      setSelectedDate(event.target.value);
                    }
                  }}
                />
              </div>
            </div>

              <div className="mt-6">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="搜索功课..."
                  className="mb-4"
                />

                {filteredTemplates.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-strong)] p-6 text-center text-sm text-[color:var(--muted)] animate-fade-in flex flex-col items-center gap-3">
                    <p>
                        {searchQuery 
                        ? `没有找到匹配 "${searchQuery}" 的功课。` 
                        : "还没有功课模板。先去设置页创建你的第一项功课。"}
                    </p>
                    {searchQuery && (
                        <Link
                            href={`/settings?new=true&name=${encodeURIComponent(searchQuery)}`}
                            className="text-xs font-medium text-[color:var(--accent)] hover:underline underline-offset-4"
                        >
                            + 去创建 "{searchQuery}"
                        </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 stagger">
                    {filteredTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        entries={entries}
                        selectedDate={selectedDate}
                        onRecord={setActiveTemplate}
                      />
                    ))}
                  </div>
                )}
              </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)] animate-fade-up">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                今日小结
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-[color:var(--ink)] font-serif">
                {recordedCount} / {activeTemplates.length} 项已记录
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                不打扰修行过程，只在需要时留下轻量记录。
              </p>
            </div>

            <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)] animate-fade-up">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                快速动作
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm font-medium">
                <Link
                  className="rounded-full border border-[color:var(--line)] px-4 py-2 text-[color:var(--ink)] hover:bg-[color:var(--surface-strong)]"
                  href="/review"
                >
                  去复盘看看
                </Link>
                <Link
                  className="rounded-full border border-[color:var(--line)] px-4 py-2 text-[color:var(--ink)] hover:bg-[color:var(--surface-strong)]"
                  href="/settings"
                >
                  管理功课模板
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--muted)] shadow-[var(--shadow-soft)] animate-fade-up">
              <p className="font-serif text-base text-[color:var(--ink)]">
                今日提醒
              </p>
              <p className="mt-2">只要完成最小目标，当天就算有效，不必自责。</p>
            </div>
          </aside>
        </section>
      </div>

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
