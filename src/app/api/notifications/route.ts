import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/notifications - contagens usadas pelo sininho no topo (polling leve)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ pendingFriendRequests: 0, unreadMessages: 0 });

  const [pendingFriendRequests, unreadMessages] = await Promise.all([
    db.friendship.count({ where: { addresseeId: session.userId, status: "PENDING" } }),
    db.message.count({ where: { receiverId: session.userId, read: false } }),
  ]);

  return NextResponse.json({ pendingFriendRequests, unreadMessages });
}
