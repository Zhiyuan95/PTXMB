"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVihara, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              className={`px-6 py-2 rounded-xl transition-all text-md ${
                isActive("/") ? activeClass : inactiveClass
              }`}
            >
              记录
            </button>
          </Link>
          <Link href="/review">
            <button
              className={`px-6 py-2 rounded-xl transition-all text-md ${
                isActive("/review") ? activeClass : inactiveClass
              }`}
            >
              复盘
            </button>
          </Link>
          <Link href="/settings">
            <button
              className={`px-6 py-2 rounded-xl transition-all text-md ${
                isActive("/settings") ? activeClass : inactiveClass
              }`}
            >
              管理
            </button>
          </Link>
          <Link href="/feedback">
            <button
              className={`px-6 py-2 rounded-xl transition-all text-md ${
                isActive("/feedback") ? activeClass : inactiveClass
              }`}
            >
              反馈
            </button>
          </Link>
        </div>

        {/* Desktop User Section */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] flex items-center justify-center text-white font-bold text-sm shadow-md">
              User
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[color:var(--ink)] hover:bg-white/40 transition-colors"
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon 
            icon={isMobileMenuOpen ? faTimes : faBars} 
            className="text-xl" 
          />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 p-4 rounded-2xl glass-card animate-fade-in">
          {/* Navigation Links */}
          <div className="flex flex-col gap-2 mb-4">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className={`w-full px-4 py-3 rounded-xl transition-all text-md text-left ${
                  isActive("/") ? activeClass : inactiveClass
                }`}
              >
                记录
              </button>
            </Link>
            <Link href="/review" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className={`w-full px-4 py-3 rounded-xl transition-all text-md text-left ${
                  isActive("/review") ? activeClass : inactiveClass
                }`}
              >
                复盘
              </button>
            </Link>
            <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className={`w-full px-4 py-3 rounded-xl transition-all text-md text-left ${
                  isActive("/settings") ? activeClass : inactiveClass
                }`}
              >
                管理
              </button>
            </Link>
            <Link href="/feedback" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className={`w-full px-4 py-3 rounded-xl transition-all text-md text-left ${
                  isActive("/feedback") ? activeClass : inactiveClass
                }`}
              >
                反馈
              </button>
            </Link>
          </div>

          {/* User Section in Mobile Menu */}
          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/30">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] flex items-center justify-center text-white font-bold text-sm shadow-md">
                  User
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[color:var(--ink)]">当前用户</p>
                <p className="text-xs text-[color:var(--muted)]">在线</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
