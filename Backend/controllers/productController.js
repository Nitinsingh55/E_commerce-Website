const Product = require('../models/Product');
const Category = require('../models/Category');
const { productSchema } = require('../utils/validationSchemas');
const path = require('path');
const fs = require('fs');

// @desc    Get all products with pagination and filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const category = req.query.category || '';

        let categoryId = null;
        if (category) {
            const cat = await Category.findByName(category);
            if (cat) categoryId = cat.id;
        }

        const products = await Product.findAll({ limit, offset, search, category: categoryId });
        const total = await Product.countAll({ search, category: categoryId });
        const totalPages = Math.ceil(total / limit);

        res.json({ products, page, totalPages, total });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new product (admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
    try {
        const { title, price, stock, category_id, description } = req.body;

        const category = await Category.findById(category_id);
        if (!category) return res.status(400).json({ message: 'Invalid category' });

        // Support multiple images via array upload
        let image_url = null;
        let images = [];

        if (req.files && req.files.length > 0) {
            image_url = `/uploads/${req.files[0].filename}`;
            images = req.files.map(f => `/uploads/${f.filename}`);
        } else if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
            images = [image_url];
        }

        const product = await Product.create({
            title,
            price,
            stock,
            category_id,
            image_url,
            images,
            description,
        });

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product (admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { title, price, stock, category_id, description } = req.body;
        let image_url = product.image_url;
        let images = product.images;

        if (req.files && req.files.length > 0) {
            image_url = `/uploads/${req.files[0].filename}`;
            images = req.files.map(f => `/uploads/${f.filename}`);
        } else if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
            images = [image_url];
        }

        const updatedProduct = await Product.update(req.params.id, {
            title,
            price,
            stock,
            category_id,
            image_url,
            images,
            description,
        });

        res.json(updatedProduct);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product (admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Delete all local image files
        const allImages = product.images && product.images.length > 0
            ? product.images
            : (product.image_url ? [product.image_url] : []);
        for (const imgPath of allImages) {
            const filePath = path.join(__dirname, '..', imgPath);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await Product.delete(req.params.id);
        res.json({ message: 'Product removed' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all categories
// @route   GET /api/categories (also accessible via /api/products/categories)
// @access  Public
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
};