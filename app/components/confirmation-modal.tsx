"use client";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger"; // Could extend this later
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Modal Content */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold text-[color:var(--ink)]">
          {title}
        </h3>
        <p className="mt-2 text-sm text-[color:var(--muted)]">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-xl px-4 py-2 text-sm font-medium text-[color:var(--muted)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--ink)]"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-[color:var(--accent-strong)]"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
