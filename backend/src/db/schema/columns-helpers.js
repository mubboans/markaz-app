// columns.helpers.ts
import { integer, timestamp } from 'drizzle-orm/pg-core';
export const helper_columns = (remove_keys = {}) => {
    const helper_columns = {
        id: integer().primaryKey().generatedByDefaultAsIdentity(),
        updated_at: timestamp(),
        created_at: timestamp().defaultNow().defaultNow(),
        deleted_at: timestamp(),
        deleted_by: integer('deleted_by'),
        last_ip: integer('last_ip'),
    }
    if (Object.keys(remove_keys).length) {
        Object.keys(remove_keys).forEach(key => {
            if (remove_keys[key]) {
                delete helper_columns[key];
            }
        });
    }
    return helper_columns;
}
