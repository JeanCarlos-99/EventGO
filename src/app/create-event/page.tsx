"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", category: DEFAULT_CATEGORIES[0], address: "",
    latitude: -23.5615, longitude: -46.6558, startsAt: "", capacity: "", isFree: true, price: "",
    petFriendly: false, accessible: false, hasParking: false, servesFood: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        capacity: form.capacity ? Number(form.capacity) : undefined,
        price: form.isFree ? undefined : Number(form.price),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(res.status === 401 ? "Faca login para criar um evento." : "Verifique os campos do formulario.");
      return;
    }
    const data = await res.json();
    router.push(`/event/${data.event.id}`);
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-xl font-bold">Criar evento</h1>
        <p className="mt-1 text-sm text-muted">Preencha os detalhes. Voce ganha pontos ao publicar.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-xl2 border border-line bg-surface p-6">
          <input required placeholder="Titulo do evento" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral" />

          <textarea required placeholder="Descricao" rows={4} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral" />

          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-lg border border-line px-3 py-2 text-sm">
              {DEFAULT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="datetime-local" required value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              className="rounded-lg border border-line px-3 py-2 text-sm" />
          </div>

          <input required placeholder="Endereco" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral" />

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Latitude" type="number" step="any" value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) as any })}
              className="rounded-lg border border-line px-3 py-2 text-sm" />
            <input placeholder="Longitude" type="number" step="any" value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) as any })}
              className="rounded-lg border border-line px-3 py-2 text-sm" />
          </div>
          <p className="-mt-2 text-[11px] text-muted">
            Dica: no app final, o usuario marca o local direto no mapa e o endereco e' preenchido automaticamente.
          </p>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />
              Gratuito
            </label>
            {!form.isFree && (
              <input placeholder="Preco (R$)" type="number" step="0.01" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="rounded-lg border border-line px-3 py-1.5 text-sm" />
            )}
            <input placeholder="Vagas (opcional)" type="number" value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="rounded-lg border border-line px-3 py-1.5 text-sm" />
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {[
              ["petFriendly", "Pet friendly"],
              ["accessible", "Acessibilidade"],
              ["hasParking", "Estacionamento"],
              ["servesFood", "Alimentacao"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
                {label}
              </label>
            ))}
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}
          <button disabled={loading}
            className="mt-2 rounded-full bg-pin py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60">
            {loading ? "Publicando..." : "Publicar evento"}
          </button>
        </form>
      </div>
    </div>
  );
}
