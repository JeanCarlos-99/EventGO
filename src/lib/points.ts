import { db } from "./db";

// Regras de pontuacao do programa de gamificacao do EventGo.
export const POINTS = {
  JOIN_EVENT: 10,
  CREATE_EVENT: 25,
  REVIEW_EVENT: 8,
  SHARE_EVENT: 3,
  INVITE_FRIEND: 5,
  CHECK_IN: 15,
  POSITIVE_REVIEW_RECEIVED: 5,
} as const;

// Pontos necessarios para cada nivel (indice = nivel - 1).
const LEVEL_THRESHOLDS = [0, 50, 150, 350, 700, 1200, 2000, 3200, 5000];

export function levelForPoints(points: number) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

export async function awardPoints(userId: string, amount: number, reason: string) {
  const user = await db.user.update({
    where: { id: userId },
    data: { points: { increment: amount } },
  });
  const newLevel = levelForPoints(user.points);
  if (newLevel !== user.level) {
    await db.user.update({ where: { id: userId }, data: { level: newLevel } });
  }
  await db.pointsTransaction.create({ data: { userId, amount, reason } });
  return user.points;
}

// Calcula a "% de interesse da comunidade" de um evento a partir de quem
// visualizou, favoritou e confirmou presenca.
export function computeInterest(counts: { viewed: number; favorited: number; going: number }) {
  const score = counts.viewed * 1 + counts.favorited * 3 + counts.going * 5;
  const pct = Math.min(100, Math.round((score / 8) * 4)); // curva suave, tende a 100 com engajamento real
  return Math.max(pct, counts.going > 0 ? 15 : 0);
}

export function interestColor(pct: number) {
  if (pct >= 90) return "bg-emerald-500";
  if (pct >= 70) return "bg-sky-500";
  if (pct >= 50) return "bg-amber-400";
  return "bg-rose-500";
}
