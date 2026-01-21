import { 
  faPen, 
  faPauseCircle, 
  faTrash, 
  faPlayCircle, 
  faBookOpen, 
  faMagic, 
  faLayerGroup 
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { unitLabels, type Template, type Entry } from "@/lib/storage";
import { todayISO } from "@/lib/dates";
import { sumEntriesForDate } from "@/lib/records";

interface TemplateCardProps {
  template: Template;
  entries: Entry[];
  onEdit?: (template: Template) => void;
  onToggleActive: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TemplateCard({ 
  template, 
  entries, 
  onEdit, 
  onToggleActive, 
  onDelete 
}: TemplateCardProps) {
  const today = todayISO();
  const dailyTarget = template.dailyTarget || 0;
  const dayTotal = sumEntriesForDate(entries, template.id, today);
  const progress = dailyTarget > 0 ? Math.min(Math.round((dayTotal / dailyTarget) * 100), 100) : 0;
  const isPaused = !template.isActive;

  return (
    <div className={`glass-card p-8 rounded-3xl relative overflow-hidden group shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 ${isPaused ? 'opacity-80 grayscale shadow-none border border-[color:var(--line)] bg-white/30 hover:grayscale-0' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 rounded-2xl text-white" style={{ backgroundColor: template.color || 'var(--muted)' }}>
          <FontAwesomeIcon icon={template.category === '阅读' ? faBookOpen : faMagic} className="text-xl" />
        </div>
        <div className="flex gap-2">
          {!isPaused && onEdit && (
            <button 
              onClick={() => onEdit(template)} 
              className="p-2 rounded-full bg-white/80 hover:bg-white hover:text-[color:var(--primary)] text-[color:var(--muted)] shadow-sm transition-colors"
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
          )}
          
          <button 
            onClick={() => onToggleActive(template.id)} 
            className={`p-2 rounded-full bg-white/80 hover:bg-white text-[color:var(--muted)] shadow-sm transition-colors ${isPaused ? 'hover:text-[color:var(--primary)]' : 'hover:text-amber-600'}`} 
            title={isPaused ? "恢复" : "暂停/归档"}
          >
            <FontAwesomeIcon icon={isPaused ? faPlayCircle : faPauseCircle} />
          </button>
          
          {isPaused && onDelete && (
            <button 
              onClick={() => onDelete(template.id)} 
              className="p-2 rounded-full bg-white/80 hover:bg-white hover:text-[color:var(--secondary)] text-[color:var(--muted)] shadow-sm transition-colors" 
              title="永久删除"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className={`font-display text-2xl font-bold ${isPaused ? 'text-[color:var(--muted)]' : 'text-[color:var(--ink)]'}`}>
            {template.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 mb-6">
          {template.category && (
            <span className="text-xs font-bold text-[color:var(--muted)] flex items-center gap-1">
              <FontAwesomeIcon icon={faLayerGroup} />{template.category}
            </span>
          )}
          <span className="text-xs bg-[color:var(--surface)] border border-[color:var(--line)] px-1.5 rounded text-[color:var(--muted)]">
            {unitLabels[template.unit]}
          </span>
        </div>

        <div className={`space-y-4 ${isPaused ? 'opacity-50' : ''}`}>
          <div className="flex justify-between text-sm">
            <span className="text-[color:var(--muted)]">每日目标</span>
            <span className={`font-bold ${isPaused ? 'text-[color:var(--muted)]' : 'text-[color:var(--ink)]'}`}>
              {dailyTarget > 0 ? `${dailyTarget.toLocaleString()} ${unitLabels[template.unit]}` : '无定额'}
            </span>
          </div>
          {dailyTarget > 0 && !isPaused && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-[color:var(--muted)]">当前进度</span>
                <span className="font-bold text-[color:var(--primary)]">{progress}%</span>
              </div>
              <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%`, backgroundColor: template.color || 'var(--primary)' }}
                ></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
