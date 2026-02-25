const { pool } = require('../config/database');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const { orderSchema } = require('../utils/validationSchemas');

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const { error } = orderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { shippingAddress, paymentMethod } = req.body;

        // Get user's cart with items
        const cart = await Cart.getCartWithItems(req.user.id);
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        await client.query('BEGIN');

        let totalAmount = 0;
        const orderItems = [];

        // Validate stock and calculate total
        for (const item of cart.items) {
            const product = await Product.findById(item.product.id);
            if (!product) {
                throw new Error(`Product ${item.product.id} not found`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Not enough stock for ${product.title}`);
            }
            totalAmount += product.price * item.quantity;
            orderItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
            });
        }

        // Create order
        const order = await Order.create({
            userId: req.user.id,
            totalAmount,
            paymentMethod,
            shippingAddress,
        });

        // Create order items and decrement stock
        for (const item of orderItems) {
            await OrderItem.create(order.id, item.productId, item.quantity, item.price);
            await Product.decrementStock(item.productId, item.quantity);
        }

        // Clear cart
        await Cart.clearCart(cart.id);

        await client.query('COMMIT');

        res.status(201).json(order);
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.findByUser(req.user.id);

        // Fetch items for each order
        for (let order of orders) {
            const items = await OrderItem.findByOrder(order.id);
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (own order or admin)
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is owner or admin
        if (order.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Get order items
        const items = await OrderItem.findByOrder(order.id);
        order.items = items;

        res.json(order);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
};