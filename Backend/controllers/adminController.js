const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
    try {
        const totalSales = await Order.getTotalSales();
        const totalOrders = await Order.countOrders();
        const totalProducts = await Product.countAll({});
        const totalCustomers = await User.countCustomers();
        const topProducts = await Product.getTopSelling(5);
        const dailySales = await Order.getDailySales(7);

        res.json({
            totalSales,
            totalOrders,
            totalProducts,
            totalCustomers,
            topProducts,
            dailySales,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get analytics data (real database data)
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
    try {
        const monthlySales = await Order.getMonthlySales();
        const topProducts = await Product.getTopSelling(10);
        const categoryRevenue = await Order.getCategoryRevenue();
        const dailySales = await Order.getDailySales(30);

        res.json({
            monthlySales,
            topProducts,
            categoryRevenue,
            dailySales,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders with user info
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.findAllWithUser();
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['pending', 'paid', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const updated = await Order.updateStatus(req.params.id, status);
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getAnalytics,
    getAllOrders,
    updateOrderStatus,
};