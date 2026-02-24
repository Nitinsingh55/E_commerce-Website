const { pool } = require('../config/database');

const Product = {
    async create({ title, price, stock, category_id, image_url, images, description, rating, review_count }) {
        const query = `
            INSERT INTO products (title, price, stock, category_id, image_url, images, description, rating, review_count)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `;
        const values = [title, price, stock, category_id, image_url, images || [], description, rating || 4.2, review_count || 0];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async findAll({ limit, offset, search, category }) {
        let query = `
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND p.title ILIKE $${paramIndex}`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        if (category) {
            query += ` AND p.category_id = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }
        query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const { rows } = await pool.query(query, params);
        return rows;
    },

    async countAll({ search, category } = {}) {
        let query = 'SELECT COUNT(*) FROM products WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND title ILIKE $${paramIndex}`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        if (category) {
            query += ` AND category_id = $${paramIndex}`;
            params.push(category);
        }
        const { rows } = await pool.query(query, params);
        return parseInt(rows[0].count);
    },

    async findById(id) {
        const query = `
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    async update(id, { title, price, stock, category_id, image_url, images, description }) {
        const query = `
            UPDATE products
            SET title = $1, price = $2, stock = $3, category_id = $4,
                image_url = COALESCE($5, image_url),
                images = COALESCE($6, images),
                description = $7
            WHERE id = $8 RETURNING *
        `;
        const values = [title, price, stock, category_id, image_url, images, description, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async delete(id) {
        const query = 'DELETE FROM products WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    },

    async checkStock(productId, quantity) {
        const query = 'SELECT stock FROM products WHERE id = $1';
        const { rows } = await pool.query(query, [productId]);
        return rows[0] && rows[0].stock >= quantity;
    },

    async decrementStock(productId, quantity) {
        const query = 'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1';
        const result = await pool.query(query, [quantity, productId]);
        return result.rowCount > 0;
    },

    async getTopSelling(limit = 5) {
        const query = `
            SELECT p.id, p.title, p.image_url, COALESCE(SUM(oi.quantity), 0) as total_sold, 
                   COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as revenue
            FROM products p
            LEFT JOIN order_items oi ON oi.product_id = p.id
            GROUP BY p.id, p.title, p.image_url
            ORDER BY total_sold DESC
            LIMIT $1
        `;
        const { rows } = await pool.query(query, [limit]);
        return rows;
    },
};

module.exports = Product;