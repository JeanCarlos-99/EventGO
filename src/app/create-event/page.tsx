"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type GeoResult = { label: string; latitude: number; longitude: number };

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", category: DEFAULT_CATEGORIES[0] as string, address: "",
    latitude: null as number | null, longitude: null as number | null,
    startsAt: "", capacity: "", isFree: true, price: "",
    petFriendly: false, accessible: false, hasParking: false, servesFood: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Busca sugestoes de endereco enquanto o usuario digita (com debounce, pra
  // nao disparar uma requisicao a cada letra). Usa a API de geocodificacao
  // do OpenStreetMap (ver src/app/api/geocode).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (addressQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(addressQuery)}`);
        const data = await res.json();
        setSuggestions(data.results || []);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [addressQuery]);

  function pickSuggestion(s: GeoResult) {
    setForm({ ...form, address: s.label, latitude: s.latitude, longitude: s.longitude });
    setAddressQuery(s.label);
    setSuggestions([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.latitude === null || form.longitude === null) {
      setError("Busque o endereco na lista de sugestoes e selecione um resultado, para localizarmos o evento no mapa.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        latitude: form.latitude,
        longitude: form.longitude,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        price: form.isFree ? undefined : Number(form.price),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      if (res.status === 401) {
        setError("Faca login para criar um evento.");
      } else if (data?.error?.fieldErrors) {
        const messages = Object.values(data.error.fieldErrors).flat().filter(Boolean) as string[];
        setError(messages.length ? messages.join(" ") : "Verifique os campos do formulario.");
      } else {
        setError(typeof data.error === "string" ? data.error : "Verifique os campos do formulario.");
      }
      return;
    }
    const data = await res.json();
    router.push(`/event/${data.event.id}`);
  }

  const previewEvents = form.latitude !== null && form.longitude !== null
    ? [{
        id: "preview", title: form.title || "Local do evento", category: form.category,
        address: form.address, interestPct: 0, latitude: form.latitude, longitude: form.longitude,
        description: "", startsAt: form.startsAt || new Date().toISOString(), isFree: true, goingCount: 0,
      } as any]
    : [];

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

          <textarea required placeholder="Descricao (minimo 3 caracteres)" rows={4} value={form.description}
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

          <div className="relative">
            <input
              required
              placeholder="Buscar cidade, bairro ou endereco..."
              value={addressQuery || form.address}
              onChange={(e) => {
                setAddressQuery(e.target.value);
                setForm({ ...form, address: e.target.value, latitude: null, longitude: null });
              }}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-coral"
            />
            {searching && <p className="mt-1 text-[11px] text-muted">Buscando...</p>}
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
                {suggestions.map((s, i) => (
                  <button
                    type="button" key={i} onClick={() => pickSuggestion(s)}
                    className="block w-full border-b border-line px-3 py-2 text-left text-xs last:border-0 hover:bg-ink/5"
                  >
                    📍 {s.label}
                  </button>
                ))}
              </div>
            )}
            {form.latitude !== null && form.longitude !== null ? (
              <p className="mt-1 text-[11px] font-medium text-teal">✓ Local encontrado no mapa</p>
            ) : (
              <p className="mt-1 text-[11px] text-muted">
                Digite e escolha uma opcao da lista para localizarmos o evento no mapa.
              </p>
            )}
          </div>

          {previewEvents.length > 0 && (
            <div className="h-52 overflow-hidden rounded-xl border border-line">
              <MapView events={previewEvents} center={[form.latitude!, form.longitude!]} />
            </div>
          )}

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
