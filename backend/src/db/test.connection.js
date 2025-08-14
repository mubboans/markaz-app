// test-connection.js

import { sql } from 'drizzle-orm';
import { db } from './index.js';

export const testConnection =async ()=>{
    try {
         await db.execute(sql`SELECT NOW()`);
        console.log('✅ DB Connected Successfully');
    } catch (err) {
        console.error('❌ DB Connection Failed:', err);
    }
}
