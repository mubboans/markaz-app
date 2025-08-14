import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

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

// Export Drizzle DB instance
export const db = drizzle(pool);

// Create a separate client for connection testing
// export const connectionTest = new Client({
//     host: process.env.DB_HOST_NAME,
//     port: Number(process.env.DB_PORT),
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DATABASE_NAME,
//     ssl: {
//         rejectUnauthorized: true,
//         ca: caCert,
//     },
// });

// // Test DB connection
// connectionTest.connect()
//     .then(() => console.log('✅ DB Connected 👍'))
//     .catch((err) => console.error('❌ Failed to Connect 👎', err.message));
