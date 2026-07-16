"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@eventgo.app");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Nao foi possivel entrar.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-xl2 border border-line bg-surface p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="pin-marker" style={{ width: 30, height: 30 }}><span>📍</span></span>
          <span className="font-display text-xl font-bold">EventGo</span>
        </div>
        <h1 className="font-display text-lg font-semibold">Entrar na sua conta</h1>
        <p className="mt-1 text-sm text-muted">Descubra eventos perto de voce.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail" className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral"
          />
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha" className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral"
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <button
            disabled={loading}
            className="mt-1 rounded-full bg-pin py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-line" /> ou continue com <div className="h-px flex-1 bg-line" />
        </div>

        <div className="flex flex-col gap-2">
          {["Google", "Facebook", "Apple"].map((provider) => (
            <button
              key={provider}
              type="button"
              title="Integracao de OAuth real precisa das credenciais do provedor (ver .env.example)"
              className="rounded-full border border-line py-2 text-sm font-medium hover:bg-ink/5"
            >
              Continuar com {provider}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Nao tem conta? <Link href="/register" className="font-semibold text-coral">Cadastre-se</Link>
        </p>
        <p className="mt-3 text-center text-[11px] text-muted">
          Ao continuar, voce aceita os Termos de Uso e a Politica de Privacidade.
        </p>
      </div>
    </div>
  );
}
