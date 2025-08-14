import { pgTable, text } from 'drizzle-orm/pg-core';
import { helper_columns } from './columns-helpers.js';

export const users = pgTable('Users', {
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    isActive: text('is_active').default('true'),
    role: text('role').default('user'),
    ...helper_columns
});