"use client";
import { useEffect, useState } from "react";

export type SessionUser = {
  id: string;
  name: string;
  username?: string | null;
  email: string;
  avatarUrl?: string | null;
  city?: string | null;
  state?: string | null;
  points: number;
  level: number;
  interests?: string | null;
  bio?: string | null;
  isPublic?: boolean;
} | null;

// Hook simples que busca o usuario logado (via cookie httpOnly) em /api/auth/me.
export function useSession() {
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { user, loading, refresh };
}
