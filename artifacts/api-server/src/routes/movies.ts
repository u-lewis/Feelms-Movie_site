import { shortenUrl } from "../lib/shrinkme";
import { Router, type IRouter } from "express";
import { db, moviesTable, watchHistoryTable } from "@workspace/db";
import { eq, ilike, desc, sql, inArray } from "drizzle-orm";
import { requireAuth, requireAdmin, optionalAuth } from "../lib/auth";
import {
  GetMoviesQueryParams,
  GetMoviesResponse,
  CreateMovieBody,
  GetMovieParams,
  GetMovieResponse,
  UpdateMovieParams,
  UpdateMovieBody,
  UpdateMovieResponse,
  DeleteMovieParams,
  RecordWatchParams,
  RecordWatchResponse,
  GetTrendingMoviesResponse,
  GetNewReleasesResponse,
  GetVipExclusivesResponse,
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
    vipDownloadLinks: m.vipDownloadLinks ?? null,
    vipOnly: m.vipOnly,
    featured: m.featured,
    genres: m.genres ?? [],
    year: m.year ?? null,
    rating: m.rating ?? null,
    duration: m.duration ?? null,
    streamUrl: m.streamUrl ?? null,
    watchCount: m.watchCount ?? 0,
    contentType: m.contentType ?? "MOVIE",
    subtitles: m.subtitles ?? [],
    interpreted: m.interpreted ?? false,
    interpreters: m.interpreters ?? [],
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  };
}

router.get("/movies", optionalAuth, async (req, res): Promise<void> => {
  const params = GetMoviesQueryParams.safeParse(req.query);

  let query = db.select().from(moviesTable).$dynamic();

  if (params.success) {
    const { genre, vipOnly, featured, search } = params.data;
    const interpreted = (req.query as any).interpreted;

    if (search) {
      query = query.where(ilike(moviesTable.title, `%${search}%`));
    }
    if (vipOnly !== undefined) {
      query = query.where(eq(moviesTable.vipOnly, vipOnly));
    }
    if (featured !== undefined) {
      query = query.where(eq(moviesTable.featured, featured));
    }
    if (interpreted === "true") {
      query = query.where(eq(moviesTable.interpreted, true));
    }
  }

  const movies = await query.orderBy(desc(moviesTable.createdAt)).limit(
    params.success && params.data.limit ? Number(params.data.limit) : 100
  );

  const filtered = params.success && params.data.genre
    ? movies.filter(m => m.genres.includes(params.data.genre!))
    : movies;

  res.json(filtered.map(serializeMovie));
});

router.get("/movies/trending", async (_req, res): Promise<void> => {
  const movies = await db.select().from(moviesTable)
    .orderBy(desc(moviesTable.watchCount))
    .limit(12);
  res.json(movies.map(serializeMovie));
});

router.get("/movies/new-releases", async (_req, res): Promise<void> => {
  const movies = await db.select().from(moviesTable)
    .orderBy(desc(moviesTable.createdAt))
    .limit(12);
  res.json(movies.map(serializeMovie));
});

router.get("/movies/vip-exclusives", async (_req, res): Promise<void> => {
  const movies = await db.select().from(moviesTable)
    .where(eq(moviesTable.vipOnly, true))
    .orderBy(desc(moviesTable.createdAt))
    .limit(12);
  res.json(movies.map(serializeMovie));
});

router.get("/movies/:id", optionalAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [movie] = await db.select().from(moviesTable).where(eq(moviesTable.id, id));
  if (!movie) {
    res.status(404).json({ error: "Movie not found" });
    return;
  }

  res.json(serializeMovie(movie));
});

router.post("/movies", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateMovieBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const vipDownloadLinks = typeof req.body.vipDownloadLinks === "string" ? req.body.vipDownloadLinks : null;

  const subtitlesCreate = Array.isArray(req.body.subtitles) ? req.body.subtitles : [];
  const streamUrlCreate = typeof req.body.streamUrl === "string" ? req.body.streamUrl || null : null;
  const [movie] = await db.insert(moviesTable).values({
    ...parsed.data,
    streamingLinks: parsed.data.streamingLinks ?? [],
    downloadLinks: await Promise.all((parsed.data.downloadLinks ?? []).map(shortenUrl)),
    vipDownloadLinks,
    genres: parsed.data.genres ?? [],
    vipOnly: parsed.data.vipOnly ?? false,
    featured: parsed.data.featured ?? false,
    contentType: (req.body.contentType === "SERIES" ? "SERIES" : "MOVIE"),
    subtitles: subtitlesCreate,
    streamUrl: streamUrlCreate,
    interpreted: req.body.interpreted === true,
    interpreters: Array.isArray(req.body.interpreters) ? req.body.interpreters : [],
  }).returning();

  res.status(201).json(serializeMovie(movie));
});

