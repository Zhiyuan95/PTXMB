import {
  faChartLine,
  faMagic,
  faHeart,
  faSpa,
  faBrain,
} from "@fortawesome/free-solid-svg-icons";
import StatCard from "./stat-card";

interface StatsGridProps {
  activeDays: number;
  totalCount: number;
  totalDuration: number;
  focusScore?: number;
  period?: string;
  totalDays?: number;
}

export default function StatsGrid({
  activeDays,
  totalCount,
  totalDuration,
  focusScore = 8.4,
  period = "本月",
  totalDays = 30,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 stagger">
      <StatCard
        label={`${period}修行天数`}
        value={activeDays}
        subValue={`/ ${totalDays}`}
        icon={faMagic}
        iconColorClass="text-[color:var(--primary)]"
        bottomText="Keep Going"
        bottomIcon={faChartLine}
        bottomColorClass="text-green-600"
      />

      <StatCard
        label="累计持咒数"
        value={totalCount.toLocaleString()}
        icon={faHeart}
        iconColorClass="text-[color:var(--secondary)]"
        bottomText="功不唐捐"
        bottomColorClass="text-[color:var(--muted)]"
      />

      <StatCard
        label="禅修时长 (h)"
        value={totalDuration.toFixed(1)}
        icon={faSpa}
        iconColorClass="text-[color:var(--accent)]"
        bottomText="勇猛精进"
        bottomColorClass="text-[color:var(--primary)]"
        className="hidden md:block"
      />

      <StatCard
        label="专注度评分"
        value={focusScore}
        icon={faBrain}
        iconColorClass="text-stone-400"
        bottomText="晚间修行质量最高"
        bottomColorClass="text-[color:var(--accent)]"
        className="hidden md:block"
      />
    </div>
  );
}
