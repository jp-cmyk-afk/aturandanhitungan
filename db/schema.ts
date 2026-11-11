import { pgTable, text, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const players = pgTable('players', {
  id: text().primaryKey(),
  name: text().notNull(),
  color: text().notNull(),
  x: integer().notNull(),
  y: integer().notNull(),
  jumpZ: integer('jump_z').notNull().default(0),
  dirX: integer('dir_x').notNull().default(0),
  score: integer().notNull().default(0),
  lastSeen: timestamp('last_seen', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('players_last_seen_idx').on(table.lastSeen)]);
