import { Router, type IRouter } from "express";
import { db, sectionsTable, moviesTable } from "@workspace/db";
import { eq, asc, inArray } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  GetSectionsQueryParams,
  GetSectionsResponse,
  CreateSectionBody,
  UpdateSectionParams,
  UpdateSectionBody,
  UpdateSectionResponse,
  DeleteSectionParams,
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

router.get("/sections", async (req, res): Promise<void> => {
  const params = GetSectionsQueryParams.safeParse(req.query);
  const showAll = params.success && params.data.all;

  let query = db.select().from(sectionsTable).$dynamic();
  if (!showAll) {
    query = query.where(eq(sectionsTable.enabled, true));
  }
  const sections = await query.orderBy(asc(sectionsTable.orderIndex));

  const result = await Promise.all(sections.map(async (section) => {
    let movies: any[] = [];
    if (section.movieIds && section.movieIds.length > 0) {
      movies = await db.select().from(moviesTable).where(inArray(moviesTable.id, section.movieIds));
    }
    return {
      id: section.id,
      title: section.title,
      movieIds: section.movieIds ?? [],
      orderIndex: section.orderIndex,
      enabled: section.enabled,
      sectionType: section.sectionType ?? null,
      createdAt: section.createdAt instanceof Date ? section.createdAt.toISOString() : section.createdAt,
      movies: movies.map(serializeMovie),
    };
  }));

  res.json(GetSectionsResponse.parse(result));
});

router.post("/sections", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [section] = await db.insert(sectionsTable).values({
    title: parsed.data.title,
    movieIds: parsed.data.movieIds ?? [],
    orderIndex: parsed.data.orderIndex ?? 0,
    enabled: parsed.data.enabled ?? true,
    sectionType: parsed.data.sectionType ?? null,
  }).returning();

  res.status(201).json({
    id: section.id,
    title: section.title,
    movieIds: section.movieIds ?? [],
    orderIndex: section.orderIndex,
    enabled: section.enabled,
    sectionType: section.sectionType ?? null,
    createdAt: section.createdAt.toISOString(),
    movies: [],
  });
});

router.patch("/sections/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateSectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [section] = await db.update(sectionsTable)
    .set(parsed.data)
    .where(eq(sectionsTable.id, id))
    .returning();

  if (!section) {
    res.status(404).json({ error: "Section not found" });
    return;
  }

  let movies: any[] = [];
  if (section.movieIds && section.movieIds.length > 0) {
    movies = await db.select().from(moviesTable).where(inArray(moviesTable.id, section.movieIds));
  }

  res.json(UpdateSectionResponse.parse({
    id: section.id,
    title: section.title,
    movieIds: section.movieIds ?? [],
    orderIndex: section.orderIndex,
    enabled: section.enabled,
    sectionType: section.sectionType ?? null,
    createdAt: section.createdAt.toISOString(),
    movies: movies.map(serializeMovie),
  }));
});

router.delete("/sections/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [section] = await db.delete(sectionsTable).where(eq(sectionsTable.id, id)).returning();
  if (!section) {
    res.status(404).json({ error: "Section not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