router.patch("/movies/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateMovieBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const vipDownloadLinks = typeof req.body.vipDownloadLinks === "string" ? req.body.vipDownloadLinks : null;

  const updateData: any = { ...parsed.data };
  if (Array.isArray(updateData.downloadLinks)) {
    updateData.downloadLinks = await Promise.all(updateData.downloadLinks.map(shortenUrl));
  }
  if (vipDownloadLinks !== null) {
    updateData.vipDownloadLinks = vipDownloadLinks;
  }
  if (req.body.contentType === "SERIES" || req.body.contentType === "MOVIE") {
    updateData.contentType = req.body.contentType;
  }
  if (Array.isArray(req.body.subtitles)) {
    updateData.subtitles = req.body.subtitles;
  }
  if (req.body.streamUrl !== undefined) {
    updateData.streamUrl = req.body.streamUrl || null;
  }
  if (req.body.interpreted !== undefined) {
    updateData.interpreted = req.body.interpreted === true;
  }
  if (Array.isArray(req.body.interpreters)) {
    updateData.interpreters = req.body.interpreters;
  }

  const [movie] = await db.update(moviesTable)
    .set(updateData)
    .where(eq(moviesTable.id, id))
    .returning();

  if (!movie) {
    res.status(404).json({ error: "Movie not found" });
    return;
  }

  res.json(serializeMovie(movie));
});

router.delete("/movies/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [movie] = await db.delete(moviesTable).where(eq(moviesTable.id, id)).returning();
  if (!movie) {
    res.status(404).json({ error: "Movie not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/movies/:id/watch", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const user = (req as any).user;
  const [movie] = await db.select().from(moviesTable).where(eq(moviesTable.id, id));
  if (!movie) { res.status(404).json({ error: "Movie not found" }); return; }

  await db.update(moviesTable)
    .set({ watchCount: sql`${moviesTable.watchCount} + 1` })
    .where(eq(moviesTable.id, id));

  const episodeId = req.body?.episodeId ? parseInt(req.body.episodeId, 10) : null;

  const [entry] = await db.insert(watchHistoryTable).values({
    movieId: id,
    userId: user.id,
    episodeId: episodeId && !isNaN(episodeId) ? episodeId : null,
  }).returning();

  res.json(RecordWatchResponse.parse({
    id: entry.id,
    movieId: entry.movieId,
    userId: entry.userId,
    watchedAt: entry.watchedAt.toISOString(),
  }));
});

router.get("/watch-history", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;

  const rows = await db.select().from(watchHistoryTable)
    .where(eq(watchHistoryTable.userId, user.id))
    .orderBy(desc(watchHistoryTable.watchedAt))
    .limit(100);

  if (rows.length === 0) { res.json([]); return; }

  const movieIds = [...new Set(rows.map(r => r.movieId))];
  const movies = await db.select().from(moviesTable).where(inArray(moviesTable.id, movieIds));
  const movieMap = new Map(movies.map(m => [m.id, m]));

  // Deduplicate: keep only the latest entry per movieId for "continue watching"
  const seen = new Set<number>();
  const deduped = rows.filter(r => {
    if (seen.has(r.movieId)) return false;
    seen.add(r.movieId);
    return true;
  });

  const result = deduped.map(row => {
    const movie = movieMap.get(row.movieId);
    if (!movie) return null;
    return {
      id: row.id,
      movieId: row.movieId,
      episodeId: row.episodeId ?? null,
      watchedAt: row.watchedAt instanceof Date ? row.watchedAt.toISOString() : row.watchedAt,
      movie: serializeMovie(movie),
    };
  }).filter(Boolean);

  res.json(result);
});

export default router;
