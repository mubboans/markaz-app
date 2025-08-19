import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
import { users } from './schema/user-schema.js';

dotenv.config();

// Load SSL certificate
const caCert = fs.readFileSync('ca.pem', 'utf8');

// Create a connection pool for Drizzle
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: true,
        ca: caCert,
    },
    
});
export const db = drizzle(pool,{ schema: { users }});