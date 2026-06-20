import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { interpretersTable, moviesTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

function serialize(i: any) {
  return {
    id: i.id,
    name: i.name,
    bio: i.bio ?? null,
    photo: i.photo ?? null,
    createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
  };
}

router.get("/interpreters", async (_req, res): Promise<void> => {
  const rows = await db.select().from(interpretersTable).orderBy(desc(interpretersTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/interpreters", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { name, bio, photo } = req.body;
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "name is required" });
    return;
  }
  const [row] = await db.insert(interpretersTable).values({ name, bio: bio || null, photo: photo || null }).returning();
  res.status(201).json(serialize(row));
});

router.patch("/interpreters/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  // Fetch the current record so we know the old name before updating
  const [existing] = await db.select().from(interpretersTable).where(eq(interpretersTable.id, id));
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const { name, bio, photo } = req.body;
  const update: any = {};
  if (name !== undefined) update.name = name;
  if (bio !== undefined) update.bio = bio || null;
  if (photo !== undefined) update.photo = photo || null;

  const [row] = await db.update(interpretersTable).set(update).where(eq(interpretersTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  // If the name changed, cascade the rename across all linked movies
  if (name !== undefined && name !== existing.name) {
    await db.execute(
      sql`UPDATE movies
          SET interpreters = array_replace(interpreters, ${existing.name}, ${row.name})`
    );
  }

  res.json(serialize(row));
});

router.delete("/interpreters/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db.delete(interpretersTable).where(eq(interpretersTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  // Remove this interpreter's name from every movie that references it
  await db.execute(
    sql`UPDATE movies
        SET interpreters = array_remove(interpreters, ${row.name}),
            interpreted  = CASE
              WHEN array_length(array_remove(interpreters, ${row.name}), 1) IS NULL THEN false
              ELSE interpreted
            END`
  );

  res.sendStatus(204);
});

export default router;
