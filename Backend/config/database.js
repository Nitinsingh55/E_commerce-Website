const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

const connectDB = async () => {
    try {
        await pool.connect();
        console.log('PostgreSQL connected');
    } catch (err) {
        console.error('Database connection error', err);
        process.exit(1);
    }
};

module.exports = { pool, connectDB };