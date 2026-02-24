/**
 * Create Admin User script
 * Run: node scripts/createAdmin.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

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

async function createAdmin() {
    const client = await pool.connect();
    try {
        const email = 'admin@maison.com';
        const password = 'admin123';
        const name = 'MAISON Admin';

        // Check if already exists
        const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            await client.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email]);
            console.log(`✓ Updated existing user to admin: ${email}`);
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await client.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                [name, email, hashedPassword, 'admin']
            );
            console.log(`✓ Admin user created!`);
        }

        console.log(`\n📧 Email:    ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log(`🔗 Login at: http://localhost:5173/admin/login\n`);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

createAdmin();
