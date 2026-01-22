"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  faPlus,
  faPauseCircle,
  faBookOpen,
  faSmile,
  faPenToSquare,
  faHourglassHalf,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConfirmationModal from "../components/confirmation-modal";
import { type Template, type Unit } from "@/lib/storage";
import { useSystemData } from "@/hooks/use-system-data";
import { todayISO } from "@/lib/dates";
import TemplateCard from "./components/template-card";
import Navigation from "../components/navigation";
import Footer from "../components/footer";

const unitOptions: { value: Unit; label: string }[] = [
  { value: "times", label: "遍 (次数)" },
  { value: "minutes", label: "分钟 (时长)" },
  { value: "sessions", label: "座 (座次)" },
  { value: "pages", label: "页" },
];
const categoryOptions = ["念咒", "观修", "接传承", "禅修", "阅读"];

const palette = [
  "#B45309", // Primary (Saffron)
  "#991B1B", // Secondary (Crimson)
  "#D97706", // Accent (Gold)
  "#57534e", // Stone
  "#15803d", // Green
  "#0f766e", // Teal
  "#1d4ed8", // Blue
  "#7e22ce", // Purple
];

const emptyForm = {
  name: "",
  category: "",
  unit: "times" as Unit,
  dailyTarget: "",
  minimumTarget: "",
  initialTotal: "",
  totalTarget: "",
  color: palette[0],
};

