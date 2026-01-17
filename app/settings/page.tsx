"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/page-header";
import {
  createId,
  loadEntries,
  loadTemplates,
  saveTemplates,
  unitLabels,
  type Entry,
  type Template,
  type Unit,
} from "@/lib/storage";
import { totalWithInitial } from "@/lib/records";

const unitOptions: { value: Unit; label: string }[] = [
  { value: "times", label: "次" },
  { value: "minutes", label: "分钟" },
  { value: "sessions", label: "座" },
  { value: "pages", label: "页" },
];

const categoryOptions = ["念咒", "观修", "接传承"];

const emptyForm = {
  name: "",
  category: "",
  unit: "times" as Unit,
  dailyTarget: "",
  minimumTarget: "",
  initialTotal: "",
};

export default function SettingsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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

  const entryLookup = useMemo(() => {
    const lookup = new Map<string, number>();
    entries.forEach((entry) => {
      lookup.set(entry.templateId, (lookup.get(entry.templateId) ?? 0) + 1);
    });
    return lookup;
  }, [entries]);

  const parseNumber = (value: string) => {
    if (!value.trim()) {
      return undefined;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return undefined;
    }
    return parsed;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
  };

  const handleEdit = (template: Template) => {
    setEditingId(template.id);
    setForm({
      name: template.name,
      category: template.category ?? "",
      unit: template.unit,
      dailyTarget: template.dailyTarget?.toString() ?? "",
      minimumTarget: template.minimumTarget?.toString() ?? "",
      initialTotal: template.initialTotal?.toString() ?? "",
    });
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("请输入功课名称");
      return;
    }
    const dailyTarget = parseNumber(form.dailyTarget);
    const minimumTarget = parseNumber(form.minimumTarget);
    const initialTotal = parseNumber(form.initialTotal);
    const category = form.category.trim();
    const nextCategory = category ? category : undefined;
    if (form.dailyTarget && dailyTarget === undefined) {
      setError("今日目标请输入数字");
      return;
    }
    if (form.minimumTarget && minimumTarget === undefined) {
      setError("保底目标请输入数字");
      return;
    }
    if (form.initialTotal && initialTotal === undefined) {
      setError("历史累计请输入数字");
      return;
    }

    if (editingId) {
      const hasEntries = (entryLookup.get(editingId) ?? 0) > 0;
      const nextTemplates = templates.map((template) =>
        template.id === editingId
          ? {
              ...template,
              name: form.name.trim(),
              category: nextCategory,
              unit: hasEntries ? template.unit : form.unit,
              dailyTarget,
              minimumTarget,
              initialTotal,
            }
          : template
      );
      setTemplates(nextTemplates);
      saveTemplates(nextTemplates);
      setNotice("功课模板已更新");
      resetForm();
      return;
    }

    const nextTemplate: Template = {
      id: createId(),
      name: form.name.trim(),
      category: nextCategory,
      unit: form.unit,
      dailyTarget,
      minimumTarget,
      initialTotal,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const nextTemplates = [nextTemplate, ...templates];
    setTemplates(nextTemplates);
    saveTemplates(nextTemplates);
    setNotice("功课模板已创建");
    resetForm();
  };

  const handleToggleActive = (template: Template) => {
    const nextTemplates = templates.map((item) =>
      item.id === template.id
        ? {
            ...item,
            isActive: !item.isActive,
          }
        : item
    );
    setTemplates(nextTemplates);
    saveTemplates(nextTemplates);
  };

  const activeTemplates = templates.filter((template) => template.isActive);

  return (
    <div className="min-h-screen">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-10">
        <PageHeader
          eyebrow="Asset Setup"
          title="设置"
          description="管理功课资产，确保记录可持续。"
        />

        {notice ? (
          <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--ink)] shadow-[var(--shadow-soft)] animate-fade-in">
            {notice}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              {editingId ? "编辑功课" : "创建功课"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ink)] font-serif">
              {editingId ? "更新功课模板" : "新的功课资产"}
            </h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm text-[color:var(--muted)]">
                  功课名称
                </label>
                <input
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  placeholder="例如 六字真言"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[color:var(--muted)]">
                  功课类别（可选）
                </label>
                <input
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  placeholder="念咒 / 观修 / 接传承"
                  value={form.category ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                  list="category-options"
                />
                <datalist id="category-options">
                  {categoryOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[color:var(--muted)]">
                  计量单位
                </label>
                <select
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  value={form.unit}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      unit: event.target.value as Unit,
                    }))
                  }
                  disabled={
                    editingId ? (entryLookup.get(editingId) ?? 0) > 0 : false
                  }
                >
                  {unitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {editingId && (entryLookup.get(editingId) ?? 0) > 0 ? (
                  <p className="text-xs text-[color:var(--muted)]">
                    已有记录的功课不允许修改单位。
                  </p>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-[color:var(--muted)]">
                    今日目标 (可选)
                  </label>
                  <input
                    className="w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                    inputMode="numeric"
                    value={form.dailyTarget}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        dailyTarget: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[color:var(--muted)]">
                    保底目标 (可选)
                  </label>
                  <input
                    className="w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                    inputMode="numeric"
                    value={form.minimumTarget}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        minimumTarget: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[color:var(--muted)]">
                  历史累计 (可选)
                </label>
                <input
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                  inputMode="numeric"
                  value={form.initialTotal}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      initialTotal: event.target.value,
                    }))
                  }
                />
              </div>
              {error ? (
                <p className="text-sm text-[color:var(--accent-strong)]">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-[color:var(--accent-strong)]"
                  type="submit"
                >
                  {editingId ? "保存修改" : "创建功课"}
                </button>
                {editingId ? (
                  <button
                    className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--ink)]"
                    type="button"
                    onClick={resetForm}
                  >
                    取消
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)] animate-fade-up">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                功课列表
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ink)] font-serif">
                {activeTemplates.length} 项启用中
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                记录条数 {entries.length} · 只保留你真正会做的功课
              </p>
            </div>

            <div className="space-y-4 stagger">
              {templates.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-strong)] p-6 text-sm text-[color:var(--muted)]">
                  还没有功课模板。先创建你的第一项功课。
                </div>
              ) : (
                templates.map((template) => {
                  const entryCount = entryLookup.get(template.id) ?? 0;
                  const total = totalWithInitial(entries, template);
                  return (
                    <div
                      className="rounded-3xl border border-[color:var(--line)] bg-white/70 p-5 shadow-[var(--shadow-soft)]"
                      key={template.id}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                            {template.isActive ? "启用中" : "已暂停"}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-[color:var(--ink)] font-serif">
                            {template.name}
                          </h3>
                          {template.category ? (
                            <p className="mt-1 text-xs text-[color:var(--muted)]">
                              {template.category}
                            </p>
                          ) : null}
                          <p className="mt-2 text-sm text-[color:var(--muted)]">
                            单位 {unitLabels[template.unit]} · 累计 {total}
                            {unitLabels[template.unit]} · 记录 {entryCount} 条
                          </p>
                          {template.dailyTarget ? (
                            <p className="mt-1 text-xs text-[color:var(--muted)]">
                              今日目标 {template.dailyTarget}
                              {unitLabels[template.unit]}
                            </p>
                          ) : null}
                          {template.minimumTarget ? (
                            <p className="mt-1 text-xs text-[color:var(--muted)]">
                              保底目标 {template.minimumTarget}
                              {unitLabels[template.unit]}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <button
                            className="rounded-full border border-[color:var(--line)] px-4 py-2 text-[color:var(--ink)]"
                            type="button"
                            onClick={() => handleEdit(template)}
                          >
                            编辑
                          </button>
                          <button
                            className="rounded-full border border-[color:var(--line)] px-4 py-2 text-[color:var(--ink)]"
                            type="button"
                            onClick={() => handleToggleActive(template)}
                          >
                            {template.isActive ? "暂停" : "启用"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--muted)] shadow-[var(--shadow-soft)] animate-fade-up">
              <p className="font-serif text-base text-[color:var(--ink)]">
                设置提示
              </p>
              <p className="mt-2">
                模板只要够用即可，不必太多。让记录始终轻量。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
