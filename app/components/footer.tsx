"use client";

import { useEffect, useState } from "react";
import { getDailyQuote, getRandomQuote, type Quote } from "@/lib/quotes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

export interface FooterProps {
  title?: string;
  className?: string;
}

export default function Footer({
  title = "Witnessing Growth",
  className = "",
}: FooterProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    // Initial load: Get the daily quote
    setQuote(getDailyQuote());
  }, []);

  const handleRefresh = () => {
    setIsRotating(true);
    // Add a small delay for visual feedback of rotation
    setTimeout(() => {
      setQuote(getRandomQuote());
      setIsRotating(false);
    }, 500);
  };

  if (!quote) return null; // Or a skeleton

  return (
    <footer className={`glass-card p-10 rounded-3xl text-center group relative ${className}`}>
      <h4 className="text-[color:var(--muted)] text-[10px] font-bold tracking-[0.6em] uppercase mb-6">
        {title}
      </h4>
      <div className="relative max-w-3xl mx-auto">
        <p className="font-display text-2xl md:text-3xl text-[color:var(--ink)]/80 italic mb-4 leading-relaxed animate-fade-in key={quote.content}">
          “{quote.content}”
        </p>
        <p className="text-sm text-[color:var(--muted)] font-serif mt-4 animate-fade-in key={quote.author}">
           — {quote.author} {quote.source && <span className="opacity-70">· {quote.source}</span>}
        </p>

        {/* Refresh Action (Visible on Hover) */}
        <button 
          onClick={handleRefresh}
          className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-2 text-[color:var(--muted)] hover:text-[color:var(--primary)]"
          title="换一句"
        >
          <FontAwesomeIcon icon={faSyncAlt} className={`${isRotating ? "animate-spin" : ""}`} />
        </button>
      </div>
    </footer>
  );
}
