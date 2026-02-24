const { pool } = require('../config/database');

const Order = {
    async create({ userId, totalAmount, paymentMethod, shippingAddress }) {
        const query = `
            INSERT INTO orders (user_id, total_amount, payment_method, shipping_address)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const values = [userId, totalAmount, paymentMethod, shippingAddress];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async findById(id) {
        const query = `
            SELECT o.*, u.name as user_name, u.email as user_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    async findByUser(userId, limit = 20, offset = 0) {
        const query = `
            SELECT * FROM orders
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const { rows } = await pool.query(query, [userId, limit, offset]);
        return rows;
    },

    async findAllWithUser(limit = 50, offset = 0) {
        const query = `
            SELECT o.*, u.name as user_name, u.email as user_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const { rows } = await pool.query(query, [limit, offset]);
        return rows;
    },

    async updateStatus(id, status) {
        const query = 'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *';
        const { rows } = await pool.query(query, [status, id]);
        return rows[0];
    },

    async getTotalSales() {
        const query = 'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != $1';
        const { rows } = await pool.query(query, ['cancelled']);
        return parseFloat(rows[0].total);
    },

    async countOrders() {
        const query = 'SELECT COUNT(*) FROM orders';
        const { rows } = await pool.query(query);
        return parseInt(rows[0].count);
    },

    async getMonthlySales() {
        const query = `
            SELECT 
                TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
                EXTRACT(MONTH FROM created_at) as month_num,
                EXTRACT(YEAR FROM created_at) as year,
                COALESCE(SUM(total_amount), 0) as sales,
                COUNT(*) as orders
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', created_at), EXTRACT(MONTH FROM created_at), EXTRACT(YEAR FROM created_at)
            ORDER BY year, month_num
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    async getDailySales(days = 7) {
        const query = `
            SELECT 
                TO_CHAR(DATE_TRUNC('day', created_at), 'Dy') as day,
                TO_CHAR(DATE_TRUNC('day', created_at), 'DD Mon') as date,
                COALESCE(SUM(total_amount), 0) as sales,
                COUNT(*) as orders
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY DATE_TRUNC('day', created_at)
            ORDER BY DATE_TRUNC('day', created_at)
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    async getCategoryRevenue() {
        const query = `
            SELECT c.name, COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as revenue
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id
            LEFT JOIN order_items oi ON oi.product_id = p.id
            GROUP BY c.id, c.name
            ORDER BY revenue DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },
};

module.exports = Order;