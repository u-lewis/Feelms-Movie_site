import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sectionsTable = pgTable("homepage_sections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  movieIds: integer("movie_ids").array().notNull().default([]),
  orderIndex: integer("order_index").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
  sectionType: text("section_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSectionSchema = createInsertSchema(sectionsTable).omit({ id: true, createdAt: true });
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Section = typeof sectionsTable.$inferSelect;
