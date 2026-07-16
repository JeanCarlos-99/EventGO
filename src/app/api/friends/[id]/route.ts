import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// PATCH /api/friends/:id - aceitar, recusar ou bloquear uma solicitacao { action }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });

  const { action } = await req.json(); // "accept" | "decline" | "block"
  const friendship = await db.friendship.findUnique({ where: { id: params.id } });
  if (!friendship || friendship.addresseeId !== session.userId) {
    return NextResponse.json({ error: "Solicitacao nao encontrada." }, { status: 404 });
  }

  if (action === "decline") {
    await db.friendship.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  }

  const status = action === "block" ? "BLOCKED" : "ACCEPTED";
  const updated = await db.friendship.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json({ friendship: updated });
}

// DELETE /api/friends/:id - remove uma amizade existente
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });

  await db.friendship.deleteMany({
    where: {
      id: params.id,
      OR: [{ requesterId: session.userId }, { addresseeId: session.userId }],
    },
  });
  return NextResponse.json({ ok: true });
}
