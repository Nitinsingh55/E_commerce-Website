const { pool } = require('../config/database');

const Cart = {
    async findByUserId(userId) {
        const query = 'SELECT * FROM carts WHERE user_id = $1';
        const { rows } = await pool.query(query, [userId]);
        return rows[0];
    },

    async create(userId) {
        const query = 'INSERT INTO carts (user_id) VALUES ($1) RETURNING *';
        const { rows } = await pool.query(query, [userId]);
        return rows[0];
    },

    async getCartWithItems(userId) {
        const cartQuery = 'SELECT * FROM carts WHERE user_id = $1';
        const cartResult = await pool.query(cartQuery, [userId]);
        const cart = cartResult.rows[0];
        if (!cart) return null;

        const itemsQuery = `
            SELECT ci.id, ci.quantity,
                   p.id as product_id, p.title, p.price, p.image_url, p.stock
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = $1
        `;
        const itemsResult = await pool.query(itemsQuery, [cart.id]);
        const items = itemsResult.rows.map(row => ({
            id: row.id,
            quantity: row.quantity,
            product: {
                id: row.product_id,
                title: row.title,
                price: parseFloat(row.price),
                image_url: row.image_url,
                stock: row.stock,
            }
        }));
        return { ...cart, items };
    },

    async clearCart(cartId) {
        const query = 'DELETE FROM cart_items WHERE cart_id = $1';
        await pool.query(query, [cartId]);
        return true;
    },
};

module.exports = Cart;