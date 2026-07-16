import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 200 });

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, name: true, username: true, email: true, avatarUrl: true, city: true, state: true,
      points: true, level: true, interests: true, bio: true, isPublic: true,
    },
  });
  return NextResponse.json({ user });
}
