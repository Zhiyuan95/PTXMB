import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenFancy } from "@fortawesome/free-solid-svg-icons";
import { type JournalLog } from "@/lib/actions/journal";
import JournalEditor from "./journal-editor";
import { todayISO } from "@/lib/dates";

interface JournalItemProps {
  log: JournalLog;
  onClick: () => void;
}

export function JournalItem({ log, onClick }: JournalItemProps) {
  return (
    <article
      onClick={onClick}
      className="glass-card p-6 rounded-3xl transition-all hover:bg-white/60 cursor-pointer active:scale-[0.98] group"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="px-3 py-1 rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)] text-[10px] font-bold uppercase tracking-wider group-hover:bg-[color:var(--primary)] group-hover:text-white transition-colors">
          日志
        </span>
        <time className="text-[10px] text-[color:var(--muted)] font-bold uppercase tracking-wider">
          {log.logDate}
        </time>
      </div>
      <p className="text-sm text-[color:var(--ink)]/80 leading-relaxed line-clamp-3 font-medium">
        {log.content}
      </p>
    </article>
  );
}

interface JournalListProps {
  logs: JournalLog[];
}

export default function JournalList({ logs }: JournalListProps) {
  // Use string (date) to track active editor, allowing efficient switches
  const [activeDate, setActiveDate] = useState<string | null>(null);

  if (activeDate) {
    return (
      <div className="animate-fade-in h-[500px]">
        <JournalEditor date={activeDate} onClose={() => setActiveDate(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-4 custom-scrollbar overflow-y-auto max-h-[700px] pr-2">
      {/* Journal List */}
      {logs.map((log) => (
        <JournalItem
          key={log.id}
          log={log}
          onClick={() => setActiveDate(log.logDate)}
        />
      ))}

      {logs.length === 0 && (
        <div className="p-8 text-center text-[color:var(--muted)] text-sm">
          暂无随笔，记录下第一篇吧。
        </div>
      )}

      {/* Add New Button */}
      <button
        onClick={() => setActiveDate(todayISO())}
        className="mt-8 w-full py-4 bg-[color:var(--primary)] text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <FontAwesomeIcon icon={faPenFancy} />
        记录新的随笔
      </button>
    </div>
  );
}
