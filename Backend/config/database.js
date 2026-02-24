const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    console.error('====================================================');
    console.error('ERROR: Database connection variables are missing!');
    console.error('You must set DATABASE_URL in your Render Environment.');
    console.error('Please go to the Render Dashboard -> Environment tab and ensure DATABASE_URL is saved.');
    console.error('====================================================');
    process.exit(1);
}

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_HOST && process.env.DB_HOST.includes('neon.tech') ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(poolConfig);

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
});

const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('PostgreSQL connected');
        client.release();
    } catch (err) {
        console.error('Database connection error', err);
        process.exit(1);
    }
};

module.exports = { pool, connectDB };