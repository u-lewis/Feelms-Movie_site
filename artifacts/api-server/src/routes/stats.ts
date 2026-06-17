import { Router, type IRouter } from "express";
import { db, usersTable, moviesTable, watchHistoryTable, paymentsTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  GetDashboardStatsResponse,
  GetWatchHistoryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeMovie(m: any) {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    poster: m.poster,
    trailer: m.trailer ?? null,
    streamingLinks: m.streamingLinks ?? [],
    downloadLinks: m.downloadLinks ?? [],
    vipOnly: m.vipOnly,
    featured: m.featured,
    genres: m.genres ?? [],
    year: m.year ?? null,
    rating: m.rating ?? null,
    duration: m.duration ?? null,
    watchCount: m.watchCount ?? 0,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  };
}

router.get("/stats/dashboard", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const [userStats] = await db.select({
    total: count(),
    vipCount: sql<number>`count(*) filter (where role = 'VIP')`,
    freeCount: sql<number>`count(*) filter (where role = 'FREE')`,
  }).from(usersTable);

  const [movieStats] = await db.select({
    total: count(),
    vipCount: sql<number>`count(*) filter (where vip_only = true)`,
  }).from(moviesTable);

  const [watchStats] = await db.select({ total: count() }).from(watchHistoryTable);

  const recentPayments = await db.select().from(paymentsTable)
    .orderBy(desc(paymentsTable.createdAt))
    .limit(5);

  const topMovies = await db.select().from(moviesTable)
    .orderBy(desc(moviesTable.watchCount))
    .limit(5);

  res.json(GetDashboardStatsResponse.parse({
    totalUsers: Number(userStats.total),
    vipUsers: Number(userStats.vipCount),
    freeUsers: Number(userStats.freeCount),
    totalMovies: Number(movieStats.total),
    vipMovies: Number(movieStats.vipCount),
    totalWatches: Number(watchStats.total),
    recentPayments: recentPayments.map(p => ({
      id: p.id,
      userId: p.userId,
      amount: p.amount,
      status: p.status,
      provider: p.provider,
      plan: p.plan ?? null,
      transactionId: p.transactionId ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
    topMovies: topMovies.map(serializeMovie),
  }));
});

router.get("/stats/watch-history", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;

  const history = await db.select({
    id: watchHistoryTable.id,
    movieId: watchHistoryTable.movieId,
    userId: watchHistoryTable.userId,
    watchedAt: watchHistoryTable.watchedAt,
    movie: moviesTable,
  })
    .from(watchHistoryTable)
    .leftJoin(moviesTable, eq(watchHistoryTable.movieId, moviesTable.id))
    .where(eq(watchHistoryTable.userId, user.id))
    .orderBy(desc(watchHistoryTable.watchedAt))
    .limit(50);

  res.json(GetWatchHistoryResponse.parse(history.map(h => ({
    id: h.id,
    movieId: h.movieId,
    userId: h.userId,
    watchedAt: h.watchedAt instanceof Date ? h.watchedAt.toISOString() : h.watchedAt,
    movie: h.movie ? serializeMovie(h.movie) : undefined,
  }))));
});

export default router;
