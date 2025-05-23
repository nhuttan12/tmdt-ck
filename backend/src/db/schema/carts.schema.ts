import { int, mysqlTable } from 'drizzle-orm/mysql-core';
import { users } from './users.schema';
import { status } from './status.schema';
import { timestamps } from '../helper/timestamp';
import { relations } from 'drizzle-orm';

export const carts = mysqlTable('carts', {
  id: int().primaryKey().notNull().autoincrement(),
  userId: int('user_id')
    .references(() => users.id)
    .notNull(),
  statusId: int('status_id')
    .references(() => status.id)
    .notNull(),
  ...timestamps,
});

export const cartsToCartDetails = relations(carts, ({ many }) => ({
  carts: many(carts),
}));
