import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: IconDefinition;
  iconColorClass: string;
  bottomText?: string;
  bottomIcon?: IconDefinition;
  bottomColorClass?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  subValue,
  icon,
  iconColorClass,
  bottomText,
  bottomIcon,
  bottomColorClass = "text-[color:var(--muted)]",
  className = "",
}: StatCardProps) {
  return (
    <div className={`glass-card p-6 rounded-[2rem] relative overflow-hidden group hover:bg-white/60 transition-all hover:-translate-y-1 ${className}`}>
      {/* Background Icon */}
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
        <FontAwesomeIcon icon={icon} className={`text-8xl ${iconColorClass}`} />
      </div>

      {/* Content */}
      <p className="text-[color:var(--muted)] text-sm mb-1 font-bold">
        {label}
      </p>
      <h3 className={`text-4xl font-display font-bold ${iconColorClass}`}>
        {value}
        {subValue && (
          <span className="text-base font-sans font-normal opacity-60 text-[color:var(--ink)] ml-1">
            {subValue}
          </span>
        )}
      </h3>

      {/* Bottom Text/Trend */}
      {bottomText && (
        <div className={`mt-4 flex items-center gap-1 text-xs font-bold ${bottomColorClass}`}>
          {bottomIcon && <FontAwesomeIcon icon={bottomIcon} />}
          <span>{bottomText}</span>
        </div>
      )}
    </div>
  );
}
