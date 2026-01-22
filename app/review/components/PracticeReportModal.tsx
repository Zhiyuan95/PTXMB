import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPrint,
  faQuoteLeft,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import { type Entry, type Template, unitLabels } from "@/lib/storage";
import { type JournalLog } from "@/lib/actions/journal";
import { useMemo } from "react";

interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

interface PracticeReportModalProps {
  entries: Entry[];
  templates: Template[];
  logs: JournalLog[];
  dateRange: DateRange | undefined;
  onClose: () => void;
}

export default function PracticeReportModal({
  entries,
  templates,
  logs,
  dateRange,
  onClose,
}: PracticeReportModalProps) {
  // --- Stats Calculation ---
  const stats = useMemo(() => {
    // 1. Total Days & Count
    const uniqueDays = new Set(entries.map((e) => e.entryDate));
    const totalDays = uniqueDays.size;
    const totalCount = entries.reduce((acc, e) => acc + e.amount, 0);

    // 2. Practice Breakdown
    const breakdown = templates
      .map((t) => {
        const tEntries = entries.filter((e) => e.templateId === t.id);
        const total = tEntries.reduce((acc, e) => acc + e.amount, 0);
        return {
          ...t,
          total,
          dailyAvg: totalDays > 0 ? Math.round(total / totalDays) : 0,
        };
      })
      .filter((t) => t.total > 0)
      .sort((a, b) => b.total - a.total);

    // 3. Best Day
    const dayCounts: Record<string, number> = {};
    entries.forEach((e) => {
      dayCounts[e.entryDate] = (dayCounts[e.entryDate] || 0) + 1; // Count items or amount? Let's count items for "busyness"
    });
    let bestDay = "";
    let maxItems = 0;
    Object.entries(dayCounts).forEach(([date, count]) => {
      if (count > maxItems) {
        maxItems = count;
        bestDay = date;
      }
    });

    return { totalDays, totalCount, breakdown, bestDay };
  }, [entries, templates]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:bg-white print:p-0 print:block print:static">
      {/* Action Bar (Hidden when printing) */}
      <div className="absolute top-4 right-4 flex gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-white text-[color:var(--ink)] rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPrint} />
          打印 / 下载PDF
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all backdrop-blur-md"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* A4 Paper Container */}
      <div
        className="
            w-full max-w-[210mm] max-h-[90vh] aspect-[1/1.414] 
            bg-white text-[color:var(--ink)] 
            rounded-sm shadow-2xl overflow-y-auto custom-scrollbar
            print:shadow-none print:w-full print:max-w-none print:max-h-none print:aspect-auto print:overflow-visible
        "
      >
        <div className="p-12 print:p-0 space-y-8">
          {/* 1. Header */}
          <header className="text-center border-b-2 border-[color:var(--primary)]/20 pb-8">
            <div className="text-[color:var(--primary)] text-4xl mb-4 opacity-80">
              <FontAwesomeIcon icon={faFilePdf} />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-2">
              修行阶段性报告
            </h1>
            <p className="text-[color:var(--muted)] font-serif italic">
              {dateRange?.from
                ? format(dateRange.from, "yyyy年MM月dd日")
                : "开始"}
              {" — "}
              {dateRange?.to ? format(dateRange.to, "yyyy年MM月dd日") : "至今"}
            </p>
          </header>

          {/* 2. Executive Summary - Grid */}
          <section className="grid grid-cols-3 gap-6">
            <div className="p-4 bg-[color:var(--surface)] rounded-xl text-center border border-[color:var(--line)] print:border-gray-200">
              <div className="text-sm text-[color:var(--muted)] uppercase tracking-wider font-bold mb-1">
                精进天数
              </div>
              <div className="text-3xl font-display font-bold text-[color:var(--primary)]">
                {stats.totalDays}{" "}
                <span className="text-sm text-[color:var(--ink)]">天</span>
              </div>
            </div>
            <div className="p-4 bg-[color:var(--surface)] rounded-xl text-center border border-[color:var(--line)] print:border-gray-200">
              <div className="text-sm text-[color:var(--muted)] uppercase tracking-wider font-bold mb-1">
                总功课量
              </div>
              <div className="text-3xl font-display font-bold text-[color:var(--accent)]">
                {stats.totalCount.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-[color:var(--surface)] rounded-xl text-center border border-[color:var(--line)] print:border-gray-200">
              <div className="text-sm text-[color:var(--muted)] uppercase tracking-wider font-bold mb-1">
                最佳修行日
              </div>
              <div className="text-lg font-bold text-[color:var(--ink)] mt-2">
                {stats.bestDay
                  ? format(new Date(stats.bestDay), "MM.dd", { locale: zhCN })
                  : "-"}
              </div>
            </div>
          </section>

          {/* 3. Practice Breakdown - Table */}
          <section>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-[color:var(--primary)] rounded-full"></span>
              功课明细
            </h3>
            <table className="w-full text-left text-sm">
              <thead className="text-[color:var(--muted)] uppercase tracking-wider border-b border-[color:var(--line)]">
                <tr>
                  <th className="py-3 font-bold">功课名称</th>
                  <th className="py-3 font-bold text-right">总计</th>
                  <th className="py-3 font-bold text-right">日均</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line)]">
                {stats.breakdown.map((t) => (
                  <tr key={t.id}>
                    <td className="py-3 font-medium flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: t.color }}
                      ></div>
                      {t.name}
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-bold">
                        {t.total.toLocaleString()}
                      </span>
                      <span className="text-xs text-[color:var(--muted)] ml-1">
                        {unitLabels[t.unit]}
                      </span>
                    </td>
                    <td className="py-3 text-right text-[color:var(--muted)]">
                      {t.dailyAvg.toLocaleString()} / 天
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 4. Journal Highlights */}
          {logs.length > 0 && (
            <section>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-[color:var(--accent)] rounded-full"></span>
                心路历程
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {logs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)]/30 print:border-gray-200"
                  >
                    <div className="text-xs font-bold text-[color:var(--muted)] mb-2">
                      {log.logDate}
                    </div>
                    <p className="text-sm line-clamp-2 italic text-[color:var(--ink)]/80">
                      "{log.content}"
                    </p>
                  </div>
                ))}
              </div>
              {logs.length > 6 && (
                <p className="text-center text-xs text-[color:var(--muted)] mt-2">
                  * 还有 {logs.length - 6} 篇随笔未展示
                </p>
              )}
            </section>
          )}

          {/* 5. Dedication (Footer) */}
          <footer className="pt-8 mt-8 border-t border-[color:var(--line)]/50 text-center space-y-4 print:mt-12">
            <div className="inline-block relative px-8 py-4">
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute top-0 left-0 text-[color:var(--primary)]/10 text-4xl"
              />
              <p className="font-serif text-[color:var(--ink)]/80 italic relative z-10">
                愿以此功德，普及于一切。
                <br />
                我等与众生，皆共成佛道。
              </p>
            </div>
            <div className="text-[10px] text-[color:var(--muted)] uppercase tracking-widest pt-4">
              Generated by <span className="font-bold">菩提心脉</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
