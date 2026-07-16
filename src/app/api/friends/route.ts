import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { awardPoints, POINTS } from "@/lib/points";

// GET /api/friends - lista amigos aceitos + solicitacoes pendentes recebidas
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });

  const [accepted, pendingReceived, pendingSent] = await Promise.all([
    db.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: session.userId }, { addresseeId: session.userId }],
      },
      include: {
        requester: { select: { id: true, name: true, username: true, avatarUrl: true, city: true } },
        addressee: { select: { id: true, name: true, username: true, avatarUrl: true, city: true } },
      },
    }),
    db.friendship.findMany({
      where: { addresseeId: session.userId, status: "PENDING" },
      include: { requester: { select: { id: true, name: true, username: true, avatarUrl: true } } },
    }),
    db.friendship.findMany({
      where: { requesterId: session.userId, status: "PENDING" },
      include: { addressee: { select: { id: true, name: true, username: true, avatarUrl: true } } },
    }),
  ]);

  const friends = accepted.map((f) =>
    f.requesterId === session.userId ? f.addressee : f.requester
  );

  return NextResponse.json({ friends, pendingReceived, pendingSent });
}

// POST /api/friends - envia solicitacao de amizade { identifier } (username, telefone ou e-mail)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });

  const { identifier } = await req.json();
  const value = String(identifier || "").trim();
  if (!value) return NextResponse.json({ error: "Informe um usuario, telefone ou e-mail." }, { status: 400 });

  const target = await db.user.findFirst({
    where: {
      OR: [
        { username: value.replace(/^@/, "") },
        { phone: value },
        { email: value },
      ],
    },
  });
  if (!target) return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
  if (target.id === session.userId) {
    return NextResponse.json({ error: "Voce nao pode adicionar a si mesmo." }, { status: 400 });
  }

  const already = await db.friendship.findFirst({
    where: {
      OR: [
        { requesterId: session.userId, addresseeId: target.id },
        { requesterId: target.id, addresseeId: session.userId },
      ],
    },
  });
  if (already) {
    return NextResponse.json({ error: "Ja existe uma solicitacao ou amizade com esse usuario." }, { status: 409 });
  }

  const friendship = await db.friendship.create({
    data: { requesterId: session.userId, addresseeId: target.id, status: "PENDING" },
  });

  await awardPoints(session.userId, POINTS.INVITE_FRIEND, "Convidou um amigo");

  return NextResponse.json({ friendship });
}
