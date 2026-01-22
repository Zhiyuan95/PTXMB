"use client";

import { useActionState } from "react";
import { submitFeedback } from "@/lib/actions/feedback";
import Navigation from "../components/navigation";
import Footer from "../components/footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faCommentDots } from "@fortawesome/free-solid-svg-icons";

const initialState = {
  success: false,
  message: "",
};

export default function FeedbackPage() {
  const [state, formAction, isPending] = useActionState(submitFeedback, initialState);

  return (
    <div className="font-sans antialiased min-h-screen pb-20">
      <Navigation />
      
      <main className="max-w-3xl mx-auto px-8 pb-20 pt-12">
        <header className="mb-12 text-center animate-fade-in">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)] text-3xl mb-6">
                <FontAwesomeIcon icon={faCommentDots} />
           </div>
           <h1 className="font-display text-4xl font-bold mb-4 text-[color:var(--ink)]">
             意见反馈
           </h1>
           <p className="text-[color:var(--muted)] text-lg">
             您的每一条建议，都是菩提路上珍贵的助缘。
           </p>
        </header>

        <div className="glass-card p-8 md:p-12 rounded-[2rem] animate-fade-up">
            {state.success ? (
                <div className="text-center py-12">
                    <div className="text-5xl mb-4 text-[color:var(--primary)]">🎉</div>
                    <h3 className="text-2xl font-bold mb-2 text-[color:var(--ink)]">感谢您的反馈</h3>
                    <p className="text-[color:var(--muted)]">{state.message}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-8 text-sm font-bold text-[color:var(--primary)] hover:underline uppercase tracking-widest"
                    >
                        再次提交
                    </button>
                </div>
            ) : (
                <form action={formAction} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider pl-1">
                            反馈内容 *
                        </label>
                        <textarea 
                            name="content"
                            required
                            rows={6}
                            placeholder="请详细描述您的建议或遇到的问题..."
                            className="w-full rounded-2xl border-0 bg-white/50 px-6 py-4 text-[color:var(--ink)] ring-1 ring-[color:var(--line)] focus:ring-2 focus:ring-[color:var(--primary)] resize-none"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider pl-1">
                            联系方式 (选填)
                        </label>
                        <input 
                            name="contactInfo"
                            type="text"
                            placeholder="邮箱 / 微信 (方便我们就问题与您沟通)"
                            className="w-full rounded-2xl border-0 bg-white/50 px-6 py-4 text-[color:var(--ink)] ring-1 ring-[color:var(--line)] focus:ring-2 focus:ring-[color:var(--primary)]"
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isPending}
                            className="w-full py-4 bg-[color:var(--primary)] text-white rounded-xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isPending ? (
                                <span className="animate-pulse">正在提交...</span>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                    提交反馈
                                </>
                            )}
                        </button>
                    </div>
                    {state.message && !state.success && (
                        <p className="text-center text-red-500 text-sm font-bold bg-red-50 py-2 rounded-lg">
                            {state.message}
                        </p>
                    )}
                </form>
            )}
        </div>

        <Footer className="mt-16 border-[color:var(--accent)]/20" title="共修共进" />
      </main>
    </div>
  );
}
