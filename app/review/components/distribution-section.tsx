import { type Template, type Entry } from "@/lib/storage";

interface DistributionSectionProps {
  templates: Template[];
  entries: Entry[];
}

export default function DistributionSection({
  templates,
  entries,
}: DistributionSectionProps) {
  // Calculate distribution based on "Weighted Effort"
  // Weight = Entry Amount / Daily Target. 
  // If no target, default to 1 (treat as 1 standard session).
  const templateStats = templates.map(t => {
      // Find all entries for this template
      const templateEntries = entries.filter(e => e.templateId === t.id);
      
      // Calculate total weight
      const totalWeight = templateEntries.reduce((sum, e) => {
          // If the template has a daily target, use it to normalize
          // Example: 10000 mantras target. Action 5000 = 0.5 weight.
          // Example: 60 mins target. Action 60 = 1.0 weight.
          if (t.dailyTarget && t.dailyTarget > 0) {
              return sum + (e.amount / t.dailyTarget);
          }
          // Fallback: If no target, treat each entry as "1 unit of practice" (Frequency)
          // This prevents large numbers (like 10000 times) from dominating if no target is set.
          return sum + 1;
      }, 0);

      return { ...t, weight: totalWeight };
  });

  // Calculate total weight across all templates to determine percentages
  const grandTotalWeight = templateStats.reduce((sum, t) => sum + t.weight, 0) || 1;

  // Finalize stats with percentages and sort
  const finalStats = templateStats
      .map(t => ({
          ...t,
          percent: Math.round((t.weight / grandTotalWeight) * 100)
      }))
      .sort((a, b) => b.weight - a.weight) // Sort by weight descending
      .slice(0, 4); // Top 4

  return (
    <div className="space-y-8">
      <section className="glass-card p-8 rounded-[2rem]">
        <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-bold text-[color:var(--muted)] uppercase tracking-widest">
            修行分布 (Top)
            </h4>
            <div className="group relative cursor-help">
                <span className="text-[10px] bg-[color:var(--surface)] px-2 py-1 rounded-full text-[color:var(--muted)] border border-[color:var(--line)]">
                    分布说明
                </span>
                <div className="absolute right-0 bottom-full mb-2 w-48 p-3 glass-card text-[10px] text-[color:var(--ink)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <p className="leading-relaxed">
                        此分布基于<b>日课目标完成度</b>计算权重，而非单纯的次数，能更公平地反映您在该功课上投入的精力比重。
                    </p>
                </div>
            </div>
        </div>
        <div className="space-y-6">
          {finalStats.map((t) => (
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
          
          {finalStats.length === 0 && (
              <p className="text-sm text-[color:var(--muted)]">暂无足够数据</p>
          )}

        </div>

        {/* <div className="mt-12 pt-8 border-t border-[color:var(--line)]">
          <h5 className="text-xs font-bold text-[color:var(--muted)] uppercase mb-4 tracking-widest">
            长周期趋势
          </h5>
          <div className="flex items-end gap-1.5 h-24 mb-4">
             {/* Mock trend bars */}
             {/* {[40, 55, 45, 70, 85, 75, 95].map((h, i) => (
                 <div key={i} className="flex-1 bg-[color:var(--primary)] rounded-t-lg opacity-40 hover:opacity-100 transition-opacity" style={{height: `${h}%`}}></div>
             ))} */}
          {/* </div>
          <div className="flex justify-between text-[10px] text-[color:var(--muted)] font-bold">
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
            <span>Jan</span>
          </div> */}
        {/* </div> */} 
      </section>
    </div>
  );
}
