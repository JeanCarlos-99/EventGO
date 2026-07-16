"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { useEffect } from "react";
import Link from "next/link";
import InterestGauge from "./InterestGauge";
import type { EventListItem } from "./EventCard";

// Marcador em forma de pin com o gradiente de assinatura do EventGo (mesmo
// elemento visual usado no medidor de interesse).
function pinIcon() {
  const html = renderToStaticMarkup(
    <div className="pin-marker">
      <span>📍</span>
    </div>
  );
  return L.divIcon({ html, className: "", iconSize: [34, 34], iconAnchor: [17, 30] });
}

function RecenterButton({ center }: { center: [number, number] }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.flyTo(center, 14)}
      className="absolute bottom-6 right-4 z-[999] rounded-full bg-surface px-3 py-2 text-xs font-semibold shadow-md border border-line hover:bg-ink/5"
    >
      📍 Minha localizacao
    </button>
  );
}

type MapEvent = EventListItem & { latitude: number; longitude: number };

export default function MapView({
  events,
  center,
}: {
  events: MapEvent[];
  center: [number, number];
}) {
  return (
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={13} className="h-full w-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {events.map((e: any) => (
          <Marker key={e.id} position={[e.latitude, e.longitude]} icon={pinIcon()}>
            <Popup>
              <div className="w-56 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-sm font-semibold">{e.title}</p>
                    <p className="text-xs text-muted">{e.category}</p>
                  </div>
                  <InterestGauge pct={e.interestPct} size={36} />
                </div>
                <p className="mt-1 text-xs text-muted">{e.address}</p>
                <Link
                  href={`/event/${e.id}`}
                  className="mt-2 inline-block rounded-full bg-pin px-3 py-1 text-xs font-semibold text-white"
                >
                  Ver detalhes
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
        <RecenterButton center={center} />
      </MapContainer>
    </div>
  );
}
