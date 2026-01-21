import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenFancy } from "@fortawesome/free-solid-svg-icons";
import { type JournalLog } from "@/lib/actions/journal";
import JournalEditor from "./journal-editor";

interface JournalItemProps {
  log: JournalLog;
}

export function JournalItem({ log }: JournalItemProps) {
  return (
    <article className="glass-card p-6 rounded-3xl transition-all hover:bg-white/60 cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <span className="px-3 py-1 rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)] text-[10px] font-bold uppercase tracking-wider">
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
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="space-y-4 custom-scrollbar overflow-y-auto max-h-[700px] pr-2">
      {/* Journal List */}
      {logs.map((log) => (
        <JournalItem key={log.id} log={log} />
      ))}

      {logs.length === 0 && (
        <div className="p-8 text-center text-[color:var(--muted)] text-sm">
          暂无随笔，记录下第一篇吧。
        </div>
      )}

      {/* Add New / Editor Toggle */}
      {showEditor ? (
        <div className="glass-card p-6 rounded-3xl animate-fade-in">
          <h4 className="font-bold text-lg mb-4 text-[color:var(--ink)]">
            记录新随笔
          </h4>
          <JournalEditor />
          <button
            onClick={() => setShowEditor(false)}
            className="mt-4 text-xs text-[color:var(--muted)] hover:underline"
          >
            收起
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowEditor(true)}
          className="mt-8 w-full py-4 bg-[color:var(--primary)] text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <FontAwesomeIcon icon={faPenFancy} />
          记录新的随笔
        </button>
      )}
    </div>
  );
}
