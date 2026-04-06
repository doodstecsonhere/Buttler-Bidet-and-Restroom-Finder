import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const restroomAuditsTable = pgTable("restroom_audits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  restroomId: integer("restroom_id").notNull(),
  restroomName: text("restroom_name").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  pwdAccessible: boolean("pwd_accessible").notNull().default(false),
  hasSoap: boolean("has_soap").notNull().default(false),
  hasToiletSeat: boolean("has_toilet_seat").notNull().default(false),
  hasTissue: boolean("has_tissue").notNull().default(false),
  hasFunctionalBidet: boolean("has_functional_bidet").notNull().default(false),
  remarks: text("remarks"),
  tierStatus: text("tier_status").notNull().default("tier_1"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRestroomAuditSchema = createInsertSchema(restroomAuditsTable).omit({
  id: true,
  createdAt: true,
  tierStatus: true,
});

export type InsertRestroomAudit = z.infer<typeof insertRestroomAuditSchema>;
export type RestroomAudit = typeof restroomAuditsTable.$inferSelect;
