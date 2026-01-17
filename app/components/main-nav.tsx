"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "记录" },
  { href: "/review", label: "复盘" },
  { href: "/settings", label: "创建功课" },
];

const baseClass =
  "rounded-full border border-transparent px-4 py-2 text-[color:var(--muted)] hover:border-[color:var(--line)] hover:text-[color:var(--ink)]";
const activeClass =
  "rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 text-[color:var(--ink)] shadow-[var(--shadow-soft)]";

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            className={isActive ? activeClass : baseClass}
            href={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
