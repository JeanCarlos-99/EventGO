import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/messages/:friendId - historico da conversa (marca como lidas as
// mensagens que o amigo te enviou). O front-end faz polling nesse endpoint
// a cada poucos segundos para simular tempo real, sem precisar de servidor
// de WebSocket separado.
export async function GET(_req: NextRequest, { params }: { params: { friendId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });

  const friendship = await db.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: session.userId, addresseeId: params.friendId },
        { requesterId: params.friendId, addresseeId: session.userId },
      ],
    },
  });
  if (!friendship) {
    return NextResponse.json({ error: "Voces precisam ser amigos para conversar." }, { status: 403 });
  }

  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: session.userId, receiverId: params.friendId },
        { senderId: params.friendId, receiverId: session.userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  await db.message.updateMany({
    where: { senderId: params.friendId, receiverId: session.userId, read: false },
    data: { read: true },
  });

  const friend = await db.user.findUnique({
    where: { id: params.friendId },
    select: { id: true, name: true, username: true, avatarUrl: true },
  });

  return NextResponse.json({ messages, friend });
}

// POST /api/messages/:friendId { content } - envia uma mensagem
export async function POST(req: NextRequest, { params }: { params: { friendId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });

  const { content } = await req.json();
  const text = String(content || "").trim();
  if (!text) return NextResponse.json({ error: "Mensagem vazia." }, { status: 400 });

  const friendship = await db.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: session.userId, addresseeId: params.friendId },
        { requesterId: params.friendId, addresseeId: session.userId },
      ],
    },
  });
  if (!friendship) {
    return NextResponse.json({ error: "Voces precisam ser amigos para conversar." }, { status: 403 });
  }

  const message = await db.message.create({
    data: { senderId: session.userId, receiverId: params.friendId, content: text.slice(0, 2000) },
  });

  return NextResponse.json({ message });
}
