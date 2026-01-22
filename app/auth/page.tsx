"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/auth-provider";
import Navigation from "../components/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEnvelope, 
  faLock, 
  faUser, 
  faArrowRight 
} from "@fortawesome/free-solid-svg-icons";

export default function AuthPage() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  
  // 状态： "login" | "register"
  const [mode, setMode] = useState<"login" | "register">("login");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === "login") {
        // 登录
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        router.push("/"); // 登录成功跳转
      } else {
        // 注册
        if (!name.trim()) throw new Error("请输入您的称呼");
        
        const { error } = await signUpWithEmail(email, password, name);
        if (error) throw error;
        
        // 注册成功后，通常 Supabase 默认开启邮箱验证。
        // 如果你关闭了邮箱验证，可以直接登录。
        // 这里假设需要验证，或者直接提示用户。
        setSuccessMsg("注册成功！");
        // 如果 Supabase 设置为不需要验证邮箱即可登录，这里可以自动登录，或者切回登录页
        // router.push("/"); 
      }
    } catch (err: any) {
      setError(err.message || "发生错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-[color:var(--background)]">
      <Navigation />
      
      <main className="max-w-md mx-auto px-6 pt-12">
        <div className="glass-card p-8 rounded-3xl animate-fade-in shadow-xl border border-white/40">
          
          {/* 标题区 */}
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold text-[color:var(--ink)] mb-2">
              {mode === "login" ? "欢迎回来" : "加入修行"}
            </h2>
            <p className="text-[color:var(--muted)] text-sm">
              {mode === "login" 
                ? "登录账号，继续您的精进之路" 
                : "创建账号，开始记录每一份功德"}
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 只有注册模式显示名字输入 */}
            {mode === "register" && (
              <div className="space-y-1 animate-fade-in">
                <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider ml-1">
                  怎么称呼您 *
                </label>
                <div className="relative">
                  <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="您的法名或昵称"
                    className="w-full rounded-xl border-0 bg-white/60 pl-11 pr-4 py-3.5 text-[color:var(--ink)] ring-1 ring-[color:var(--line)] focus:ring-2 focus:ring-[color:var(--primary)] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider ml-1">
                电子邮箱 *
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border-0 bg-white/60 pl-11 pr-4 py-3.5 text-[color:var(--ink)] ring-1 ring-[color:var(--line)] focus:ring-2 focus:ring-[color:var(--primary)] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[color:var(--muted)] uppercase tracking-wider ml-1">
                密码 *
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 位字符"
                  className="w-full rounded-xl border-0 bg-white/60 pl-11 pr-4 py-3.5 text-[color:var(--ink)] ring-1 ring-[color:var(--line)] focus:ring-2 focus:ring-[color:var(--primary)] transition-all"
                />
              </div>
            </div>

            {/* 错误/成功提示 */}
            {error && (
              <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}
            {successMsg && (
              <div className="text-xs text-green-600 bg-green-50 p-3 rounded-xl border border-green-100 flex items-center gap-2">
                ✅ {successMsg}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              disabled={loading}
              type="submit"
              className="w-full rounded-xl bg-[color:var(--primary)] py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-[color:var(--primary-dark)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "处理中..." : (
                <>
                  {mode === "login" ? "立即登录" : "注册账号"}
                  <FontAwesomeIcon icon={faArrowRight} />
                </>
              )}
            </button>
          </form>

          {/* 切换模式 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[color:var(--muted)]">
              {mode === "login" ? "还没有账号？" : "已有账号？"}
              <button 
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="ml-2 font-bold text-[color:var(--primary)] hover:underline focus:outline-none"
              >
                {mode === "login" ? "去注册" : "去登录"}
              </button>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}