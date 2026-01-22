"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/auth-provider";
import Navigation from "../components/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUserCheck,
  faRightToBracket,
  faCloudUploadAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function AuthPage() {
  const { user, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(false); // 默认显示注册/绑定，鼓励用户保存数据
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLoginMode) {
        // 登录逻辑
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        router.push("/"); // 登录成功回首页
      } else {
        // 注册/绑定逻辑
        const { error } = await signUpWithEmail(email, password);
        if (error) throw error;
        setMessage(
          "账号绑定成功！请检查邮箱进行验证（如需要），您的数据已保存。",
        );
      }
    } catch (err: any) {
      setError(
        err.message === "User already registered"
          ? "该邮箱已被注册，请切换到登录模式。"
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const isAnonymous = user?.is_anonymous;

  return (
    <div className="min-h-screen pb-20 font-sans bg-[color:var(--background)]">
      <Navigation />

      <main className="max-w-md mx-auto px-6 pt-12">
        <div className="glass-card p-8 rounded-3xl animate-fade-in">
          {/* 用户状态头 */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent)] flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
              {isAnonymous ? "?" : <FontAwesomeIcon icon={faUserCheck} />}
            </div>
            <h2 className="font-display text-2xl font-bold text-[color:var(--ink)]">
              {isAnonymous ? "游客模式" : user?.email}
            </h2>
            <p className="text-sm text-[color:var(--muted)] mt-2">
              {isAnonymous
                ? "当前数据仅保存在此设备。建议绑定邮箱以永久保存。"
                : "已登录。您的修行记录正在云端同步。"}
            </p>
          </div>

          {!isAnonymous && !error && !message ? (
            <div className="space-y-4">
              <button
                onClick={() => signOut()}
                className="w-full rounded-xl border border-[color:var(--line)] bg-white/50 py-4 text-sm font-bold text-[color:var(--ink)] hover:bg-white transition-all"
              >
                退出登录
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full rounded-xl bg-[color:var(--primary)] py-4 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-all"
              >
                返回首页
              </button>
            </div>
          ) : (
            <>
              {/* 切换 Tab */}
              <div className="flex p-1 bg-[color:var(--surface-strong)] rounded-xl mb-6">
                <button
                  onClick={() => {
                    setIsLoginMode(false);
                    setError(null);
                  }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLoginMode ? "bg-white text-[color:var(--primary)] shadow-sm" : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"}`}
                >
                  <FontAwesomeIcon icon={faCloudUploadAlt} className="mr-2" />
                  保存数据 (注册)
                </button>
                <button
                  onClick={() => {
                    setIsLoginMode(true);
                    setError(null);
                  }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLoginMode ? "bg-white text-[color:var(--primary)] shadow-sm" : "text-[color:var(--muted)] hover:text-[color:var(--ink)]"}`}
                >
                  <FontAwesomeIcon icon={faRightToBracket} className="mr-2" />
                  切换账号 (登录)
                </button>
              </div>

              {/* 提示信息 */}
              <div className="mb-6 text-xs leading-relaxed p-4 rounded-xl bg-[color:var(--surface-strong)] text-[color:var(--muted)]">
                {isLoginMode
                  ? "注意：登录其他账号后，当前未保存的游客数据将被覆盖（不会丢失，但需退出登录找回）。"
                  : "将当前的修行记录绑定到新邮箱。绑定后，您可以在任何设备上登录并同步数据。"}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
                  />
                  <input
                    type="email"
                    required
                    placeholder="邮箱地址"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border-0 bg-white/50 pl-11 pr-4 py-4 text-[color:var(--ink)] ring-1 ring-[color:var(--line)] focus:ring-2 focus:ring-[color:var(--primary)]"
                  />
                </div>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
                  />
                  <input
                    type="password"
                    required
                    placeholder="密码 (至少6位)"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border-0 bg-white/50 pl-11 pr-4 py-4 text-[color:var(--ink)] ring-1 ring-[color:var(--line)] focus:ring-2 focus:ring-[color:var(--primary)]"
                  />
                </div>

                {error && (
                  <div className="text-xs text-red-500 bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="text-xs text-green-600 bg-green-50 p-3 rounded-lg">
                    {message}
                  </div>
                )}

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full rounded-xl bg-[color:var(--primary)] py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "处理中..."
                    : isLoginMode
                      ? "立即登录"
                      : "确认绑定"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
