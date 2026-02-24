/**
 * MAISON — Kaggle Dataset Image Importer
 *
 * Maps images from the Kaggle "E-commerce Products Image Dataset":
 *   - jeans/   → Men's & Women's jeans/trouser/chino products + Kids denim
 *   - tshirt/  → All clothing tops, shirts, dresses, blouses, jackets
 *   - sofa/    → Home & Living category products
 *   - tv/      → Electronics category products
 *
 * Run: node scripts/importKaggleImages.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST, port: process.env.DB_PORT,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const KAGGLE_DIR = path.join(__dirname, '..', 'ecommerce products');

function isValid(fp) {
    try { return fs.existsSync(fp) && fs.statSync(fp).size > 5000; } catch { return false; }
}

// Get sorted list of image files from a folder
function getImages(folder) {
    const dir = path.join(KAGGLE_DIR, folder);
    if (!fs.existsSync(dir)) { console.error(`❌ Folder not found: ${dir}`); return []; }
    return fs.readdirSync(dir)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort((a, b) => parseInt(a) - parseInt(b) || a.localeCompare(b))
        .map(f => path.join(dir, f));
}

// Pick 3 images starting at a given offset (cycles if needed)
function pick3(images, offset) {
    if (images.length === 0) return [];
    return [0, 1, 2].map(i => images[(offset + i) % images.length]);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * PRODUCT → KAGGLE FOLDER MAPPING
 * offset: which index in the folder to start from (ensures visual variety across products)
 */
const PRODUCT_MAPPING = [
    // ── MEN'S FASHION ──────────────────────────────────────
    { slug: 'men-s-fashion-stretch-denim-jeans', folder: 'jeans', offset: 0 },
    { slug: 'men-s-fashion-slim-fit-chinos', folder: 'jeans', offset: 5 },
    { slug: 'men-s-fashion-cotton-joggers', folder: 'jeans', offset: 10 },
    { slug: 'men-s-fashion-graphic-print-t-shirt', folder: 'tshirt', offset: 0 },
    { slug: 'men-s-fashion-polo-t-shirt', folder: 'tshirt', offset: 5 },
    { slug: 'men-s-fashion-classic-oxford-shirt', folder: 'tshirt', offset: 10 },
    { slug: 'men-s-fashion-casual-linen-shirt', folder: 'tshirt', offset: 15 },
    { slug: 'men-s-fashion-formal-blazer', folder: 'tshirt', offset: 20 },
    { slug: 'men-s-fashion-leather-biker-jacket', folder: 'tshirt', offset: 25 },
    { slug: 'men-s-fashion-quilted-winter-jacket', folder: 'tshirt', offset: 30 },

    // ── WOMEN'S FASHION ────────────────────────────────────
    { slug: 'women-s-fashion-high-waist-jeans', folder: 'jeans', offset: 15 },
    { slug: 'women-s-fashion-faux-leather-trousers', folder: 'jeans', offset: 20 },
    { slug: 'women-s-fashion-pleated-midi-skirt', folder: 'jeans', offset: 25 },
    { slug: 'women-s-fashion-floral-wrap-dress', folder: 'tshirt', offset: 35 },
    { slug: 'women-s-fashion-silk-blouse', folder: 'tshirt', offset: 40 },
    { slug: 'women-s-fashion-embroidered-kurti', folder: 'tshirt', offset: 45 },
    { slug: 'women-s-fashion-blazer-co-ord-set', folder: 'tshirt', offset: 50 },
    { slug: 'women-s-fashion-off-shoulder-top', folder: 'tshirt', offset: 55 },
    { slug: 'women-s-fashion-anarkali-dress', folder: 'tshirt', offset: 60 },
    { slug: 'women-s-fashion-boho-maxi-dress', folder: 'tshirt', offset: 65 },

    // ── KIDS ───────────────────────────────────────────────
    { slug: 'kids-dinosaur-print-t-shirt', folder: 'tshirt', offset: 70 },
    { slug: 'kids-denim-dungaree', folder: 'jeans', offset: 30 },
    { slug: 'kids-floral-party-frock', folder: 'tshirt', offset: 75 },
    { slug: 'kids-kids-track-suit', folder: 'tshirt', offset: 80 },
    { slug: 'kids-cotton-shorts-set', folder: 'tshirt', offset: 85 },
    { slug: 'kids-princess-party-gown', folder: 'tshirt', offset: 90 },
    { slug: 'kids-winter-hooded-jacket', folder: 'tshirt', offset: 95 },
    { slug: 'kids-school-backpack', folder: 'tshirt', offset: 100 },
    { slug: 'kids-kids-sneakers', folder: 'jeans', offset: 35 },

    // ── HOME & LIVING (sofa images) ────────────────────────
    { slug: 'home-living-ceramic-table-lamp', folder: 'sofa', offset: 0 },
    { slug: 'home-living-cotton-throw-blanket', folder: 'sofa', offset: 5 },
    { slug: 'home-living-macrame-wall-hanging', folder: 'sofa', offset: 10 },
    { slug: 'home-living-ceramic-vase-set', folder: 'sofa', offset: 15 },
    { slug: 'home-living-scented-candle-set', folder: 'sofa', offset: 20 },
    { slug: 'home-living-wooden-photo-frame', folder: 'sofa', offset: 25 },
    { slug: 'home-living-linen-cushion-covers', folder: 'sofa', offset: 30 },
    { slug: 'home-living-terracotta-plant-pot', folder: 'sofa', offset: 35 },
    { slug: 'home-living-aromatherapy-diffuser', folder: 'sofa', offset: 40 },
    { slug: 'home-living-wicker-storage-basket', folder: 'sofa', offset: 45 },

    // ── ELECTRONICS (tv images) ────────────────────────────
    { slug: 'electronics-true-wireless-earbuds', folder: 'tv', offset: 0 },
    { slug: 'electronics-smart-watch', folder: 'tv', offset: 5 },
    { slug: 'electronics-bluetooth-speaker', folder: 'tv', offset: 10 },
    { slug: 'electronics-mechanical-keyboard', folder: 'tv', offset: 15 },
    { slug: 'electronics-4k-webcam', folder: 'tv', offset: 20 },
    { slug: 'electronics-usb-c-hub-7-in-1', folder: 'tv', offset: 25 },
    { slug: 'electronics-noise-cancelling-headphon', folder: 'tv', offset: 30 },
    { slug: 'electronics-gaming-mouse', folder: 'tv', offset: 35 },
    { slug: 'electronics-led-ring-light', folder: 'tv', offset: 40 },
    { slug: 'electronics-smart-home-speaker', folder: 'tv', offset: 45 },
];

