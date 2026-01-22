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
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  // 新增方法
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signInAnonymously: async () => {},
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

  const signInAnonymously = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in anonymously:", error);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.refresh(); // 刷新页面以清除缓存数据
  }, [supabase, router]);

  // 新增：邮箱登录
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, [supabase]);

  // 新增：注册/绑定邮箱 (将匿名用户升级为永久用户)
  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    // 检查当前是否为匿名用户
    const isAnonymous = user?.is_anonymous;

    if (isAnonymous) {
      // 如果是匿名用户，我们使用 updateUser 来保留当前数据并绑定邮箱
      const { error } = await supabase.auth.updateUser({
        email: email,
        password: password,
      });
      return { error };
    } else {
      // 如果没有用户或已是正式用户（理论上不应发生，除非直接调API），走普通注册流程
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    }
  }, [supabase, user]);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        // Auto sign-in anonymously if no session
        signInAnonymously();
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      // 当用户状态改变时（例如从匿名变为登录），刷新页面以确保数据（如React Query缓存）更新
      if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
        router.refresh(); 
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, signInAnonymously, router]);

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, signInAnonymously, signOut, signInWithEmail, signUpWithEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};