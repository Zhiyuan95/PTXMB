import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLayerGroup, 
  faPlus 
} from "@fortawesome/free-solid-svg-icons";
import ProgressRing from "./progress-ring";
import { unitLabels, type Template, type Entry } from "@/lib/storage";
import { sumEntriesForDate, totalWithInitial } from "@/lib/records";
import { todayISO } from "@/lib/dates";

interface PracticeCardProps {
  template: Template;
  entries: Entry[];
  onRecord: (template: Template) => void;
}

export default function PracticeCard({ template, entries, onRecord }: PracticeCardProps) {
  const today = todayISO();
  const dayTotal = sumEntriesForDate(entries, template.id, today);
  const total = totalWithInitial(entries, template);
  const target = template.dailyTarget || 0;
  const progressPercent = target > 0 ? Math.min(Math.round((dayTotal / target) * 100), 100) : 0;
  const isCompleted = target > 0 && dayTotal >= target;

  return (
    <div className="glass-card p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden group transition-all hover:shadow-[var(--shadow-soft)]">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[color:var(--accent)]/5 rounded-full blur-[80px] group-hover:bg-[color:var(--accent)]/10 transition-all duration-700"></div>
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
        <div className="flex-grow">
            <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-[color:var(--primary)]/10 text-[color:var(--primary)]'}`}>
                    {isCompleted ? 'Completed' : 'Ongoing'}
                </span>
                {template.category && (
                    <span className="text-[color:var(--muted)] text-sm font-medium flex items-center gap-1">
                        <FontAwesomeIcon icon={faLayerGroup} className="text-xs" /> {template.category}
                    </span>
                )}
            </div>
            <h3 className="font-display text-4xl font-bold mb-4 text-[color:var(--ink)]">{template.name}</h3>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/40 border border-white/50 p-5 rounded-3xl">
                <span className="text-[color:var(--muted)] text-xs font-bold uppercase tracking-wider block mb-1">今日已记</span>
                <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-bold text-[color:var(--primary)]">{dayTotal.toLocaleString()}</span>
                <span className="text-[color:var(--muted)] text-sm">{unitLabels[template.unit]}</span>
                </div>
            </div>
            <div className="bg-white/40 border border-white/50 p-5 rounded-3xl">
                <span className="text-[color:var(--muted)] text-xs font-bold uppercase tracking-wider block mb-1">累计总量</span>
                <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-bold text-[color:var(--ink)]">
                    {total > 10000 ? (total / 10000).toFixed(1) + 'W' : total.toLocaleString()}
                </span>
                <span className="text-[color:var(--muted)] text-sm">{unitLabels[template.unit]}</span>
                </div>
            </div>
            </div>
        </div>
        <div className="flex flex-col items-center gap-6 w-full md:w-auto">
            <div className="relative">
             <ProgressRing 
                radius={80} 
                stroke={6} 
                progress={progressPercent} 
                color={isCompleted ? "text-green-500" : "text-[color:var(--accent)]"} 
             />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold text-[color:var(--ink)]">{progressPercent}</span>
                <span className="text-[10px] uppercase font-bold tracking-tighter opacity-40 text-[color:var(--ink)]">Percent</span>
            </div>
            </div>
            <button 
                onClick={() => onRecord(template)}
                className="w-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] hover:shadow-xl hover:shadow-primary/30 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95"
            >
                <FontAwesomeIcon icon={faPlus} />
                <span>记录遍数</span>
            </button>
        </div>
        </div>
        
        {target > 0 && (
            <div className="mt-12 space-y-4 relative z-10 w-full">
            <div className="flex justify-between items-end px-1">
                <div>
                    <span className="text-sm font-bold block text-[color:var(--ink)]">每日目标达成</span>
                    <p className="text-[11px] text-[color:var(--muted)] font-medium">目标: {target.toLocaleString()}</p>
                </div>
                <span className="text-[color:var(--accent)] font-black text-xl">{progressPercent}%</span>
            </div>
            <div className="h-4 bg-white/40 rounded-full p-1 overflow-hidden backdrop-blur-sm">
                <div 
                    className="h-full bg-gradient-to-r from-[color:var(--primary)] via-[color:var(--accent)] to-yellow-400 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(217,119,6,0.4)]" 
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>
            </div>
        )}
    </div>
  );
}
