import { int, mysqlEnum, mysqlTable } from 'drizzle-orm/mysql-core';
import { users } from './users.schema';
import { timestamps } from '../helper/timestamp';
import { relations } from 'drizzle-orm';
import { cartDetails } from './cart-details.schema';
import { CartStatus } from 'src/helper/enum/status/cart-status.enum';

export const carts = mysqlTable('carts', {
  id: int().primaryKey().notNull().autoincrement(),
  userId: int('user_id')
    .references(() => users.id)
    .notNull(),
  status: mysqlEnum(
    Object.values(CartStatus) as [string, ...string[]],
  ).notNull(),
  ...timestamps,
});

export const cartsToCartDetails = relations(carts, ({ many }) => ({
  cartDetails: many(cartDetails),
}));
