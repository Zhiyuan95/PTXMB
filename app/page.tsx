"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "./components/page-header";
import { addDays, formatShortDate, todayISO } from "@/lib/dates";
import {
  createId,
  loadEntries,
  loadTemplates,
  saveEntries,
  unitLabels,
  type Entry,
  type Template,
} from "@/lib/storage";
import { sumEntriesForDate, totalWithInitial } from "@/lib/records";

const quickAdds = [1, 21, 108];

export default function Home() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(loadTemplates());
    setEntries(loadEntries());
  }, []);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const activeTemplates = useMemo(
    () => templates.filter((template) => template.isActive),
    [templates]
  );

  const recordedCount = useMemo(
    () =>
      activeTemplates.filter(
        (template) => sumEntriesForDate(entries, template.id, selectedDate) > 0
      ).length,
    [activeTemplates, entries, selectedDate]
  );

  const handleQuickAdd = (value: number) => {
    setAmountInput((prev) => {
      const current = Number(prev || 0);
      return String(current + value);
    });
  };

  const handleSaveEntry = () => {
    if (!activeTemplate) {
      return;
    }
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("请输入大于 0 的数值");
      return;
    }
    const nextEntry: Entry = {
      id: createId(),
      templateId: activeTemplate.id,
      amount,
      unit: activeTemplate.unit,
      entryDate: selectedDate,
      createdAt: new Date().toISOString(),
    };
    const nextEntries = [nextEntry, ...entries];
    setEntries(nextEntries);
    saveEntries(nextEntries);
    setNotice(
      `${activeTemplate.name} 已记录 ${amount}${
        unitLabels[activeTemplate.unit]
      }`
    );
    setAmountInput("");
    setError(null);
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
                  今日功课
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

            <div className="mt-6 space-y-4">
              {activeTemplates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-strong)] p-6 text-sm text-[color:var(--muted)]">
                  还没有功课模板。先去设置页创建你的第一项功课。
                </div>
              ) : (
                <div className="space-y-4 stagger">
                  {activeTemplates.map((template) => {
                    const dayTotal = sumEntriesForDate(
                      entries,
                      template.id,
                      selectedDate
                    );
                    const overall = totalWithInitial(entries, template);
                    const target = template.dailyTarget ?? 0;
                    const progress =
                      target > 0 ? Math.min((dayTotal / target) * 100, 100) : 0;
                    const minimumMet =
                      template.minimumTarget &&
                      dayTotal >= template.minimumTarget;
                    return (
                      <div
                        className="rounded-3xl border border-[color:var(--line)] bg-white/70 p-5 shadow-[var(--shadow-soft)]"
                        key={template.id}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                              功课
                            </p>
                            <h3 className="mt-2 text-xl font-semibold text-[color:var(--ink)] font-serif">
                              {template.name}
                            </h3>
                          </div>
                          <button
                            className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-[color:var(--accent-strong)]"
                            type="button"
                            onClick={() => {
                              setActiveTemplate(template);
                              setAmountInput("");
                              setError(null);
                            }}
                          >
                            记录
                          </button>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
                            <p className="text-xs text-[color:var(--muted)]">
                              当日已记
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
                              {dayTotal}
                              <span className="ml-1 text-sm text-[color:var(--muted)]">
                                {unitLabels[template.unit]}
                              </span>
                            </p>
                          </div>
                          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4">
                            <p className="text-xs text-[color:var(--muted)]">
                              累计总量
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
                              {overall}
                              <span className="ml-1 text-sm text-[color:var(--muted)]">
                                {unitLabels[template.unit]}
                              </span>
                            </p>
                          </div>
                        </div>

                        {template.dailyTarget ? (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
                              <span>
                                今日目标 {template.dailyTarget}
                                {unitLabels[template.unit]}
                              </span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-[color:var(--surface-strong)]">
                              <div
                                className="h-2 rounded-full bg-[color:var(--accent)]"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        ) : null}

                        {template.minimumTarget ? (
                          <div className="mt-3 text-xs text-[color:var(--muted)]">
                            保底目标 {template.minimumTarget}
                            {unitLabels[template.unit]} ·{" "}
                            {minimumMet ? "已达成" : "尚未达成"}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
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

      {activeTemplate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-6">
          <div className="w-full max-w-lg rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  快速录入
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[color:var(--ink)] font-serif">
                  {activeTemplate.name}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  记录日期: {formatShortDate(selectedDate)}
                </p>
              </div>
              <button
                className="text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                type="button"
                onClick={() => {
                  setActiveTemplate(null);
                  setError(null);
                }}
              >
                关闭
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="text-sm text-[color:var(--muted)]">
                录入数量 ({unitLabels[activeTemplate.unit]})
              </label>
              <input
                className="w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3 text-lg text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                inputMode="numeric"
                placeholder="输入数字"
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {quickAdds.map((value) => (
                  <button
                    className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--ink)] hover:bg-[color:var(--surface-strong)]"
                    key={value}
                    type="button"
                    onClick={() => handleQuickAdd(value)}
                  >
                    +{value}
                  </button>
                ))}
              </div>
              {error ? (
                <p className="text-sm text-[color:var(--accent-strong)]">
                  {error}
                </p>
              ) : null}
              <button
                className="w-full rounded-full bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-[color:var(--accent-strong)]"
                type="button"
                onClick={handleSaveEntry}
              >
                保存记录
              </button>
              <div className="text-xs text-[color:var(--muted)]">
                当前累计 {totalWithInitial(entries, activeTemplate)}
                {unitLabels[activeTemplate.unit]} · 本日已记{" "}
                {sumEntriesForDate(entries, activeTemplate.id, selectedDate)}
                {unitLabels[activeTemplate.unit]}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
