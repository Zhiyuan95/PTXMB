"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageHeader from "../components/page-header";
import ConfirmationModal from "../components/confirmation-modal";
import { unitLabels, type Template, type Unit } from "@/lib/storage";
import { useSystemData } from "@/hooks/use-system-data";
import { faFileArrowDown, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const unitOptions: { value: Unit; label: string }[] = [
  { value: "times", label: "遍 (次数)" },
  { value: "minutes", label: "分钟 (时长)" },
  { value: "sessions", label: "座 (座次)" },
  { value: "pages", label: "页" },
];
const categoryOptions = ["念咒", "观修", "接传承"];

const palette = [
  "#4A0000", // Oxblood Red
  "#8ca0b0", // Muted Blue
  "#a0b08c", // Muted Green
  "#b08ca0", // Muted Purple
  "#d0a080", // Terra Cotta
  "#90a0b0", // Cool Blue
  "#a09080", // Warm Gray
  "#ffffff", // White
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

export default function SettingsPage() {
  const { templates, addTemplate, updateTemplate, toggleTemplateActive } =
    useSystemData();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [archiveConfirmId, setArchiveConfirmId] = useState<string | null>(null);

  // Handle URL params for auto-opening form
  useEffect(() => {
      const isNew = searchParams.get("new");
      const name = searchParams.get("name");

      if (isNew === "true") {
          setIsFormOpen(true);
          if (name) {
              setFormData(prev => ({ ...prev, name: decodeURIComponent(name) }));
          }
          // Clean up URL
          router.replace("/settings");
      }
  }, [searchParams, router]);

  // When opening the form, reset or populate it
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
  const inactiveTemplates = templates.filter((t) => !t.isActive);

  return (
    <div className="min-h-screen pb-20">
      <div className="mx-auto max-w-2xl px-6 pt-10">
        <PageHeader
          eyebrow="Settings"
          title="功课管理"
          description="添加新的修法内容，或调整现有目标。"
        />

        <div className="mt-8">
          {/* Toggle Form Button */}
          {!isFormOpen ? (
            <button
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] py-4 text-sm font-medium text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              onClick={() => setIsFormOpen(true)}
            >
              <span>+ 添加新功课</span>
            </button>
          ) : null}

          {/* Form Area */}
          {isFormOpen ? (
            <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-soft)] animate-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[color:var(--ink)] font-serif">
                  {editingId ? "编辑功课" : "新建功课"}
                </h3>
                <button
                  className="text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                  onClick={resetForm}
                >
                  取消
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Name & Category */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[color:var(--muted)]">
                      功课名称 *
                    </label>
                    <input
                      required
                      className="w-full rounded-xl border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                      placeholder="如：金刚萨埵心咒"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[color:var(--muted)]">
                      类别 (可选)
                    </label>
                    <input
                      className="w-full rounded-xl border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
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

                {/* Color Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[color:var(--muted)]">
                    标识颜色 *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {/* No Color Option */}
                    <button
                      type="button"
                      className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 transition-transform hover:scale-110 ${
                        !formData.color
                          ? "border-[color:var(--ink)]"
                          : "border-[color:var(--line)]"
                      }`}
                      onClick={() => setFormData({ ...formData, color: "" })}
                      title="无颜色"
                    >
                      <div className="absolute h-0.5 w-full rotate-45 bg-red-400" />
                    </button>
                    
                    {palette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          formData.color === color
                            ? "border-[color:var(--ink)]"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                {/* Units */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[color:var(--muted)]">
                    计量单位 *
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {unitOptions.map((opt) => (
                      <label
                        className={`flex cursor-pointer items-center justify-center rounded-xl border px-2 py-2 text-sm transition-colors ${
                          formData.unit === opt.value
                            ? "border-[color:var(--accent)] bg-[color:var(--accent-light)] text-[color:var(--accent-strong)]"
                            : "border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:bg-[color:var(--surface-strong)]"
                        }`}
                        key={opt.value}
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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[color:var(--muted)]">
                    目标设置 (可选)
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <input
                        className="w-full rounded-xl border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                        inputMode="numeric"
                        placeholder="日课定额"
                        type="number"
                        value={formData.dailyTarget}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dailyTarget: e.target.value,
                          })
                        }
                      />
                      <p className="mt-1 text-[10px] text-[color:var(--muted)]">
                        每日希望完成的量
                      </p>
                    </div>
                    <div>
                      <input
                        className="w-full rounded-xl border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                        inputMode="numeric"
                        placeholder="保底目标"
                        type="number"
                        value={formData.minimumTarget}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minimumTarget: e.target.value,
                          })
                        }
                      />
                      <p className="mt-1 text-[10px] text-[color:var(--muted)]">
                        最少完成量(打卡线)
                      </p>
                    </div>
                    <div>
                      <input
                        className="w-full rounded-xl border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                        inputMode="numeric"
                        placeholder="终身/阶段总愿"
                        type="number"
                        value={formData.totalTarget}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            totalTarget: e.target.value,
                          })
                        }
                      />
                      <p className="mt-1 text-[10px] text-[color:var(--muted)]">
                        总发愿数量
                      </p>
                    </div>
                  </div>
                </div>

                {/* Legacy Data */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[color:var(--muted)]">
                    历史累计 (迁移数据用)
                  </label>
                  <input
                    className="w-full rounded-xl border border-[color:var(--line)] bg-white px-3 py-2 text-sm text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                    inputMode="numeric"
                    placeholder="在此App使用前已完成的数量..."
                    type="number"
                    value={formData.initialTotal}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initialTotal: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="pt-2">
                  <button
                    className="w-full rounded-xl bg-[color:var(--accent)] py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-[color:var(--accent-strong)]"
                    type="submit"
                  >
                    {editingId ? "保存修改" : "创建功课"}
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>

        {/* Active List */}
        <div className="mt-10 space-y-4">
          <h3 className="px-1 text-sm font-medium text-[color:var(--muted)]">
            进行中 ({activeTemplates.length})
          </h3>
          {activeTemplates.length === 0 ? (
            <p className="px-1 text-sm text-[color:var(--muted)]/60">
              暂无进行中的功课
            </p>
          ) : null}
          <div className="space-y-3">
            {activeTemplates.map((template) => (
              <div
                className="group flex items-center justify-between rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-4 transition-colors hover:border-[color:var(--accent)]"
                key={template.id}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: template.color || "#e0b090" }}
                    />
                    <h4 className="font-serif font-medium text-[color:var(--ink)]">
                      {template.name}
                    </h4>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--muted)]">
                    <span>{template.category}</span>
                    <span className="bg-[color:var(--surface-strong)] px-1.5 py-0.5 rounded">
                      {unitLabels[template.unit]}
                    </span>
                    {template.dailyTarget
                      ? `日课 ${template.dailyTarget}`
                      : "无日课定额"}
                  </div>
                </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="flex items-center gap-1 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs font-medium text-[color:var(--ink)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                      onClick={() => handleEdit(template)}
                    >
                    <FontAwesomeIcon icon={faGear} />
                      设置
                    </button>
                    <button
                      className="flex items-center gap-1 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs font-medium text-[color:var(--ink)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
                      onClick={() => setArchiveConfirmId(template.id)}
                    >
                      <FontAwesomeIcon icon={faFileArrowDown} />
                      归档
                    </button>
                  </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inactive List */}
        {inactiveTemplates.length > 0 ? (
          <div className="mt-10 space-y-4">
            <h3 className="px-1 text-sm font-medium text-[color:var(--muted)]">
              已归档 ({inactiveTemplates.length})
            </h3>
            <div className="space-y-3 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              {inactiveTemplates.map((template) => (
                <div
                  className="flex items-center justify-between rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-4"
                  key={template.id}
                >
                  <div>
                    <h4 className="font-serif font-medium text-[color:var(--ink)]">
                      {template.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--accent)]"
                      onClick={() => toggleTemplateActive(template.id)}
                    >
                      恢复
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Archive Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!archiveConfirmId}
        onClose={() => setArchiveConfirmId(null)}
        onConfirm={() => {
          if (archiveConfirmId) {
            toggleTemplateActive(archiveConfirmId);
          }
        }}
        title="确认归档？"
        description="归档后，该功课将从首页隐藏，但所有历史记录会被保留。你可以随时在设置页底部恢复它。"
        confirmLabel="确认归档"
      />
    </div>
  );
}
