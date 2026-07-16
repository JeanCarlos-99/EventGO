import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { awardPoints, computeInterest, POINTS } from "@/lib/points";

// GET /api/events - lista eventos (com % de interesse calculado) para o mapa e a lista lateral
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  const events = await db.event.findMany({
    where: {
      ...(category ? { category: { name: category } } : {}),
      ...(q
        ? { OR: [{ title: { contains: q } }, { address: { contains: q } }] }
        : {}),
    },
    include: {
      category: true,
      organizer: { select: { id: true, name: true, avatarUrl: true } },
      interests: true,
      _count: { select: { reviews: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  const result = events.map((e) => {
    const viewed = e.interests.filter((i) => i.viewed).length;
    const favorited = e.interests.filter((i) => i.favorited).length;
    const going = e.interests.filter((i) => i.going).length;
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category.name,
      organizer: e.organizer,
      latitude: e.latitude,
      longitude: e.longitude,
      address: e.address,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      capacity: e.capacity,
      isFree: e.isFree,
      price: e.price,
      coverImage: e.coverImage,
      petFriendly: e.petFriendly,
      accessible: e.accessible,
      goingCount: going,
      favoritedCount: favorited,
      interestPct: computeInterest({ viewed, favorited, going }),
    };
  });

  return NextResponse.json({ events: result });
}

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  capacity: z.number().optional(),
  isFree: z.boolean().default(true),
  price: z.number().optional(),
  externalLink: z.string().optional(),
  petFriendly: z.boolean().optional(),
  accessible: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  coveredArea: z.boolean().optional(),
  servesFood: z.boolean().optional(),
  servesDrinks: z.boolean().optional(),
  hashtags: z.string().optional(),
});

// POST /api/events - cria um evento novo (usuario logado ganha pontos de gamificacao)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Faca login para criar um evento." }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  let category = await db.category.findUnique({ where: { name: data.category } });
  if (!category) {
    category = await db.category.create({ data: { name: data.category, isCustom: true } });
  }

  const event = await db.event.create({
    data: {
      title: data.title,
      description: data.description,
      categoryId: category.id,
      organizerId: session.userId,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      capacity: data.capacity,
      isFree: data.isFree,
      price: data.price,
      externalLink: data.externalLink,
      petFriendly: !!data.petFriendly,
      accessible: !!data.accessible,
      hasParking: !!data.hasParking,
      coveredArea: !!data.coveredArea,
      servesFood: !!data.servesFood,
      servesDrinks: !!data.servesDrinks,
      hashtags: data.hashtags,
    },
  });

  await awardPoints(session.userId, POINTS.CREATE_EVENT, "Criou um evento");

  return NextResponse.json({ event });
}