async function importKaggleImages() {
    // Validate root folder
    if (!fs.existsSync(KAGGLE_DIR)) {
        console.error(`\n❌  Dataset folder not found: ${KAGGLE_DIR}\n`);
        process.exit(1);
    }

    // Create uploads dir if it doesn't exist
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    // Pre-load all image lists
    const images = {
        jeans: getImages('jeans'),
        tshirt: getImages('tshirt'),
        sofa: getImages('sofa'),
        tv: getImages('tv'),
    };

    console.log('\n🖼️  MAISON — Kaggle Image Importer');
    console.log(`📂 Source : ${KAGGLE_DIR}`);
    console.log(`   jeans  : ${images.jeans.length} images`);
    console.log(`   tshirt : ${images.tshirt.length} images`);
    console.log(`   sofa   : ${images.sofa.length} images`);
    console.log(`   tv     : ${images.tv.length} images\n`);

    const client = await pool.connect();
    try {
        // Fetch all products with their category names
        const { rows: products } = await client.query(`
            SELECT p.id, p.title, c.name as category_name
            FROM products p JOIN categories c ON p.category_id = c.id
            ORDER BY c.name, p.title
        `);

        let done = 0; let errors = 0;

        for (const mapping of PRODUCT_MAPPING) {
            const srcs = pick3(images[mapping.folder], mapping.offset);
            if (srcs.length === 0) {
                console.log(`  ⚠️  No images for ${mapping.slug} (folder: ${mapping.folder})`);
                errors++;
                continue;
            }

            const imageUrls = [];
            process.stdout.write(`  📦 ${mapping.slug} ... `);

            for (let i = 0; i < srcs.length; i++) {
                const destName = `${mapping.slug}-${i}.jpg`;
                const destPath = path.join(UPLOADS_DIR, destName);
                try {
                    fs.copyFileSync(srcs[i], destPath);
                    imageUrls.push(`/uploads/${destName}`);
                } catch (err) {
                    process.stdout.write(`✗ `);
                    errors++;
                }
            }

            if (imageUrls.length > 0) {
                // Find matching product in DB
                const dbProd = products.find(p => {
                    const catSlug = p.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').slice(0, 40);
                    const prodSlug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').slice(0, 40);
                    return `${catSlug}-${prodSlug}` === mapping.slug;
                });

                if (dbProd) {
                    await client.query(
                        'UPDATE products SET image_url=$1, images=$2 WHERE id=$3',
                        [imageUrls[0], imageUrls, dbProd.id]
                    );
                    console.log(`${imageUrls.length}/3 ✓`);
                    done++;
                } else {
                    console.log(`✓ files copied (no DB match for slug)`);
                    done++;
                }
            } else {
                console.log('skipped');
            }
        }

        // Also handle Beauty & Sports — keep existing Unsplash images, just re-confirm DB
        console.log('\n🗄️  Syncing remaining products (Beauty/Sports) from disk...');
        let synced = 0;
        for (const p of products) {
            const catSlug = p.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').slice(0, 40);
            const prodSlug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').slice(0, 40);
            const key = `${catSlug}-${prodSlug}`;
            // Skip already handled by PRODUCT_MAPPING
            const handled = PRODUCT_MAPPING.some(m => m.slug === key);
            if (handled) continue;
            // Rebuild DB from existing disk files (Beauty & Sports keep current images)
            const imageUrls = [];
            for (let i = 0; i < 3; i++) {
                const fp = path.join(UPLOADS_DIR, `${key}-${i}.jpg`);
                if (isValid(fp)) imageUrls.push(`/uploads/${key}-${i}.jpg`);
            }
            if (imageUrls.length > 0) {
                await client.query('UPDATE products SET image_url=$1, images=$2 WHERE id=$3',
                    [imageUrls[0], imageUrls, p.id]);
                synced++;
            }
        }

        console.log(`✅ Synced ${synced} remaining products (Beauty & Sports)`);
        console.log(`\n🎉 Import complete!`);
        console.log(`   ✅ Kaggle images applied : ${done} products`);
        console.log(`   ❌ Errors               : ${errors}`);
        const totalFiles = fs.readdirSync(UPLOADS_DIR).filter(f => f.endsWith('.jpg')).length;
        console.log(`   📁 Total uploads/        : ${totalFiles} files\n`);

    } catch (err) {
        console.error('❌ FAILED:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

importKaggleImages();
