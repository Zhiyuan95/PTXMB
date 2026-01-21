import { faChartLine, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function InsightCard({ text }: { text: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl border-l-4 border-[color:var(--primary)]/40">
      <div className="flex items-center gap-3 mb-3">
        <FontAwesomeIcon
          icon={faLightbulb}
          className="text-[color:var(--primary)]"
        />
        <h4 className="font-bold text-lg text-[color:var(--ink)]">修行建议</h4>
      </div>
      <p className="text-[color:var(--muted)] italic text-md leading-relaxed">
        “{text}”
      </p>
    </div>
  );
}

export function StatCard({
  icon,
  trend,
  label,
  value,
  subValue,
  colorClass,
}: {
  icon: any;
  trend?: string;
  label: string;
  value: string | number;
  subValue: string;
  colorClass: string;
}) {
  return (
    <div className="glass-card p-6 rounded-3xl group transition-all hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 text-current`}
        >
          <FontAwesomeIcon icon={icon} />
        </div>
        {trend && (
          <span className="text-green-600 text-xs font-bold flex items-center gap-1">
            <FontAwesomeIcon icon={faChartLine} className="text-xs" /> {trend}
          </span>
        )}
      </div>
      <p className="text-[color:var(--muted)] text-sm mb-1">{label}</p>
      <h3 className="text-3xl font-display font-bold text-[color:var(--ink)]">
        {value}{" "}
        <span className="text-base font-sans font-normal opacity-40">
          {subValue}
        </span>
      </h3>
    </div>
  );
}
