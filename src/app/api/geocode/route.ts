import { NextRequest, NextResponse } from "next/server";

// GET /api/geocode?q=... - busca endereco/cidade e devolve latitude/longitude.
// Usa a API publica de busca do OpenStreetMap (Nominatim), gratuita e sem
// necessidade de chave, a mesma familia de servico usada pelo mapa do app.
// Rodamos no servidor (nao direto no navegador) porque a Nominatim exige um
// cabecalho User-Agent identificando a aplicacao.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 3) return NextResponse.json({ results: [] });

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=0&limit=5&q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "EventGo-App/1.0 (prototipo local)",
        "Accept-Language": "pt-BR",
      },
      // evita cache indevido de buscas diferentes
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ results: [] });

    const data = await res.json();
    const results = (data as any[]).map((item) => ({
      label: item.display_name as string,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
