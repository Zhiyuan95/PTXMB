"use client";

import { createClient } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.replace("/auth"); // 登出后强制去登录页
    router.refresh();
  }, [supabase, router]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    },
    [supabase],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, name: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      return { error };
    },
    [supabase],
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setSession(session);
        setUser(session?.user ?? null);

        // --- 核心改动：路由守卫逻辑 ---
        // 如果没有 Session 且当前不在 /auth 页面，强制跳转
        if (!session && pathname !== "/auth") {
          router.replace("/auth");
        }
        // 如果已经有 Session 但用户还在 /auth 页面（例如手动输入网址），跳转回首页
        else if (session && pathname === "/auth") {
          router.replace("/");
        }
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (_event === "SIGNED_OUT") {
        router.replace("/auth");
      } else if (_event === "SIGNED_IN") {
        router.refresh();
        if (pathname === "/auth") router.replace("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, pathname]);

  // --- 核心改动：全屏 Loading ---
  // 在检查完身份之前，不渲染任何子组件，防止内容闪烁
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[color:var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-3xl text-[color:var(--primary)]"
          />
          <p className="text-[color:var(--muted)] text-sm tracking-widest uppercase">
            Loading
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOut,
        signInWithEmail,
        signUpWithEmail,
      }}
    >
      {/* 只有在非 /auth 页面且有用户，或者在 /auth 页面时才渲染内容 */}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
