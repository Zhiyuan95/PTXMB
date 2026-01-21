import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";

interface StreakCardProps {
  streak: number;
}

export default function StreakCard({ streak }: StreakCardProps) {
  return (
    <section className="glass-card p-8 rounded-[2rem] relative overflow-hidden text-white bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] border-none shadow-2xl shadow-primary/20">
      <div className="absolute -right-8 -bottom-8 opacity-20">
        <FontAwesomeIcon icon={faMedal} className="text-[120px]" />
      </div>
      <div className="relative z-10">
        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-80">
          当前连击
        </h4>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-6xl font-display font-bold">{streak}</span>
          <span className="text-xl opacity-80">天</span>
        </div>
        <p className="text-sm opacity-90 leading-relaxed max-w-[200px]">
          再坚持 7 天，即可达成“精进者”成就。
        </p>
      </div>
    </section>
  );
}
