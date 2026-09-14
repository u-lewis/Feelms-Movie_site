import { pgTable, serial, timestamp, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const watchHistoryTable = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull(),
  userId: integer("user_id"),
  episodeId: integer("episode_id"),
  ipAddress: text("ip_address"),
  watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWatchHistorySchema = createInsertSchema(watchHistoryTable).omit({ id: true, watchedAt: true }).partial({ userId: true, ipAddress: true });
export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;
export type WatchHistory = typeof watchHistoryTable.$inferSelect;
