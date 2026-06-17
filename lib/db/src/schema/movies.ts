import { pgTable, text, serial, timestamp, boolean, integer, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const moviesTable = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  poster: text("poster").notNull(),
  trailer: text("trailer"),
  streamingLinks: text("streaming_links").array().notNull().default([]),
  downloadLinks: text("download_links").array().notNull().default([]),
  vipDownloadLinks: text("vip_download_links"),
  vipOnly: boolean("vip_only").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  genres: text("genres").array().notNull().default([]),
  year: integer("year"),
  rating: real("rating"),
  duration: text("duration"),
  watchCount: integer("watch_count").notNull().default(0),
  streamUrl: text("stream_url"),
  contentType: text("content_type").notNull().default("MOVIE"),
  subtitles: json("subtitles").$type<{ label: string; language: string; url: string }[]>().default([]),
  interpreted: boolean("interpreted").notNull().default(false),
  interpreters: text("interpreters").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMovieSchema = createInsertSchema(moviesTable).omit({ id: true, createdAt: true, watchCount: true });
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof moviesTable.$inferSelect;
