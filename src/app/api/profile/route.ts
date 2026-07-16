import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).max(24).regex(/^[a-z0-9_.]+$/i, "Use apenas letras, numeros, ponto ou underline").optional(),
  bio: z.string().max(280).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  isPublic: z.boolean().optional(),
  // imagem enviada como data URL base64 (ex: "data:image/png;base64,...");
  // guardada direto no banco para nao precisar de um servico de storage externo.
  avatarUrl: z.string().startsWith("data:image").optional(),
});

// PATCH /api/profile - atualiza os dados do usuario logado (usado pela tela de perfil)
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.username) {
    const existing = await db.user.findUnique({ where: { username: parsed.data.username } });
    if (existing && existing.id !== session.userId) {
      return NextResponse.json({ error: "Esse nome de usuario ja esta em uso." }, { status: 409 });
    }
  }

  const user = await db.user.update({
    where: { id: session.userId },
    data: parsed.data,
  });

  return NextResponse.json({
    user: {
      id: user.id, name: user.name, username: user.username, email: user.email,
      avatarUrl: user.avatarUrl, bio: user.bio, city: user.city, state: user.state,
      isPublic: user.isPublic, points: user.points, level: user.level, interests: user.interests,
    },
  });
}
