import { pgTable, text, serial, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { moviesTable } from "./movies";

export const episodesTable = pgTable("episodes", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull().references(() => moviesTable.id, { onDelete: "cascade" }),
  season: integer("season").notNull().default(1),
  episodeNumber: integer("episode_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  streamUrl: text("stream_url"),
  thumbnail: text("thumbnail"),
  duration: text("duration"),
  vipOnly: boolean("vip_only").notNull().default(false),
  downloadUrl: text("download_url"),
  subtitles: json("subtitles").$type<{ label: string; language: string; url: string }[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEpisodeSchema = createInsertSchema(episodesTable).omit({ id: true, createdAt: true });
export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;
export type Episode = typeof episodesTable.$inferSelect;
