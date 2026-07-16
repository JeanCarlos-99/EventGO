import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORIES } from "../src/lib/categories";

const db = new PrismaClient();

async function main() {
  console.log("Criando categorias...");
  for (const name of DEFAULT_CATEGORIES) {
    await db.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("Criando usuario demo...");
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const demo = await db.user.upsert({
    where: { email: "demo@eventgo.app" },
    update: {},
    create: {
      name: "Usuario Demo",
      username: "demo",
      email: "demo@eventgo.app",
      passwordHash,
      city: "Sao Paulo",
      state: "SP",
      country: "Brasil",
      interests: "Musica,Tecnologia,Gastronomia",
      points: 40,
      level: 1,
    },
  });

  console.log("Criando segundo usuario (para testar amizade e chat)...");
  await db.user.upsert({
    where: { email: "amigo@eventgo.app" },
    update: {},
    create: {
      name: "Amigo Demo",
      username: "amigodemo",
      email: "amigo@eventgo.app",
      passwordHash: await bcrypt.hash("demo1234", 10),
      city: "Sao Paulo",
      state: "SP",
      country: "Brasil",
      points: 10,
      level: 1,
    },
  });

  const musica = await db.category.findUnique({ where: { name: "Musica" } });
  const tech = await db.category.findUnique({ where: { name: "Tecnologia" } });
  const gastro = await db.category.findUnique({ where: { name: "Gastronomia" } });

  console.log("Criando eventos de exemplo...");
  const events = [
    {
      title: "Festival Geek SP",
      description: "Um dia inteiro de cultura pop, games, quadrinhos e musica ao vivo.",
      categoryId: tech!.id,
      latitude: -23.5615,
      longitude: -46.6558,
      address: "Av. Paulista, 1000 - Sao Paulo, SP",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      isFree: false,
      price: 60,
      capacity: 500,
    },
    {
      title: "Corrida Noturna do Ibirapuera",
      description: "Corrida de 5km e 10km pelo parque, com kit atleta e premiacao.",
      categoryId: musica!.id,
      latitude: -23.5874,
      longitude: -46.6576,
      address: "Parque Ibirapuera - Sao Paulo, SP",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      isFree: true,
      capacity: 300,
    },
    {
      title: "Feira Gastronomica da Vila Madalena",
      description: "Food trucks, cervejas artesanais e musica ao vivo todo fim de semana.",
      categoryId: gastro!.id,
      latitude: -23.5558,
      longitude: -46.6896,
      address: "Vila Madalena - Sao Paulo, SP",
      startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      isFree: true,
      petFriendly: true,
      servesFood: true,
      servesDrinks: true,
    },
  ];

  for (const e of events) {
    await db.event.create({ data: { ...e, organizerId: demo.id } });
  }

  console.log("Seed concluido. Login demo: demo@eventgo.app / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
