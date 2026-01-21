export interface FooterProps {
  title?: string;
  quote?: string;
  className?: string;
}

export default function Footer({
  title = "Witnessing Growth",
  quote = "“不积跬步，无以至千里；不积小流，无以成江海。”",
  className = "",
}: FooterProps) {
  return (
    <footer className={`glass-card p-10 rounded-3xl text-center ${className}`}>
      <h4 className="text-[color:var(--muted)] text-[10px] font-bold tracking-[0.6em] uppercase mb-6">
        {title}
      </h4>
      <p className="font-display text-2xl md:text-3xl text-[color:var(--ink)]/80 italic mb-4 max-w-3xl mx-auto leading-relaxed">
        {quote}
      </p>
    </footer>
  );
}
