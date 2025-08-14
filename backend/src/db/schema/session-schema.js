import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { helper_columns } from './columns-helpers.js';

export const users = pgTable('Users', {
    sessionId: uuid('id').defaultRandom(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    isActive: text('is_active').default('true'),
    role: text('role').default('user'),
    ...helper_columns(({ remove_deleted_by: true }))
});