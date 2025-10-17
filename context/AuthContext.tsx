"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
  adminLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // โหลดโปรไฟล์จากคุกกี้ HttpOnly ตอน mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/auth/profile", { credentials: "include" });
        if (!cancelled && r.ok) {
          const { user } = await r.json();
          setUser(user);
        } else if (!cancelled) {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // รหัสผ่าน: server จะตั้งคุกกี้ให้เอง
  const login = async (email: string, password: string, remember: boolean) => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // แนบ/รับคุกกี้
      body: JSON.stringify({ email, password, remember }),
    });
    const js = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(js.error || "Login failed");

    // ดึงโปรไฟล์ใหม่จากคุกกี้
    const pr = await fetch("/api/auth/profile", { credentials: "include" });
    if (pr.ok) {
      const { user } = await pr.json();
      setUser(user);
    }
    router.push("/");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    router.push("/login");
  };

  const adminLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    router.push("/admin/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
