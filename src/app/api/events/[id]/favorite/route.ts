import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// POST /api/events/:id/favorite - favoritar/desfavoritar (toggle)
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Faca login para favoritar." }, { status: 401 });

  const existing = await db.eventInterest.findUnique({
    where: { userId_eventId: { userId: session.userId, eventId: params.id } },
  });
  const nowFavorited = !existing?.favorited;

  const updated = await db.eventInterest.upsert({
    where: { userId_eventId: { userId: session.userId, eventId: params.id } },
    update: { favorited: nowFavorited },
    create: { userId: session.userId, eventId: params.id, favorited: true, viewed: true },
  });

  return NextResponse.json({ favorited: updated.favorited });
}
