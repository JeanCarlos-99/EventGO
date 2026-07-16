import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/users/:username - perfil publico de outro usuario, respeitando isPublic
export async function GET(_req: Request, { params }: { params: { username: string } }) {
  const session = await getSession();

  const user = await db.user.findUnique({
    where: { username: params.username },
    select: {
      id: true, name: true, username: true, avatarUrl: true, bio: true, city: true, state: true,
      points: true, level: true, interests: true, isPublic: true,
      _count: { select: { eventsCreated: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });

  const isSelf = session?.userId === user.id;
  const friendship = session && !isSelf
    ? await db.friendship.findFirst({
        where: {
          OR: [
            { requesterId: session.userId, addresseeId: user.id },
            { requesterId: user.id, addresseeId: session.userId },
          ],
        },
      })
    : null;

  if (!user.isPublic && !isSelf && friendship?.status !== "ACCEPTED") {
    return NextResponse.json({
      user: { id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl },
      restricted: true,
      friendshipStatus: friendship?.status ?? null,
      isSelf,
    });
  }

  return NextResponse.json({
    user,
    restricted: false,
    friendshipStatus: friendship?.status ?? null,
    isSelf,
  });
}
