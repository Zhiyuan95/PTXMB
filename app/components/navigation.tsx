"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVihara } from "@fortawesome/free-solid-svg-icons";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/review")) return "修行复盘";
    if (pathname.startsWith("/settings")) return "修行管理";
    return "修行记录";
  };

  const activeClass = "bg-[color:var(--primary)] text-white shadow-md transform scale-105 font-bold";
  const inactiveClass = "text-[color:var(--muted)] hover:bg-white/40 hover:text-[color:var(--ink)]";

  return (
    <nav className="sticky top-0 z-50 px-6 py-3 glass-nav mb-8 border-b border-white/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--primary)] flex items-center justify-center shadow-lg shadow-primary/20">
            <FontAwesomeIcon icon={faVihara} className="text-white text-lg" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-stone-800 to-stone-500">
            {getPageTitle()}
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl glass-card">
          <Link href="/">
            <button
              className={`px-6 py-2 rounded-xl transition-all text-sm ${
                isActive("/") ? activeClass : inactiveClass
              }`}
            >
              记录
            </button>
          </Link>
          <Link href="/review">
            <button
              className={`px-6 py-2 rounded-xl transition-all text-sm ${
                isActive("/review") ? activeClass : inactiveClass
              }`}
            >
              复盘
            </button>
          </Link>
          <Link href="/settings">
            <button
              className={`px-6 py-2 rounded-xl transition-all text-sm ${
                isActive("/settings") ? activeClass : inactiveClass
              }`}
            >
              管理
            </button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative group cursor-pointer">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] flex items-center justify-center text-white font-bold text-sm shadow-md">
                 User
             </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </nav>
  );
}
