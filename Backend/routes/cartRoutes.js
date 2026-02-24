const express = require('express');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // all cart routes require authentication

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update/:itemId', updateCartItem);
router.delete('/remove/:itemId', removeCartItem);

module.exports = router;