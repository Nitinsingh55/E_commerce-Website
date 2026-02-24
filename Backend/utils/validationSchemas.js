const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'admin').default('user'),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const productSchema = Joi.object({
    title: Joi.string().max(200).required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required(),
    category_id: Joi.number().integer().required(),
    description: Joi.string().allow('', null),
});

const categorySchema = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().allow('', null),
});

const cartItemSchema = Joi.object({
    productId: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).default(1),
});

const updateCartItemSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required(),
});

const orderSchema = Joi.object({
    shippingAddress: Joi.string().required(),
    paymentMethod: Joi.string().valid('card', 'paypal', 'cod').required(),
});

module.exports = {
    registerSchema,
    loginSchema,
    productSchema,
    categorySchema,
    cartItemSchema,
    updateCartItemSchema,
    orderSchema,
};