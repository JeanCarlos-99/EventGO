import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { awardPoints, POINTS } from "@/lib/points";

// POST /api/events/:id/join - confirma presenca (toggle) e concede pontos na primeira confirmacao
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Faca login para participar." }, { status: 401 });

  const existing = await db.eventInterest.findUnique({
    where: { userId_eventId: { userId: session.userId, eventId: params.id } },
  });

  const nowGoing = !existing?.going;

  const updated = await db.eventInterest.upsert({
    where: { userId_eventId: { userId: session.userId, eventId: params.id } },
    update: { going: nowGoing },
    create: { userId: session.userId, eventId: params.id, going: true, viewed: true },
  });

  if (nowGoing && !existing?.going) {
    await awardPoints(session.userId, POINTS.JOIN_EVENT, "Confirmou presenca em um evento");
  }

  return NextResponse.json({ going: updated.going });
}
