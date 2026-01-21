import { type Template, type Entry } from "@/lib/storage";

interface DistributionSectionProps {
  templates: Template[];
  entries: Entry[];
}

export default function DistributionSection({
  templates,
  entries,
}: DistributionSectionProps) {
  // Mock calculation for distribution
  // Real implementation would sum entries per template and calc percentage
  const totalAction = entries.length || 1;
  
  // Get top 3 templates
  const templateStats = templates.map(t => {
      const count = entries.filter(e => e.templateId === t.id).length;
      return { ...t, count, percent: Math.round((count / totalAction) * 100) };
  }).sort((a,b) => b.count - a.count).slice(0, 4);

  return (
    <div className="space-y-8">
      <section className="glass-card p-8 rounded-[2rem]">
        <h4 className="text-sm font-bold text-[color:var(--muted)] uppercase tracking-widest mb-8">
          修行分布 (Top)
        </h4>
        <div className="space-y-6">
          {templateStats.map((t) => (
            <div key={t.id}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-[color:var(--ink)]">{t.name}</span>
                <span className="font-bold" style={{ color: t.color }}>
                  {t.percent}%
                </span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${t.percent}%`, backgroundColor: t.color }}
                ></div>
              </div>
            </div>
          ))}
          
          {templateStats.length === 0 && (
              <p className="text-sm text-[color:var(--muted)]">暂无足够数据</p>
          )}

        </div>

        <div className="mt-12 pt-8 border-t border-[color:var(--line)]">
          <h5 className="text-xs font-bold text-[color:var(--muted)] uppercase mb-4 tracking-widest">
            长周期趋势
          </h5>
          <div className="flex items-end gap-1.5 h-24 mb-4">
             {/* Mock trend bars */}
             {[40, 55, 45, 70, 85, 75, 95].map((h, i) => (
                 <div key={i} className="flex-1 bg-[color:var(--primary)] rounded-t-lg opacity-40 hover:opacity-100 transition-opacity" style={{height: `${h}%`}}></div>
             ))}
          </div>
          <div className="flex justify-between text-[10px] text-[color:var(--muted)] font-bold">
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
            <span>Jan</span>
          </div>
        </div>
      </section>
    </div>
  );
}
