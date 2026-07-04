import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { friendlyTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/friendly", async (_req, res): Promise<void> => {
  const sites = await db.select().from(friendlyTable).orderBy(asc(friendlyTable.order));
  res.json(sites);
});

router.post("/friendly", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { name, image, url, order } = req.body;
  if (!name || !image || !url) { res.status(400).json({ error: "name, image and url are required" }); return; }
  const [site] = await db.insert(friendlyTable).values({
    name, image, url, order: order ?? 0,
  }).returning();
  res.status(201).json(site);
});

router.patch("/friendly/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { name, image, url, order } = req.body;
  const [site] = await db.update(friendlyTable).set({
    ...(name !== undefined && { name }),
    ...(image !== undefined && { image }),
    ...(url !== undefined && { url }),
    ...(order !== undefined && { order }),
  }).where(eq(friendlyTable.id, id)).returning();
  if (!site) { res.status(404).json({ error: "Not found" }); return; }
  res.json(site);
});

router.delete("/friendly/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(friendlyTable).where(eq(friendlyTable.id, id));
  res.status(204).send();
});

export default router;
