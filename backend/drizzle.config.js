require('dotenv').config();
console.log(process.env.DB_HOST_NAME,' process.env.DB_HOST_NAME');
const fs = require('fs');

/** @type { import("drizzle-kit").Config } */
module.exports = {
    schema: "./src/db/schema/*.js", // Path to schema files
    out: "./drizzle", // Migrations folder
    dialect: "postgresql",
    dbCredentials: {
        // url: process.env.DATABASE_URL, // <-- Correct key name
        host: process.env.DB_HOST_NAME,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DATABASE_NAME,
        ssl: {
            rejectUnauthorized: true,
            ca: fs.readFileSync('ca.pem').toString(),
        },
    },
    verbose: true,
    strict: true,
};