"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", city: "", state: "", country: "Brasil",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function toggleInterest(cat: string) {
    setInterests((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, interests }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      if (data?.error?.fieldErrors) {
        const messages = Object.values(data.error.fieldErrors).flat().filter(Boolean) as string[];
        setError(messages.length ? messages.join(" ") : "Nao foi possivel cadastrar.");
      } else {
        setError(typeof data.error === "string" ? data.error : "Nao foi possivel cadastrar.");
      }
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md rounded-xl2 border border-line bg-surface p-8 shadow-sm">
        <h1 className="font-display text-lg font-semibold">Criar sua conta no EventGo</h1>
        <p className="mt-1 text-sm text-muted">Leva menos de um minuto.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input required placeholder="Nome completo" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral" />
          <input required type="email" placeholder="E-mail" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral" />
          <input placeholder="Telefone" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral" />
          <input required type="password" placeholder="Senha (min. 6 caracteres)" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Cidade" value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral" />
            <input placeholder="Estado" value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral" />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Seus interesses</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORIES.slice(0, 14).map((cat) => (
                <button
                  type="button" key={cat} onClick={() => toggleInterest(cat)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    interests.includes(cat)
                      ? "border-coral bg-coral/10 text-coral"
                      : "border-line text-muted hover:bg-ink/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}
          <button
            disabled={loading}
            className="mt-1 rounded-full bg-pin py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Ja tem conta? <Link href="/login" className="font-semibold text-coral">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
