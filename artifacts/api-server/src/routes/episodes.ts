import { Router, type IRouter } from "express";
import { db, episodesTable, moviesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

function serializeEpisode(e: any) {
  return {
    id: e.id,
    movieId: e.movieId,
    season: e.season,
    episodeNumber: e.episodeNumber,
    title: e.title,
    description: e.description ?? null,
    streamUrl: e.streamUrl ?? null,
    downloadUrl: e.downloadUrl ?? null,
    thumbnail: e.thumbnail ?? null,
    duration: e.duration ?? null,
    vipOnly: e.vipOnly,
    subtitles: e.subtitles ?? [],
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
  };
}

router.get("/movies/:id/episodes", async (req, res): Promise<void> => {
  const movieId = parseInt(req.params.id, 10);
  if (isNaN(movieId)) { res.status(400).json({ error: "Invalid movie id" }); return; }

  const episodes = await db.select().from(episodesTable)
    .where(eq(episodesTable.movieId, movieId))
    .orderBy(asc(episodesTable.season), asc(episodesTable.episodeNumber));

  res.json(episodes.map(serializeEpisode));
});

router.post("/movies/:id/episodes", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const movieId = parseInt(req.params.id, 10);
  if (isNaN(movieId)) { res.status(400).json({ error: "Invalid movie id" }); return; }

  const { season, episodeNumber, title, description, streamUrl, downloadUrl, thumbnail, duration, vipOnly, subtitles } = req.body;
  if (!title || !episodeNumber) { res.status(400).json({ error: "title and episodeNumber are required" }); return; }

  const [episode] = await db.insert(episodesTable).values({
    movieId,
    season: season ?? 1,
    episodeNumber,
    title,
    description: description ?? null,
    streamUrl: streamUrl ?? null,
    downloadUrl: downloadUrl ?? null,
    thumbnail: thumbnail ?? null,
    duration: duration ?? null,
    vipOnly: vipOnly ?? false,
    subtitles: Array.isArray(subtitles) ? subtitles : [],
  }).returning();

  res.status(201).json(serializeEpisode(episode));
});

router.patch("/movies/:id/episodes/:epId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const epId = parseInt(req.params.epId, 10);
  if (isNaN(epId)) { res.status(400).json({ error: "Invalid episode id" }); return; }

  const { season, episodeNumber, title, description, streamUrl, downloadUrl, thumbnail, duration, vipOnly, subtitles } = req.body;

  const [updated] = await db.update(episodesTable).set({
    ...(season !== undefined && { season }),
    ...(episodeNumber !== undefined && { episodeNumber }),
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(streamUrl !== undefined && { streamUrl }),
    ...(downloadUrl !== undefined && { downloadUrl }),
    ...(thumbnail !== undefined && { thumbnail }),
    ...(duration !== undefined && { duration }),
    ...(vipOnly !== undefined && { vipOnly }),
    ...(subtitles !== undefined && { subtitles: Array.isArray(subtitles) ? subtitles : [] }),
  }).where(eq(episodesTable.id, epId)).returning();

  if (!updated) { res.status(404).json({ error: "Episode not found" }); return; }
  res.json(serializeEpisode(updated));
});

router.delete("/movies/:id/episodes/:epId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const epId = parseInt(req.params.epId, 10);
  if (isNaN(epId)) { res.status(400).json({ error: "Invalid episode id" }); return; }

  await db.delete(episodesTable).where(eq(episodesTable.id, epId));
  res.status(204).send();
});

export default router;
