"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface Quote {
  content: string;
  author: string;
  source?: string;
}

interface HitokotoQuote {
  hitokoto: string;
  from_who: string;
  from: string;
}

export interface FooterProps {
  title?: string;
  className?: string;
}

export default function Footer({
  title = "Witnessing Growth",
  className = "",
}: FooterProps) {
  const [quoteHistory, setQuoteHistory] = useState<Quote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchNewQuote = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/proxy/quote");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: HitokotoQuote = await res.json();
      const newQuote: Quote = {
        content: data.hitokoto,
        author: "度母之子",
        source: data.from,
      };
      
      setQuoteHistory(prev => [...prev, newQuote]);
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error("Error fetching quote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (quoteHistory.length === 0) {
      fetchNewQuote();
    }
  }, []);

  // Reset expansion when index changes
  useEffect(() => {
    setIsExpanded(false);
  }, [currentIndex]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quoteHistory.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      fetchNewQuote();
    }
  };

  const currentQuote = quoteHistory[currentIndex];

  if (!currentQuote) return null;

  const isLongQuote = currentQuote.content.length > 80;
  const displayContent = isExpanded || !isLongQuote 
    ? currentQuote.content 
    : `${currentQuote.content.slice(0, 80)}...`;

  return (
    <footer className={`glass-card p-10 rounded-3xl text-center group relative ${className}`}>
      <h4 className="text-[color:var(--muted)] text-[10px] font-bold tracking-[0.6em] uppercase mb-6 flex items-center justify-center gap-4">
        <span>{title}</span>
        <span className="w-1 h-1 rounded-full bg-[color:var(--muted)]/30"></span>
        <Link 
            href="/feedback" 
            className="hover:text-[color:var(--primary)] transition-colors cursor-pointer"
        >
            意见反馈
        </Link>
      </h4>
      
      <div className="relative max-w-3xl mx-auto flex items-start justify-between gap-4">
        {/* Previous Button */}
        <button 
          onClick={handlePrev}
          disabled={currentIndex <= 0}
          className={`p-2 mt-4 transition-all ${
            currentIndex <= 0 
              ? "opacity-0 cursor-default" 
              : "opacity-40 hover:opacity-100 hover:text-[color:var(--primary)] text-[color:var(--muted)]"
          }`}
          title="上一句"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
        </button>

        {/* Quote Content */}
        <div className="flex-1 min-h-[120px] flex flex-col justify-center ">
          <p className="text-left font-display text-md md:text-3xl text-[color:var(--ink)]/80 italic mb-4 leading-relaxed animate-fade-in key={currentQuote.content}">
            “{displayContent}”
          </p>
          
          {isLongQuote && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-[color:var(--primary)] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity mb-2 self-start"
            >
              {isExpanded ? "收起" : "展开全文"}
            </button>
          )}

          <p className="text-right text-sm text-[color:var(--muted)] font-serif mt-2 animate-fade-in key={currentQuote.author}">
             — {currentQuote.author} {currentQuote.source && <span className="opacity-70">· {currentQuote.source}</span>}
          </p>
        </div>

        {/* Next Button */}
        <button 
          onClick={handleNext}
          disabled={isLoading}
          className={`p-2 mt-4 transition-all opacity-40 hover:opacity-100 hover:text-[color:var(--primary)] text-[color:var(--muted)]`}
          title="下一句"
        >
           <FontAwesomeIcon icon={faChevronRight} className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
        </button>
      </div>
    </footer>
  );
}