function SettingsContent() {
  const {
    templates,
    entries,
    addTemplate,
    updateTemplate,
    toggleTemplateActive,
    deleteTemplate,
  } = useSystemData();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [archiveConfirmId, setArchiveConfirmId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Handle URL params
  useEffect(() => {
    const isNew = searchParams.get("new");
    const name = searchParams.get("name");

    if (isNew === "true") {
      setIsFormOpen(true);
      if (name) {
        setFormData((prev) => ({ ...prev, name: decodeURIComponent(name) }));
      }
      // Clean up URL
      router.replace("/settings");
    }
  }, [searchParams, router]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const parseNumber = (value: string) => {
    if (!value) return undefined;
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? num : undefined;
  };

  const handleEdit = (template: Template) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      category: template.category ?? "",
      unit: template.unit,
      dailyTarget: String(template.dailyTarget ?? ""),
      minimumTarget: String(template.minimumTarget ?? ""),
      initialTotal: String(template.initialTotal ?? ""),
      totalTarget: String(template.totalTarget ?? ""),
      color: template.color || palette[0],
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const dataBuffer = {
      name: formData.name,
      category: formData.category || undefined,
      unit: formData.unit,
      dailyTarget: parseNumber(formData.dailyTarget),
      minimumTarget: parseNumber(formData.minimumTarget),
      initialTotal: parseNumber(formData.initialTotal),
      totalTarget: parseNumber(formData.totalTarget),
      color: formData.color,
    };

    if (editingId) {
      updateTemplate(editingId, dataBuffer);
    } else {
      addTemplate(dataBuffer);
    }

    resetForm();
  };

  const activeTemplates = templates.filter((t) => t.isActive);
  const pausedTemplates = templates.filter((t) => !t.isActive);

  return (
    <div className="min-h-screen pb-20 font-sans">
      {/* Navigation */}
      <Navigation />

      <main className="max-w-7xl mx-auto px-8 pb-20">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
          <div className="flex flex-col gap-1">
            <span className="text-[color:var(--primary)] font-bold tracking-widest text-xs uppercase opacity-80">
              Practice Management
            </span>
            <h2 className="font-display text-5xl font-bold mb-2 text-[color:var(--ink)]">
              功课与模板
            </h2>
            <p className="text-[color:var(--muted)] max-w-2xl text-lg">
              管理您的日常修法内容，设定目标，持之以恒。
            </p>
          </div>
        </header>

        {/* Form Overlay */}
        {isFormOpen && (
          <div className="mb-12 glass-card p-8 rounded-3xl border-2 border-[color:var(--primary)]/20 animate-fade-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl font-bold text-[color:var(--ink)]">
                {editingId ? "编辑功课" : "创建新功课"}
              </h3>
              <button
                onClick={resetForm}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="text-[color:var(--muted)]"
                />
              </button>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name & Category */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">
                    功课名称 *
                  </label>
                  <input
                    required
                    className="w-full rounded-xl border-0 bg-white/50 px-4 py-3 text-[color:var(--ink)] ring-1 ring-[color:var(--line)] focus:ring-2 focus:ring-[color:var(--primary)]"
                    placeholder="如：金刚萨埵心咒"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">
                    类别
                  </label>
                  <input
                    className="w-full rounded-xl border-0 bg-white/50 px-4 py-3 text-[color:var(--ink)] ring-1 ring-[color:var(--line)] focus:ring-2 focus:ring-[color:var(--primary)]"
                    list="category-suggestions"
                    placeholder="自定义或选择..."
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  />
                  <datalist id="category-suggestions">
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Color & Unit */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">
                  标识颜色
                </label>
                <div className="flex flex-wrap gap-3">
                  {palette.map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ring-2 ring-offset-2 ${formData.color === color ? "ring-[color:var(--ink)]" : "ring-transparent"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">
                  计量单位
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {unitOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-sm font-bold transition-all ${formData.unit === opt.value ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-white" : "border-[color:var(--line)] bg-white/50 text-[color:var(--muted)] hover:bg-white"}`}
                    >
                      <input
                        className="sr-only"
                        name="unit"
                        type="radio"
                        value={opt.value}
                        checked={formData.unit === opt.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            unit: e.target.value as Unit,
                          })
                        }
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Targets */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">
                    每日目标
                  </label>
                  <input
                    className="w-full rounded-xl border-0 bg-white/50 px-4 py-3 text-[color:var(--ink)] ring-1 ring-[color:var(--line)] focus:ring-2 focus:ring-[color:var(--primary)]"
                    type="number"
                    placeholder="日课定额"
                    value={formData.dailyTarget}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyTarget: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">
                    历史累计 (迁移用)
                  </label>
                  <input
                    className="w-full rounded-xl border-0 bg-white/50 px-4 py-3 text-[color:var(--ink)] ring-1 ring-[color:var(--line)] focus:ring-2 focus:ring-[color:var(--primary)]"
                    type="number"
                    placeholder="已完成数量"
                    value={formData.initialTotal}
                    onChange={(e) =>
                      setFormData({ ...formData, initialTotal: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider">
                    总愿目标
                  </label>
                  <input
                    className="w-full rounded-xl border-0 bg-white/50 px-4 py-3 text-[color:var(--ink)] ring-1 ring-[color:var(--line)] focus:ring-2 focus:ring-[color:var(--primary)]"
                    type="number"
                    placeholder="终身目标"
                    value={formData.totalTarget}
                    onChange={(e) =>
                      setFormData({ ...formData, totalTarget: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  className="w-full rounded-xl bg-[color:var(--primary)] py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  type="submit"
                >
                  {editingId ? "保存修改" : "立即创建"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Templates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger mb-16 mt-10">
          {/* Create New Card */}
          {!isFormOpen && (
            <div
              onClick={() => setIsFormOpen(true)}
              className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[color:var(--accent)] hover:bg-white/60 transition-all group min-h-[320px] border-dashed border-2 border-[color:var(--line)]"
            >
              <div className="w-20 h-20 rounded-full bg-[color:var(--accent)]/10 flex items-center justify-center group-hover:scale-110 transition-transform text-[color:var(--accent)]">
                <FontAwesomeIcon icon={faPlus} className="text-3xl" />
              </div>
              <div className="text-center">
                <h3 className="font-display text-2xl font-bold text-[color:var(--accent)] mb-1">
                  创建新功课
                </h3>
                <p className="text-[color:var(--muted)] text-sm">
                  定义新的修行目标与计量单位
                </p>
              </div>
            </div>
          )}

          {/* Active Template Cards */}
          {activeTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              entries={entries}
              onEdit={handleEdit}
              onToggleActive={(id) => setArchiveConfirmId(id)}
            />
          ))}
        </div>

        {/* Paused Templates Section */}
        {pausedTemplates.length > 0 && (
          <section className="mb-16">
            <h4 className="font-display text-xl font-bold mb-6 text-[color:var(--muted)] flex items-center gap-2">
              <FontAwesomeIcon icon={faPauseCircle} /> 已暂停 / 归档
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger">
              {pausedTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  entries={entries}
                  onToggleActive={(id) => setArchiveConfirmId(id)}
                  onDelete={(id) => setDeleteConfirmId(id)}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-20">
          <h4 className="font-display text-2xl font-bold mb-8 text-[color:var(--ink)]">
            常用模板 (快速添加)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: faSmile, name: "慈经观想", desc: "经典慈心禅修引导" },
              {
                icon: faPenToSquare,
                name: "随手记诵",
                desc: "无目标计数的随心修行",
              },
              {
                icon: faHourglassHalf,
                name: "定时静坐",
                desc: "快速开启20分钟倒计时",
              },
              { icon: faBookOpen, name: "百字明咒", desc: "金刚萨埵加持模板" },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setIsFormOpen(true);
                  setFormData({ ...emptyForm, name: item.name });
                }}
                className="glass-card p-6 rounded-2xl hover:bg-white/60 transition-colors cursor-pointer group"
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-[color:var(--primary)] mb-3 text-xl group-hover:scale-110 transition-transform"
                />
                <h5 className="font-bold mb-1 text-[color:var(--ink)]">
                  {item.name}
                </h5>
                <p className="text-xs text-[color:var(--muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <Footer
          className="mt-24 border-[color:var(--accent)]/20 border"
          title="法义提示"
        />
      </main>

      <ConfirmationModal
        isOpen={!!archiveConfirmId}
        onClose={() => setArchiveConfirmId(null)}
        onConfirm={() => {
          if (archiveConfirmId) {
            toggleTemplateActive(archiveConfirmId);
            setArchiveConfirmId(null);
          }
        }}
        title="确认操作？"
        description="暂停后，该功课将从首页隐藏，但历史记录会被保留。您可以随时点击“恢复”按钮重新启用。"
        confirmLabel="确认"
      />

      <ConfirmationModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            // Assuming deleteTemplate exists in hook or we just archive
            // Actually useSystemData usually has deleteTemplate?
            // Checking existing code... it might only have toggleTemplateActive.
            // If no delete, I'll just close for now or Implement delete in hook if needed.
            // The hook in existing file was: const { templates, addTemplate, updateTemplate, toggleTemplateActive } = useSystemData();
            // So delete might not be readily available. I will skip Delete action for now to be safe or just use Archive.
            // Wait, the design has a DELETE button.
            // I will check use-system-data.ts next.
            // For now, I'll trigger toggle (Archive) if Delete is strictly not supported, but let's check.
            if (deleteTemplate) deleteTemplate(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="确认删除？"
        description="删除将永久移除此功课及其所有历史记录，不可恢复。建议仅归档（暂停）。"
        confirmLabel="永久删除"
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
