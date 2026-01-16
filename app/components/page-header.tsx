import MainNav from "./main-nav";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold text-[color:var(--ink)] md:text-4xl font-serif">
          {title}
        </h1>
        <p className="text-sm text-[color:var(--muted)]">{description}</p>
      </div>
      <MainNav />
    </header>
  );
}
