"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "../components/page-header";
import {
  addDays,
  formatShortDate,
  getWeekRangeLabel,
  isSameWeek,
  todayISO,
} from "@/lib/dates";
import {
  loadEntries,
  loadPreferences,
  loadTemplates,
  savePreferences,
  saveTemplates,
  unitLabels,
  type Entry,
  type Preferences,
  type Template,
} from "@/lib/storage";
import {
  sumEntriesForDate,
  sumEntriesForWeek,
  totalWithInitial,
} from "@/lib/records";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList } from "@fortawesome/free-solid-svg-icons";

export default function ReviewPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(
    loadPreferences()
  );
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [showDedication, setShowDedication] = useState(false);
  const [draftDedication, setDraftDedication] = useState(
    preferences.dedicationText
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(loadTemplates());
    setEntries(loadEntries());
    setPreferences(loadPreferences());
  }, []);

  useEffect(() => {
    setDraftDedication(preferences.dedicationText);
  }, [preferences.dedicationText]);

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

  const activeTemplateIds = useMemo(
    () => new Set(activeTemplates.map((template) => template.id)),
    [activeTemplates]
  );

  const filteredTemplates = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) {
      return activeTemplates;
    }
    return activeTemplates.filter((template) =>
      template.name.toLowerCase().includes(keyword)
    );
  }, [activeTemplates, searchQuery]);

  const recordedCount = useMemo(
    () =>
      activeTemplates.filter(
        (template) => sumEntriesForDate(entries, template.id, selectedDate) > 0
      ).length,
    [activeTemplates, entries, selectedDate]
  );

  const weekDates = useMemo(() => {
    const weekMarker = new Set<string>();
    entries.forEach((entry) => {
      if (
        activeTemplateIds.has(entry.templateId) &&
        isSameWeek(entry.entryDate, selectedDate)
      ) {
        weekMarker.add(entry.entryDate);
      }
    });
    return weekMarker;
  }, [activeTemplateIds, entries, selectedDate]);

  const today = todayISO();
  const yesterday = addDays(today, -1);
  const previousWeek = addDays(selectedDate, -7);

  const handleSaveDedication = () => {
    const nextPrefs: Preferences = {
      dedicationText:
        draftDedication.trim() || preferences.dedicationText.trim(),
    };
    savePreferences(nextPrefs);
    setPreferences(nextPrefs);
    setShowDedication(false);
    setNotice("回向已收录");
  };

  const handleReorder = (fromId: string, toId: string) => {
    if (fromId === toId) {
      return;
    }
    const activeTemplatesList = templates.filter(
      (template) => template.isActive
    );
    const activeIds = activeTemplatesList.map((template) => template.id);
    const fromIndex = activeIds.indexOf(fromId);
    const toIndex = activeIds.indexOf(toId);
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }
    const nextActiveIds = [...activeIds];
    const [movedId] = nextActiveIds.splice(fromIndex, 1);
    nextActiveIds.splice(toIndex, 0, movedId);
    const activeById = new Map(
      activeTemplatesList.map((template) => [template.id, template])
    );
    let activeIndex = 0;
    const nextTemplates = templates.map((template) => {
      if (!template.isActive) {
        return template;
      }
      const nextId = nextActiveIds[activeIndex++];
      return activeById.get(nextId) ?? template;
    });
    setTemplates(nextTemplates);
    saveTemplates(nextTemplates);
  };

  return (
    <div className="min-h-screen">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-10">
        <PageHeader
          eyebrow="Daily Review"
          title="复盘"
          description="看见积累，让每次用功都有回响。"
        />

        {notice ? (
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--ink)] shadow-[var(--shadow-soft)] animate-fade-in">
            {notice}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  今日复盘
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ink)] font-serif">
                  {selectedDate === today
                    ? "今日"
                    : formatShortDate(selectedDate)}
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
              <div className="flex flex-wrap items-center gap-3">
                <input
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-2 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  placeholder="搜索功课名称"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {searchQuery ? (
                  <button
                    className="rounded-full border border-[color:var(--line)] px-4 py-2 text-xs text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                    type="button"
                    onClick={() => setSearchQuery("")}
                  >
                    清空
                  </button>
                ) : null}
              </div>
              {filteredTemplates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-strong)] p-6 text-sm text-[color:var(--muted)]">
                  {activeTemplates.length === 0
                    ? "还没有功课模板。先去设置页建立功课资产。"
                    : "没有匹配到功课，请调整关键词。"}
                </div>
              ) : (
                <div className="space-y-4 stagger">
                  {filteredTemplates.map((template) => {
                    const dayTotal = sumEntriesForDate(
                      entries,
                      template.id,
                      selectedDate
                    );
                    const dailyTarget = template.dailyTarget ?? 0;
                    const totalTarget = template.totalTarget ?? 0;
                    const totalProgress =
                      totalTarget > 0
                        ? Math.min(
                            (totalWithInitial(entries, template) /
                              totalTarget) *
                              100,
                            100
                          )
                        : 0;
                    const totalProgressLabel =
                      totalProgress < 1
                        ? totalProgress.toFixed(1)
                        : Math.round(totalProgress).toString();
                    const progress =
                      dailyTarget > 0
                        ? Math.min((dayTotal / dailyTarget) * 100, 100)
                        : 0;
                    const isDragging = draggingId === template.id;
                    const isDragOver = dragOverId === template.id;
                    return (
                      <div
                        className={`group rounded-3xl border border-[color:var(--line)] bg-white/70 p-5 shadow-[var(--shadow-soft)] transition ${
                          isDragOver ? "ring-2 ring-[color:var(--ring)]" : ""
                        } ${
                          isDragging ? "opacity-60" : ""
                        } cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-[color:var(--ring)]`}
                        key={template.id}
                        draggable
                        onDragStart={(event) => {
                          setDraggingId(template.id);
                          setDragOverId(null);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", template.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDragOverId(null);
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                          if (dragOverId !== template.id) {
                            setDragOverId(template.id);
                          }
                          event.dataTransfer.dropEffect = "move";
                        }}
                        onDragLeave={() => {
                          if (dragOverId === template.id) {
                            setDragOverId(null);
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const fromId =
                            draggingId ??
                            event.dataTransfer.getData("text/plain");
                          setDraggingId(null);
                          setDragOverId(null);
                          if (fromId) {
                            handleReorder(fromId, template.id);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <FontAwesomeIcon icon={faList} />
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                                {template.name}
                              </p>
                              <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
                                {dayTotal}
                                <span className="ml-1 text-sm text-[color:var(--muted)]">
                                  {unitLabels[template.unit]}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-xs text-[color:var(--muted)]">
                            <p>
                              累计 {totalWithInitial(entries, template)}
                              {unitLabels[template.unit]}
                            </p>
                            {dailyTarget > 0 ? (
                              <p className="mt-1">
                                目标 {dailyTarget}
                                {unitLabels[template.unit]} ·{" "}
                                {Math.round(progress)}%
                              </p>
                            ) : null}
                            {totalTarget > 0 ? (
                              <p className="mt-1">
                                总目标 {totalTarget}
                                {unitLabels[template.unit]} ·{" "}
                                {totalProgressLabel}%
                              </p>
                            ) : null}
                            {totalTarget > 0 ? (
                              <div className="mt-2 h-1 rounded-full bg-[color:var(--surface-strong)]">
                                <div
                                  className="h-1 rounded-full bg-[color:var(--accent)]"
                                  style={{ width: `${totalProgress}%` }}
                                />
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {dailyTarget > 0 ? (
                          <div className="mt-3 h-2 rounded-full bg-[color:var(--surface-strong)]">
                            <div
                              className="h-2 rounded-full bg-[color:var(--accent)]"
                              style={{ width: `${progress}%` }}
                            />
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
                今日收功
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-[color:var(--ink)] font-serif">
                已记录 {recordedCount} 项功课
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                收功时回向，让用功留下善意与方向。
              </p>
              <button
                className="mt-4 w-full rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-[color:var(--accent-strong)]"
                type="button"
                onClick={() => setShowDedication(true)}
              >
                今日回向
              </button>
              <div className="mt-4 rounded-2xl border border-[color:var(--line)] bg-white/70 p-4 text-sm text-[color:var(--muted)]">
                {preferences.dedicationText}
              </div>
            </div>

            <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)] animate-fade-up">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                本周概览
              </p>
              <h3 className="mt-3 text-lg font-semibold text-[color:var(--ink)] font-serif">
                {getWeekRangeLabel(selectedDate)}
              </h3>
              <div className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
                <p>本周已记录 {weekDates.size} 天</p>
                <p>比上周更进一步，保持平稳节奏即可</p>
              </div>
              <div className="mt-4 space-y-3">
                {filteredTemplates.map((template) => {
                  const weekTotal = sumEntriesForWeek(
                    entries,
                    template.id,
                    selectedDate
                  );
                  const prevTotal = sumEntriesForWeek(
                    entries,
                    template.id,
                    previousWeek
                  );
                  const delta = weekTotal - prevTotal;
                  return (
                    <div
                      className="flex items-center justify-between text-sm text-[color:var(--muted)]"
                      key={template.id}
                    >
                      <span>{template.name}</span>
                      <span>
                        {weekTotal}
                        {unitLabels[template.unit]}{" "}
                        {delta > 0
                          ? `(+${delta})`
                          : delta < 0
                          ? `(${delta})`
                          : "(持平)"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)] animate-fade-up">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                快速入口
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm font-medium">
                <Link
                  className="rounded-full border border-[color:var(--line)] px-4 py-2 text-[color:var(--ink)] hover:bg-[color:var(--surface-strong)]"
                  href="/"
                >
                  返回记录
                </Link>
                <Link
                  className="rounded-full border border-[color:var(--line)] px-4 py-2 text-[color:var(--ink)] hover:bg-[color:var(--surface-strong)]"
                  href="/settings"
                >
                  管理功课
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </div>

      {showDedication ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-6">
          <div className="w-full max-w-lg rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  今日回向
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[color:var(--ink)] font-serif">
                  回向文
                </h3>
              </div>
              <button
                className="text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                type="button"
                onClick={() => setShowDedication(false)}
              >
                关闭
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <textarea
                className="min-h-[140px] w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                value={draftDedication}
                onChange={(event) => setDraftDedication(event.target.value)}
              />
              <button
                className="w-full rounded-full bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-[color:var(--accent-strong)]"
                type="button"
                onClick={handleSaveDedication}
              >
                确认回向
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
