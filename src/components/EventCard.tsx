"use client";
import Link from "next/link";
import InterestGauge from "./InterestGauge";

export type EventListItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  address: string;
  startsAt: string;
  isFree: boolean;
  price?: number | null;
  capacity?: number | null;
  goingCount: number;
  interestPct: number;
  coverImage?: string | null;
};

export default function EventCard({ event }: { event: EventListItem }) {
  const date = new Date(event.startsAt);
  const dateLabel = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const timeLabel = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link
      href={`/event/${event.id}`}
      className="group flex gap-3 rounded-xl2 border border-line bg-surface p-3 transition hover:border-coral/40 hover:shadow-md"
    >
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-coral/15 to-amber/15 text-center font-display text-xs font-semibold text-coral">
        <div>
          <div className="text-lg leading-none">{dateLabel.split(" ")[0]}</div>
          <div className="uppercase">{dateLabel.split(" ")[1]}</div>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-ink group-hover:text-coral">
              {event.title}
            </p>
            <p className="mt-0.5 text-xs text-muted">{event.category} · {timeLabel}</p>
          </div>
          <InterestGauge pct={event.interestPct} size={40} />
        </div>

        <p className="mt-1 truncate text-xs text-muted">{event.address}</p>

        <div className="mt-2 flex items-center gap-3 text-xs">
          <span className={`rounded-full px-2 py-0.5 font-medium ${event.isFree ? "bg-teal-light text-teal" : "bg-amber/10 text-amber-700"}`}>
            {event.isFree ? "Gratuito" : `R$ ${event.price?.toFixed(2)}`}
          </span>
          <span className="text-muted">👥 {event.goingCount} confirmados</span>
        </div>
      </div>
    </Link>
  );
}
