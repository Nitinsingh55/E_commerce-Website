const { pool } = require('../config/database');

const CartItem = {
    async findById(id) {
        const query = 'SELECT * FROM cart_items WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    async findByCartAndProduct(cartId, productId) {
        const query = 'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2';
        const { rows } = await pool.query(query, [cartId, productId]);
        return rows[0];
    },

    async create(cartId, productId, quantity) {
        const query = 'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *';
        const values = [cartId, productId, quantity];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async updateQuantity(id, quantity) {
        const query = 'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *';
        const { rows } = await pool.query(query, [quantity, id]);
        return rows[0];
    },

    async delete(id) {
        const query = 'DELETE FROM cart_items WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    },

    async findByCart(cartId) {
        const query = 'SELECT * FROM cart_items WHERE cart_id = $1';
        const { rows } = await pool.query(query, [cartId]);
        return rows;
    },
};

module.exports = CartItem;