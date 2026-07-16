"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import InterestGauge from "@/components/InterestGauge";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch(`/api/events/${id}`);
    const data = await res.json();
    setEvent(data.event);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function toggle(action: "join" | "favorite") {
    setBusy(true);
    await fetch(`/api/events/${id}/${action}`, { method: "POST" });
    await load();
    setBusy(false);
  }

  if (loading) return <div className="min-h-screen bg-paper"><Navbar /><p className="p-8 text-sm text-muted">Carregando...</p></div>;
  if (!event) return <div className="min-h-screen bg-paper"><Navbar /><p className="p-8 text-sm text-muted">Evento nao encontrado.</p></div>;

  const date = new Date(event.startsAt);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-xl2 border border-line bg-surface p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="rounded-full bg-coral/10 px-2.5 py-1 text-xs font-semibold text-coral">
                {event.category.name}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold">{event.title}</h1>
              <p className="mt-1 text-sm text-muted">
                {date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} · {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="mt-1 text-sm text-muted">📍 {event.address}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <InterestGauge pct={event.interestPct} size={64} />
              <span className="text-[11px] font-medium text-muted">interesse</span>
            </div>
          </div>

          <p className="mt-5 whitespace-pre-line text-sm text-ink/90">{event.description}</p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted">
            {event.isFree ? (
              <span className="rounded-full bg-teal-light px-3 py-1 font-medium text-teal">Gratuito</span>
            ) : (
              <span className="rounded-full bg-amber/10 px-3 py-1 font-medium text-amber-700">R$ {event.price?.toFixed(2)}</span>
            )}
            {event.petFriendly && <span className="rounded-full bg-ink/5 px-3 py-1">🐾 Pet friendly</span>}
            {event.accessible && <span className="rounded-full bg-ink/5 px-3 py-1">♿ Acessivel</span>}
            {event.hasParking && <span className="rounded-full bg-ink/5 px-3 py-1">🅿️ Estacionamento</span>}
            {event.servesFood && <span className="rounded-full bg-ink/5 px-3 py-1">🍽️ Alimentacao</span>}
            {event.capacity && <span className="rounded-full bg-ink/5 px-3 py-1">{event.goingCount}/{event.capacity} vagas</span>}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              disabled={busy} onClick={() => toggle("join")}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold shadow-sm transition ${
                event.myStatus?.going ? "bg-teal text-white" : "bg-pin text-white"
              }`}
            >
              {event.myStatus?.going ? "✓ Presenca confirmada" : "Participar"}
            </button>
            <button
              disabled={busy} onClick={() => toggle("favorite")}
              className={`rounded-full border px-4 py-2.5 text-sm font-semibold ${
                event.myStatus?.favorited ? "border-coral text-coral" : "border-line text-muted"
              }`}
            >
              {event.myStatus?.favorited ? "★ Favoritado" : "☆ Favoritar"}
            </button>
            <button
              onClick={() => navigator.share ? navigator.share({ title: event.title, url: location.href }) : navigator.clipboard.writeText(location.href)}
              className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-muted hover:bg-ink/5"
            >
              Compartilhar
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 font-semibold">
              {event.organizer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{event.organizer.name}</p>
              <p className="text-xs text-muted">Organizador(a)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
