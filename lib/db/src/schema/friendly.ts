import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const friendlyTable = pgTable("friendly_sites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  url: text("url").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFriendlySchema = createInsertSchema(friendlyTable).omit({ id: true, createdAt: true });
export type InsertFriendly = z.infer<typeof insertFriendlySchema>;
export type Friendly = typeof friendlyTable.$inferSelect;
