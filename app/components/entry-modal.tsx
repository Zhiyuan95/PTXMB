"use client";

import { useState } from "react";
import { formatShortDate } from "@/lib/dates";
import { unitLabels, type Template, type Entry } from "@/lib/storage";
import { sumEntriesForDate, totalWithInitial } from "@/lib/records";

const quickAdds = [1, 21, 108];

interface EntryModalProps {
  template: Template | null;
  entries: Entry[];
  selectedDate: string;
  onClose: () => void;
  onSave: (amount: number, note?: string) => void;
}

export default function EntryModal({
  template,
  entries,
  selectedDate,
  onClose,
  onSave,
}: EntryModalProps) {
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!template) return null;

  const handleQuickAdd = (value: number) => {
    setAmountInput((prev) => {
      const current = Number(prev || 0);
      return String(current + value);
    });
  };

  const handleSaveClick = () => {
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("请输入大于 0 的数值");
      return;
    }
    onSave(amount, noteInput);
    // Reset state after save
    setAmountInput("");
    setNoteInput("");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-6 backdrop-blur-sm transition-all animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-xl transition-all scale-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              快速录入
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[color:var(--ink)] font-serif">
              {template.name}
            </h3>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              记录日期: {formatShortDate(selectedDate)}
            </p>
          </div>
          <button
            className="text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]"
            type="button"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
              <label className="text-sm text-[color:var(--muted)]">
                录入数量 ({unitLabels[template.unit]})
              </label>
              <input
                className="mt-1 w-full rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3 text-lg text-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                inputMode="numeric"
                placeholder="输入数字"
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
                autoFocus
              />
          </div>
          <div className="flex flex-wrap gap-2">
            {quickAdds.map((value) => (
              <button
                className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--ink)] hover:bg-[color:var(--surface-strong)] transition-colors"
                key={value}
                type="button"
                onClick={() => handleQuickAdd(value)}
              >
                +{value}
              </button>
            ))}
          </div>

          {/* Note Input */}
          <div>
              <label className="text-sm text-[color:var(--muted)]">
                备注 (可选)
              </label>
              <textarea
                className="mt-1 w-full resize-none rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-3 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--muted)]/50 focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
                rows={2}
                placeholder="今日感悟、随喜赞叹..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
          </div>

          {error ? (
            <p className="text-sm text-[color:var(--accent-strong)]">{error}</p>
          ) : null}
          <button
            className="w-full rounded-full bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-[color:var(--accent-strong)] transition-colors active:scale-[0.98]"
            type="button"
            onClick={handleSaveClick}
          >
            保存记录
          </button>
          <div className="text-xs text-[color:var(--muted)] text-center">
            当前累计 {totalWithInitial(entries, template)}
            {unitLabels[template.unit]} · 本日已记{" "}
            {sumEntriesForDate(entries, template.id, selectedDate)}
            {unitLabels[template.unit]}
          </div>
        </div>
      </div>
    </div>
  );
}
