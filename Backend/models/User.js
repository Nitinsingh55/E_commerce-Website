const { pool } = require('../config/database');

const User = {
    async create({ name, email, hashedPassword, role = 'user' }) {
    const query = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role';
    const values = [name, email, hashedPassword, role];
    const { rows } = await pool.query(query, values);
    return rows[0];
    },

    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    },

    async findById(id) {
        const query = 'SELECT id, name, email, role FROM users WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    async getAllCustomers() {
        const query = 'SELECT id, name, email, created_at FROM users WHERE role = $1 ORDER BY created_at DESC';
        const { rows } = await pool.query(query, ['user']);
        return rows;
    },

    async countCustomers() {
        const query = 'SELECT COUNT(*) FROM users WHERE role = $1';
        const { rows } = await pool.query(query, ['user']);
        return parseInt(rows[0].count);
    },
};

module.exports = User;