require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Running migration...');
        await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'`);
        await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 4.2`);
        await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0`);
        console.log('Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
