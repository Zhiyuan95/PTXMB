import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
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
