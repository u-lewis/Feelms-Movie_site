import { Router, type IRouter } from "express";
import { db, moviesTable, bannersTable, sectionsTable, episodesTable, friendlyTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/backup/export", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  try {
    const [movies, banners, sections, episodes, friendly] = await Promise.all([
      db.select().from(moviesTable),
      db.select().from(bannersTable),
      db.select().from(sectionsTable),
      db.select().from(episodesTable),
      db.select().from(friendlyTable),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      data: { movies, banners, sections, episodes, friendly },
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="feelms-backup-${new Date().toISOString().split("T")[0]}.json"`);
    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: "Backup failed" });
  }
});

export default router;
