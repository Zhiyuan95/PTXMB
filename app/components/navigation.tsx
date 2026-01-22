"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVihara,
  faBars,
  faTimes,
  faSignOutAlt,
  faUser,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/app/providers/auth-provider";

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // 如果在 auth 页面，通常不显示导航栏，或者显示简化版
  // 这里我们选择不显示，因为 auth 页面往往是独立的
  if (pathname === "/auth") return null;

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/review")) return "修行复盘";
    if (pathname.startsWith("/settings")) return "修行管理";
    if (pathname.startsWith("/feedback")) return "意见反馈";
    return "修行记录";
  };

  const activeClass =
    "bg-[color:var(--primary)] text-white shadow-md transform scale-105 font-bold";
  const inactiveClass =
    "text-[color:var(--muted)] hover:bg-white/40 hover:text-[color:var(--ink)]";

  // 获取用户首字母
  const userInitial =
    user?.user_metadata?.full_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";
  const userName = user?.user_metadata?.full_name || "修行者";

  return (
    <nav className="sticky top-0 z-50 px-4 sm:px-6 py-3 glass-nav mb-8 border-b border-white/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--primary)] flex items-center justify-center shadow-lg shadow-primary/20">
            <FontAwesomeIcon icon={faVihara} className="text-white text-lg" />
          </div>
          <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-stone-800 to-stone-500">
            {getPageTitle()}
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl glass-card">
          <Link href="/">
            <button
              className={`px-6 py-2 rounded-xl transition-all text-md ${isActive("/") ? activeClass : inactiveClass}`}
            >
              记录
            </button>
          </Link>
          <Link href="/review">
            <button
              className={`px-6 py-2 rounded-xl transition-all text-md ${isActive("/review") ? activeClass : inactiveClass}`}
            >
              复盘
            </button>
          </Link>
          <Link href="/settings">
            <button
              className={`px-6 py-2 rounded-xl transition-all text-md ${isActive("/settings") ? activeClass : inactiveClass}`}
            >
              管理
            </button>
          </Link>
          <Link href="/feedback">
            <button
              className={`px-6 py-2 rounded-xl transition-all text-md ${isActive("/feedback") ? activeClass : inactiveClass}`}
            >
              反馈
            </button>
          </Link>
        </div>

        {/* Desktop User Section */}
        <div className="hidden md:flex items-center gap-4 relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-white/50 transition-colors border border-transparent hover:border-white/40"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {userInitial}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-[color:var(--ink)]">
                {userName}
              </p>
            </div>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="text-xs text-[color:var(--muted)] ml-1"
            />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsUserMenuOpen(false)}
              ></div>
              <div className="absolute right-0 top-14 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden z-50 animate-fade-in p-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-400">当前账号</p>
                  <p className="text-xs font-bold text-gray-700 truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors font-medium"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} /> 退出登录
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[color:var(--ink)] hover:bg-white/40 transition-colors"
        >
          <FontAwesomeIcon
            icon={isMobileMenuOpen ? faTimes : faBars}
            className="text-xl"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 p-4 rounded-3xl glass-card animate-fade-in border border-white/40 shadow-xl">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-black/5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {userInitial}
            </div>
            <div>
              <p className="font-bold text-lg text-[color:var(--ink)]">
                {userName}
              </p>
              <p className="text-xs text-[color:var(--muted)]">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className={`w-full px-4 py-4 rounded-2xl text-left font-bold transition-all ${isActive("/") ? "bg-[color:var(--primary)] text-white" : "text-[color:var(--ink)] hover:bg-white/50"}`}
              >
                记录
              </button>
            </Link>
            <Link href="/review" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className={`w-full px-4 py-4 rounded-2xl text-left font-bold transition-all ${isActive("/review") ? "bg-[color:var(--primary)] text-white" : "text-[color:var(--ink)] hover:bg-white/50"}`}
              >
                复盘
              </button>
            </Link>
            <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className={`w-full px-4 py-4 rounded-2xl text-left font-bold transition-all ${isActive("/settings") ? "bg-[color:var(--primary)] text-white" : "text-[color:var(--ink)] hover:bg-white/50"}`}
              >
                管理
              </button>
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-black/5">
            <button
              onClick={() => signOut()}
              className="w-full px-4 py-4 rounded-2xl bg-red-50 text-red-600 font-bold text-sm flex items-center justify-center gap-2 active:bg-red-100"
            >
              <FontAwesomeIcon icon={faSignOutAlt} /> 退出登录
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
