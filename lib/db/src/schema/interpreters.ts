import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const interpretersTable = pgTable("interpreters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio"),
  photo: text("photo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInterpreterSchema = createInsertSchema(interpretersTable).omit({ id: true, createdAt: true });
export type InsertInterpreter = z.infer<typeof insertInterpreterSchema>;
export type Interpreter = typeof interpretersTable.$inferSelect;
