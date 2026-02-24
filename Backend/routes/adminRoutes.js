const express = require('express');
const {
    getDashboardStats,
    getAnalytics,
    getAllOrders,
    updateOrderStatus,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;