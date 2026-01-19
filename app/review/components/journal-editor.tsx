"use client";

import { useState, useEffect, useRef } from "react";
import { getJournalLog, upsertJournalLog } from "@/lib/actions/journal";
import { todayISO } from "@/lib/dates";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenNib, faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function JournalEditor() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"loading" | "saved" | "saving" | "error">("loading");
  const today = todayISO();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    async function load() {
      try {
        const log = await getJournalLog(today);
        if (log) {
          setContent(log.content);
        }
        setStatus("saved");
      } catch (error) {
        console.error("Failed to load journal", error);
        setStatus("error");
      }
    }
    load();
  }, [today]);

  // Handle auto-save
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setStatus("saving");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await upsertJournalLog(today, newContent);
        setStatus("saved");
      } catch (error) {
        console.error("Failed to save journal", error);
        setStatus("error");
      }
    }, 1500); // 1.5s debounce
  };

  return (
    <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg font-medium text-[color:var(--ink)] flex items-center gap-2">
            <FontAwesomeIcon icon={faPenNib} className="text-sm text-[color:var(--muted)]" />
            修行日志
        </h3>
        <div className="text-xs font-medium">
            {status === "loading" && <span className="text-[color:var(--muted)]">加载中...</span>}
            {status === "saving" && (
                <span className="flex items-center gap-1.5 text-[color:var(--accent)]">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    保存中
                </span>
            )}
            {status === "saved" && (
                <span className="flex items-center gap-1.5 text-green-600 animate-fade-in">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    已保存
                </span>
            )}
            {status === "error" && <span className="text-red-500">保存失败</span>}
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="记录今日的修行感悟、心境变化，或是对未来的期许..."
        className="w-full h-32 resize-none rounded-xl border border-[color:var(--line)] bg-white/50 p-4 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--muted)]/60 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)] transition-all"
      />
      <p className="mt-2 text-xs text-[color:var(--muted)] text-right">
        {today} · 仅对自己可见
      </p>
    </div>
  );
}
