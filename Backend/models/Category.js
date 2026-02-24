const { pool } = require('../config/database');

const Category = {
    async create({ name, description }) {
        const query = 'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *';
        const values = [name, description || null];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async findAll() {
        const query = 'SELECT * FROM categories ORDER BY name';
        const { rows } = await pool.query(query);
        return rows;
    },

    async findByName(name) {
    const query = 'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)';
    const { rows } = await pool.query(query, [name]);
    return rows[0];
    },

    async findById(id) {
        const query = 'SELECT * FROM categories WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    async update(id, { name, description }) {
        const query = 'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *';
        const values = [name, description, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async delete(id) {
        const query = 'DELETE FROM categories WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    },
};

module.exports = Category;