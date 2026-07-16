import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signSession, sessionCookieOptions } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).max(24).regex(/^[a-z0-9_.]+$/i).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

async function uniqueUsername(base: string) {
  const clean = base.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 18) || "user";
  let candidate = clean;
  let attempt = 0;
  while (await db.user.findUnique({ where: { username: candidate } })) {
    attempt += 1;
    candidate = `${clean}${Math.floor(Math.random() * 9000 + attempt)}`;
  }
  return candidate;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, password, phone, city, state, country, interests } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ja existe uma conta com esse e-mail." }, { status: 409 });
  }

  const username = parsed.data.username
    ? (await db.user.findUnique({ where: { username: parsed.data.username } })) ? await uniqueUsername(parsed.data.username) : parsed.data.username
    : await uniqueUsername(email.split("@")[0]);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      name,
      username,
      email,
      passwordHash,
      phone,
      city,
      state,
      country,
      interests: interests?.join(","),
    },
  });

  const token = await signSession({ userId: user.id, email: user.email });
  const res = NextResponse.json({ id: user.id, name: user.name, email: user.email });
  res.cookies.set(sessionCookieOptions().name, token, sessionCookieOptions());
  return res;
}
