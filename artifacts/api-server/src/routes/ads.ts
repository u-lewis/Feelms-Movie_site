import { Router, type IRouter } from "express";
import { db, adsTable, adImpressionsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireAdmin, optionalAuth } from "../lib/auth";
import {
  GetAdsQueryParams,
  GetAdsResponse,
  CreateAdBody,
  UpdateAdParams,
  UpdateAdBody,
  UpdateAdResponse,
  DeleteAdParams,
  RecordAdImpressionBody,
  RecordAdImpressionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeAd(a: any) {
  return {
    id: a.id,
    type: a.type,
    mediaUrl: a.mediaUrl ?? null,
    imageUrl: a.imageUrl ?? null,
    title: a.title ?? null,
    duration: a.duration,
    active: a.active,
    target: a.target,
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
  };
}

router.get("/ads", optionalAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const params = GetAdsQueryParams.safeParse(req.query);
  const isAdmin = user?.role === "ADMIN";

  let query = db.select().from(adsTable).$dynamic();

  if (!isAdmin) {
    query = query.where(eq(adsTable.active, true));
  }

  const ads = await query.orderBy(asc(adsTable.createdAt));
  const filtered = params.success && params.data.type
    ? ads.filter(a => a.type === params.data.type)
    : ads;

  res.json(GetAdsResponse.parse(filtered.map(serializeAd)));
});

router.post("/ads", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ad] = await db.insert(adsTable).values({
    type: parsed.data.type,
    mediaUrl: parsed.data.mediaUrl ?? null,
    imageUrl: parsed.data.imageUrl ?? null,
    title: parsed.data.title ?? null,
    duration: parsed.data.duration ?? 10,
    active: parsed.data.active ?? true,
    target: (parsed.data.target as any) ?? "FREE_ONLY",
  }).returning();

  res.status(201).json(serializeAd(ad));
});

router.patch("/ads/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateAdBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ad] = await db.update(adsTable)
    .set(parsed.data)
    .where(eq(adsTable.id, id))
    .returning();

  if (!ad) {
    res.status(404).json({ error: "Ad not found" });
    return;
  }

  res.json(UpdateAdResponse.parse(serializeAd(ad)));
});

router.delete("/ads/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [ad] = await db.delete(adsTable).where(eq(adsTable.id, id)).returning();
  if (!ad) {
    res.status(404).json({ error: "Ad not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/ads/impression", optionalAuth, async (req, res): Promise<void> => {
  const parsed = RecordAdImpressionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const user = (req as any).user;

  const [impression] = await db.insert(adImpressionsTable).values({
    adId: parsed.data.adId,
    userId: user?.id ?? null,
    context: parsed.data.context,
  }).returning();

  res.json(RecordAdImpressionResponse.parse({
    id: impression.id,
    adId: impression.adId,
    userId: impression.userId ?? null,
    context: impression.context,
    timestamp: impression.timestamp.toISOString(),
  }));
});

export default router;
