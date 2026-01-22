"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/auth-provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faArrowRight,
  faSpinner,
  faVihara,
} from "@fortawesome/free-solid-svg-icons";

export default function AuthPage() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        // 登录成功后，AuthProvider 会自动检测到 user 变化并 redirect
        // 但为了交互更流畅，我们也可以手动 push
        router.push("/");
      } else {
        if (!name.trim()) throw new Error("请输入您的称呼");
        const { error } = await signUpWithEmail(email, password, name);
        if (error) throw error;
        // 注册成功提示
        alert("注册成功！");
        // 自动切回登录模式或直接进入（取决于 Supabase 是否要求验证）
        // 这里我们假设你已经关闭了 Confirm Email，所以直接登录
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Invalid login credentials")) {
        setError("账号或密码错误");
      } else if (err.message.includes("Email not confirmed")) {
        setError("请先去邮箱确认验证邮件");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--background)] p-6 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[color:var(--primary)]/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[color:var(--accent)]/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md glass-card p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative z-10 animate-fade-up">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[color:var(--primary)] flex items-center justify-center shadow-lg shadow-primary/30 mb-6 text-white text-3xl">
            <FontAwesomeIcon icon={faVihara} />
          </div>
          <h2 className="font-display text-3xl font-bold text-[color:var(--ink)]">
            {mode === "login" ? "欢迎回来" : "加入修行"}
          </h2>
          <p className="text-[color:var(--muted)] mt-2 text-center">
            {mode === "login"
              ? "登录您的账号，继续精进之路"
              : "创建账号，记录每一份功德"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "register" && (
            <div className="space-y-2">
              <div className="relative group">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-[color:var(--muted)] group-focus-within:text-[color:var(--primary)] transition-colors"
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-transparent bg-white/60 pl-12 pr-6 py-4 text-[color:var(--ink)] outline-none ring-2 ring-transparent focus:ring-[color:var(--primary)]/20 focus:bg-white transition-all shadow-sm"
                  placeholder="怎么称呼您"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="relative group">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[color:var(--muted)] group-focus-within:text-[color:var(--primary)] transition-colors"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-transparent bg-white/60 pl-12 pr-6 py-4 text-[color:var(--ink)] outline-none ring-2 ring-transparent focus:ring-[color:var(--primary)]/20 focus:bg-white transition-all shadow-sm"
                placeholder="电子邮箱"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <FontAwesomeIcon
                icon={faLock}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[color:var(--muted)] group-focus-within:text-[color:var(--primary)] transition-colors"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-transparent bg-white/60 pl-12 pr-6 py-4 text-[color:var(--ink)] outline-none ring-2 ring-transparent focus:ring-[color:var(--primary)]/20 focus:bg-white transition-all shadow-sm"
                placeholder="密码 (至少6位)"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 flex items-center gap-2 animate-shake">
              ⚠️ {error}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 rounded-2xl bg-[color:var(--primary)] text-white font-bold shadow-xl shadow-primary/20 hover:bg-[color:var(--primary-dark)] hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> 处理中...
              </>
            ) : (
              <>
                {mode === "login" ? "立即登录" : "创建账号"}
                <FontAwesomeIcon icon={faArrowRight} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
            className="text-[color:var(--muted)] hover:text-[color:var(--ink)] text-sm font-medium transition-colors"
          >
            {mode === "login" ? (
              <>
                还没有账号？{" "}
                <span className="text-[color:var(--primary)] font-bold">
                  去注册
                </span>
              </>
            ) : (
              <>
                已有账号？{" "}
                <span className="text-[color:var(--primary)] font-bold">
                  去登录
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
