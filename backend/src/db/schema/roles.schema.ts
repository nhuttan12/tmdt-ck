import { int, mysqlEnum, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { timestamps } from '@db-helper/timestamp';
import { users } from '@schema';
import { relations } from 'drizzle-orm';
import { RoleStatus } from '@enum/status/role-status.enum';

export const roles = mysqlTable('roles', {
  id: int().primaryKey().notNull().autoincrement(),
  name: varchar('name', { length: 45 }).notNull(),
  status: mysqlEnum(Object.values(RoleStatus) as [string, ...string[]]),
  ...timestamps,
});

export const roleRelation = relations(roles, ({ many }) => ({
  users: many(users),
}));
