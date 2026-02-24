const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const { cartItemSchema, updateCartItemSchema } = require('../utils/validationSchemas');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
    try {
        const cart = await Cart.getCartWithItems(req.user.id);
        if (!cart) {
            return res.json({ items: [] }); // empty cart
        }
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res, next) => {
    try {
        const { error } = cartItemSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { productId, quantity } = req.body;

        // Check if product exists and has enough stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock' });
        }

        // Get or create cart for user
        let cart = await Cart.findByUserId(req.user.id);
        if (!cart) {
            cart = await Cart.create(req.user.id);
        }

        // Check if item already in cart
        let cartItem = await CartItem.findByCartAndProduct(cart.id, productId);
        if (cartItem) {
            // Update quantity
            const newQuantity = cartItem.quantity + quantity;
            if (product.stock < newQuantity) {
                return res.status(400).json({ message: 'Not enough stock' });
            }
            cartItem = await CartItem.updateQuantity(cartItem.id, newQuantity);
        } else {
            // Create new cart item
            cartItem = await CartItem.create(cart.id, productId, quantity);
        }

        const updatedCart = await Cart.getCartWithItems(req.user.id);
        res.json(updatedCart);
    } catch (error) {
        next(error);
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:itemId
// @access  Private
const updateCartItem = async (req, res, next) => {
    try {
        const { error } = updateCartItemSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { quantity } = req.body;
        const itemId = req.params.itemId;

        // Get cart for user
        const cart = await Cart.findByUserId(req.user.id);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Get cart item by id
        const item = await CartItem.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        // Verify item belongs to user's cart
        if (item.cart_id !== cart.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check stock
        const product = await Product.findById(item.product_id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock' });
        }

        await CartItem.updateQuantity(itemId, quantity);
        const updatedCart = await Cart.getCartWithItems(req.user.id);
        res.json(updatedCart);
    } catch (error) {
        next(error);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeCartItem = async (req, res, next) => {
    try {
        const itemId = req.params.itemId;
        const cart = await Cart.findByUserId(req.user.id);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = await CartItem.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        if (item.cart_id !== cart.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await CartItem.delete(itemId);
        const updatedCart = await Cart.getCartWithItems(req.user.id);
        res.json(updatedCart);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
};