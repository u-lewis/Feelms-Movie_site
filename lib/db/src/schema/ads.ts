import { pgTable, text, serial, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adTypeEnum = pgEnum("ad_type", ["PREROLL", "DOWNLOAD", "TAB_RETURN", "BANNER"]);
export const adTargetEnum = pgEnum("ad_target", ["FREE_ONLY", "ALL"]);

export const adsTable = pgTable("ads", {
  id: serial("id").primaryKey(),
  type: adTypeEnum("type").notNull(),
  mediaUrl: text("media_url"),
  imageUrl: text("image_url"),
  title: text("title"),
  duration: integer("duration").notNull().default(10),
  active: boolean("active").notNull().default(true),
  target: adTargetEnum("target").notNull().default("FREE_ONLY"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adImpressionsTable = pgTable("ad_impressions", {
  id: serial("id").primaryKey(),
  adId: integer("ad_id").notNull(),
  userId: integer("user_id"),
  context: text("context").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAdSchema = createInsertSchema(adsTable).omit({ id: true, createdAt: true });
export type InsertAd = z.infer<typeof insertAdSchema>;
export type Ad = typeof adsTable.$inferSelect;

export const insertAdImpressionSchema = createInsertSchema(adImpressionsTable).omit({ id: true, timestamp: true });
export type InsertAdImpression = z.infer<typeof insertAdImpressionSchema>;
export type AdImpression = typeof adImpressionsTable.$inferSelect;
