import { type Entry } from "@/lib/storage";

interface HeatmapSectionProps {
  entries: Entry[];
}

export default function HeatmapSection({ entries }: HeatmapSectionProps) {
  return (
    <section className="glass-card p-8 rounded-[2rem]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-2xl font-bold text-[color:var(--ink)]">
            修行热力图
          </h3>
          <p className="text-sm text-[color:var(--muted)] mt-1">
            过去 12 个月的修持强度分布
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[color:var(--muted)] uppercase font-bold tracking-tighter">
          <span>Less</span>
          <div className="w-3 h-3 bg-stone-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-[color:var(--primary)]/20 rounded-sm"></div>
          <div className="w-3 h-3 bg-[color:var(--primary)]/50 rounded-sm"></div>
          <div className="w-3 h-3 bg-[color:var(--primary)]/80 rounded-sm"></div>
          <div className="w-3 h-3 bg-[color:var(--primary)] rounded-sm"></div>
          <span>More</span>
        </div>
      </div>

      {/* Placeholder for complex Year Heatmap */}
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="flex gap-1 min-w-[700px] h-32 items-center justify-center text-[color:var(--muted)] text-sm italic border-2 border-dashed border-[color:var(--line)] rounded-2xl bg-[color:var(--surface)]/50">
          （此处展示年度热力图数据 visualizations）
        </div>
      </div>
    </section>
  );
}
