const { pool } = require('../config/database');

const OrderItem = {
    async create(orderId, productId, quantity, priceAtTime) {
        const query = `
            INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const values = [orderId, productId, quantity, priceAtTime];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async findByOrder(orderId) {
        const query = `
            SELECT oi.*, p.title as product_title, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
        `;
        const { rows } = await pool.query(query, [orderId]);
        return rows;
    },
};

module.exports = OrderItem;