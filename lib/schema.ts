import { sql } from "drizzle-orm";
import { check, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    content: jsonb("content").notNull(),
    plainText: text("plain_text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check(
      "notes_plain_text_length_check",
      sql`char_length(${table.plainText}) <= 120`,
    ),
    check(
      "notes_plain_text_not_blank_check",
      sql`char_length(btrim(${table.plainText})) > 0`,
    ),
    index("notes_created_at_idx").on(table.createdAt),
  ],
);

export type Note = typeof notes.$inferSelect;
