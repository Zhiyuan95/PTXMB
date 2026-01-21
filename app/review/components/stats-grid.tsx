import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faMagic,
  faHeart,
  faSpa,
  faBrain,
} from "@fortawesome/free-solid-svg-icons";

interface StatsGridProps {
  activeDays: number;
  totalCount: number;
  totalDuration: number;
  focusScore?: number; // Placeholder for now
}

export default function StatsGrid({
  activeDays,
  totalCount,
  totalDuration,
  focusScore = 8.4,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 stagger">
      {/* Monthly Days */}
      <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group hover:bg-white/60 transition-all">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <FontAwesomeIcon icon={faMagic} className="text-8xl text-[color:var(--primary)]" />
        </div>
        <p className="text-[color:var(--muted)] text-sm mb-1 font-bold">本月修行天数</p>
        <h3 className="text-4xl font-display font-bold text-[color:var(--primary)]">
          {activeDays} <span className="text-base font-sans font-normal opacity-60 text-[color:var(--ink)]">/ 30</span>
        </h3>
        <div className="mt-4 flex items-center gap-1 text-xs text-green-600 font-bold">
          <FontAwesomeIcon icon={faChartLine} />
          <span>Keep Going</span>
        </div>
      </div>

      {/* Total Count */}
      <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group hover:bg-white/60 transition-all">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <FontAwesomeIcon icon={faHeart} className="text-8xl text-[color:var(--secondary)]" />
        </div>
        <p className="text-[color:var(--muted)] text-sm mb-1 font-bold">累计持咒数</p>
        <h3 className="text-4xl font-display font-bold text-[color:var(--ink)]">
          {totalCount.toLocaleString()}
        </h3>
        <div className="mt-4 flex items-center gap-1 text-xs text-[color:var(--muted)] font-medium">
          <span>功不唐捐</span>
        </div>
      </div>

      {/* Duration */}
      <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group hover:bg-white/60 transition-all">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <FontAwesomeIcon icon={faSpa} className="text-8xl text-[color:var(--accent)]" />
        </div>
        <p className="text-[color:var(--muted)] text-sm mb-1 font-bold">禅修时长 (h)</p>
        <h3 className="text-4xl font-display font-bold text-[color:var(--ink)]">
          {totalDuration.toFixed(1)}
        </h3>
        <div className="mt-4 flex items-center gap-1 text-xs text-[color:var(--primary)] font-bold">
          <span>勇猛精进</span>
        </div>
      </div>

      {/* Focus Score (Mock) */}
      <div className="glass-card p-6 rounded-[2rem] relative overflow-hidden group hover:bg-white/60 transition-all">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <FontAwesomeIcon icon={faBrain} className="text-8xl text-stone-400" />
        </div>
        <p className="text-[color:var(--muted)] text-sm mb-1 font-bold">专注度评分</p>
        <h3 className="text-4xl font-display font-bold text-[color:var(--ink)]">
          {focusScore}
        </h3>
        <div className="mt-4 flex items-center gap-1 text-xs text-[color:var(--accent)] font-bold">
          <span>晚间修行质量最高</span>
        </div>
      </div>
    </div>
  );
}
