"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import EventCard, { EventListItem } from "@/components/EventCard";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const SP_CENTER: [number, number] = [-23.5615, -46.6558];

export default function HomePage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    setLoading(true);
    fetch(`/api/events?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []))
      .finally(() => setLoading(false));
  }, [query, category]);

  const mapEvents = useMemo(
    () => events.map((e: any) => ({ ...e, latitude: e.latitude, longitude: e.longitude })),
    [events]
  );

  return (
    <div className="flex h-screen flex-col">
      <Navbar />

      <div className="border-b border-line bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-paper px-4 py-2">
            <span className="text-muted">🔎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cidade, evento, categoria ou organizador..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
          <select
            value={category ?? ""}
            onChange={(e) => setCategory(e.target.value || null)}
            className="rounded-full border border-line bg-paper px-3 py-2 text-sm"
          >
            <option value="">Todas categorias</option>
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-[380px] shrink-0 overflow-y-auto border-r border-line bg-paper p-4 md:block">
          <p className="mb-3 font-display text-sm font-semibold text-muted">
            {loading ? "Buscando eventos..." : `${events.length} eventos proximos`}
          </p>
          <div className="flex flex-col gap-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
            {!loading && events.length === 0 && (
              <p className="mt-8 text-center text-sm text-muted">
                Nenhum evento encontrado. Que tal criar o primeiro?
              </p>
            )}
          </div>
        </aside>

        <main className="relative flex-1">
          <MapView events={mapEvents} center={SP_CENTER} />
        </main>
      </div>
    </div>
  );
}
