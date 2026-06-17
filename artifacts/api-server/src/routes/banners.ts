import { Router, type IRouter } from "express";
import { db, bannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  GetBannersQueryParams,
  GetBannersResponse,
  CreateBannerBody,
  UpdateBannerParams,
  UpdateBannerBody,
  UpdateBannerResponse,
  DeleteBannerParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeBanner(b: any) {
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle ?? null,
    image: b.image ?? null,
    videoUrl: b.videoUrl ?? null,
    ctaText: b.ctaText ?? null,
    ctaLink: b.ctaLink ?? null,
    movieId: b.movieId ?? null,
    active: b.active,
    orderIndex: b.orderIndex,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
  };
}

router.get("/banners", async (req, res): Promise<void> => {
  const params = GetBannersQueryParams.safeParse(req.query);
  const showAll = params.success && params.data.all;

  let query = db.select().from(bannersTable).$dynamic();
  if (!showAll) {
    query = query.where(eq(bannersTable.active, true));
  }
  const banners = await query.orderBy(asc(bannersTable.orderIndex));
  res.json(GetBannersResponse.parse(banners.map(serializeBanner)));
});

router.post("/banners", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBannerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [banner] = await db.insert(bannersTable).values({
    ...parsed.data,
    active: parsed.data.active ?? true,
    orderIndex: parsed.data.orderIndex ?? 0,
  }).returning();

  res.status(201).json(serializeBanner(banner));
});

router.patch("/banners/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateBannerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [banner] = await db.update(bannersTable)
    .set(parsed.data)
    .where(eq(bannersTable.id, id))
    .returning();

  if (!banner) {
    res.status(404).json({ error: "Banner not found" });
    return;
  }

  res.json(UpdateBannerResponse.parse(serializeBanner(banner)));
});

router.delete("/banners/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [banner] = await db.delete(bannersTable).where(eq(bannersTable.id, id)).returning();
  if (!banner) {
    res.status(404).json({ error: "Banner not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
