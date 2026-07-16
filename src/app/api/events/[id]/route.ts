import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeInterest } from "@/lib/points";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();

  const event = await db.event.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      organizer: { select: { id: true, name: true, avatarUrl: true, bio: true } },
      interests: true,
      reviews: { include: { user: { select: { name: true, avatarUrl: true } } } },
    },
  });
  if (!event) return NextResponse.json({ error: "Evento nao encontrado." }, { status: 404 });

  // registra visualizacao (usada no calculo de interesse) sem duplicar por usuario
  if (session) {
    await db.eventInterest.upsert({
      where: { userId_eventId: { userId: session.userId, eventId: event.id } },
      update: { viewed: true },
      create: { userId: session.userId, eventId: event.id, viewed: true },
    });
  }

  const viewed = event.interests.filter((i) => i.viewed).length;
  const favorited = event.interests.filter((i) => i.favorited).length;
  const going = event.interests.filter((i) => i.going).length;

  const myInterest = session
    ? event.interests.find((i) => i.userId === session.userId)
    : null;

  return NextResponse.json({
    event: {
      ...event,
      interestPct: computeInterest({ viewed, favorited, going }),
      goingCount: going,
      favoritedCount: favorited,
      myStatus: myInterest
        ? { favorited: myInterest.favorited, going: myInterest.going, checkedIn: myInterest.checkedIn }
        : null,
    },
  });
}
