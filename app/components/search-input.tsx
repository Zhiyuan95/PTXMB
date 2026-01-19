import { faSearch, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "搜索...",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] py-3 pl-10 pr-4 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)] transition-all"
      />
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]">
        <FontAwesomeIcon icon={faSearch} />
      </div>
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] hover:text-[color:var(--ink)]"
        >
          <FontAwesomeIcon icon={faTimesCircle} />
        </button>
      )}
    </div>
  );
}
