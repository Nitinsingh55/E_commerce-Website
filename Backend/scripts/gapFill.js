/**
 * MAISON — Smart Gap Filler
 * For each product:
 *   - If some images exist: copy them to fill missing slots
 *   - If no images exist: download from picsum.photos (always works)
 * Then rebuilds DB image arrays.
 *
 * Run: node scripts/gapFill.js
 */
require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST, port: process.env.DB_PORT,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 10000) return resolve(`/uploads/${filename}`);
        const doGet = (u, tries) => {
            if (tries <= 0) return reject(new Error('Too many redirects'));
            const proto = u.startsWith('https') ? https : http;
            proto.get(u, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
                if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    res.resume(); let loc = res.headers.location;
                    if (!loc) return reject(new Error('No location'));
                    if (!loc.startsWith('http')) loc = 'https://picsum.photos' + loc;
                    return doGet(loc, tries - 1);
                }
                if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
                const file = fs.createWriteStream(filePath);
                res.pipe(file);
                file.on('finish', () => { file.close(); resolve(`/uploads/${filename}`); });
                file.on('error', (e) => { file.close(); try { fs.unlinkSync(filePath); } catch { } reject(e); });
            }).on('error', reject).on('timeout', function () { this.destroy(); reject(new Error('Timeout')); });
        };
        doGet(url, 8);
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// All products with their slugs
const ALL_PRODUCTS = [
    { cat: "men-s-fashion", prod: "classic-oxford-shirt", seed: 10 },
    { cat: "men-s-fashion", prod: "slim-fit-chinos", seed: 11 },
    { cat: "men-s-fashion", prod: "leather-biker-jacket", seed: 12 },
    { cat: "men-s-fashion", prod: "casual-linen-shirt", seed: 13 },
    { cat: "men-s-fashion", prod: "formal-blazer", seed: 14 },
    { cat: "men-s-fashion", prod: "graphic-print-t-shirt", seed: 15 },
    { cat: "men-s-fashion", prod: "stretch-denim-jeans", seed: 16 },
    { cat: "men-s-fashion", prod: "polo-t-shirt", seed: 17 },
    { cat: "men-s-fashion", prod: "cotton-joggers", seed: 18 },
    { cat: "men-s-fashion", prod: "quilted-winter-jacket", seed: 19 },
    { cat: "women-s-fashion", prod: "floral-wrap-dress", seed: 20 },
    { cat: "women-s-fashion", prod: "high-waist-jeans", seed: 21 },
    { cat: "women-s-fashion", prod: "silk-blouse", seed: 22 },
    { cat: "women-s-fashion", prod: "embroidered-kurti", seed: 23 },
    { cat: "women-s-fashion", prod: "pleated-midi-skirt", seed: 24 },
    { cat: "women-s-fashion", prod: "blazer-co-ord-set", seed: 25 },
    { cat: "women-s-fashion", prod: "off-shoulder-top", seed: 26 },
    { cat: "women-s-fashion", prod: "anarkali-dress", seed: 27 },
    { cat: "women-s-fashion", prod: "faux-leather-trousers", seed: 28 },
    { cat: "women-s-fashion", prod: "boho-maxi-dress", seed: 29 },
    { cat: "kids", prod: "dinosaur-print-t-shirt", seed: 30 },
    { cat: "kids", prod: "denim-dungaree", seed: 31 },
    { cat: "kids", prod: "floral-party-frock", seed: 32 },
    { cat: "kids", prod: "kids-track-suit", seed: 33 },
    { cat: "kids", prod: "school-backpack", seed: 34 },
    { cat: "kids", prod: "kids-sneakers", seed: 35 },
    { cat: "kids", prod: "winter-hooded-jacket", seed: 36 },
    { cat: "kids", prod: "cotton-shorts-set", seed: 37 },
    { cat: "kids", prod: "princess-party-gown", seed: 38 },
    { cat: "home-living", prod: "ceramic-table-lamp", seed: 40 },
    { cat: "home-living", prod: "cotton-throw-blanket", seed: 41 },
    { cat: "home-living", prod: "macrame-wall-hanging", seed: 42 },
    { cat: "home-living", prod: "ceramic-vase-set", seed: 43 },
    { cat: "home-living", prod: "scented-candle-set", seed: 44 },
    { cat: "home-living", prod: "wooden-photo-frame", seed: 45 },
    { cat: "home-living", prod: "linen-cushion-covers", seed: 46 },
    { cat: "home-living", prod: "terracotta-plant-pot", seed: 47 },
    { cat: "home-living", prod: "aromatherapy-diffuser", seed: 48 },
    { cat: "home-living", prod: "wicker-storage-basket", seed: 49 },
    { cat: "beauty", prod: "vitamin-c-face-serum", seed: 50 },
    { cat: "beauty", prod: "hyaluronic-moisturizer", seed: 51 },
    { cat: "beauty", prod: "rose-gold-brush-set", seed: 52 },
    { cat: "beauty", prod: "retinol-night-cream", seed: 53 },
    { cat: "beauty", prod: "matte-lipstick-set", seed: 54 },
    { cat: "beauty", prod: "argan-hair-serum", seed: 55 },
    { cat: "beauty", prod: "jade-facial-roller", seed: 56 },
    { cat: "beauty", prod: "charcoal-face-wash", seed: 57 },
    { cat: "beauty", prod: "eyeshadow-palette", seed: 58 },
    { cat: "beauty", prod: "spf-50-sunscreen", seed: 59 },
    { cat: "electronics", prod: "true-wireless-earbuds", seed: 60 },
    { cat: "electronics", prod: "smart-watch", seed: 61 },
    { cat: "electronics", prod: "bluetooth-speaker", seed: 62 },
    { cat: "electronics", prod: "mechanical-keyboard", seed: 63 },
    { cat: "electronics", prod: "4k-webcam", seed: 64 },
    { cat: "electronics", prod: "usb-c-hub-7-in-1", seed: 65 },
    { cat: "electronics", prod: "noise-cancelling-headphon", seed: 66 },
    { cat: "electronics", prod: "gaming-mouse", seed: 67 },
    { cat: "electronics", prod: "led-ring-light", seed: 68 },
    { cat: "electronics", prod: "smart-home-speaker", seed: 69 },
    { cat: "sports", prod: "premium-yoga-mat", seed: 70 },
    { cat: "sports", prod: "resistance-bands-set", seed: 71 },
    { cat: "sports", prod: "men-s-running-shoes", seed: 72 },
    { cat: "sports", prod: "insulated-sports-bottle", seed: 73 },
    { cat: "sports", prod: "gym-duffel-bag", seed: 74 },
    { cat: "sports", prod: "adjustable-dumbbells", seed: 75 },
    { cat: "sports", prod: "foam-roller", seed: 76 },
    { cat: "sports", prod: "speed-jump-rope", seed: 77 },
    { cat: "sports", prod: "fitness-tracker-band", seed: 78 },
    { cat: "sports", prod: "sports-grip-gloves", seed: 79 },
];

function isValid(fp) {
    return fs.existsSync(fp) && fs.statSync(fp).size > 10000;
}

async function gapFill() {
    const client = await pool.connect();
    try {
        console.log('\n🔧 MAISON — Smart Gap Filler\n');

        let copied = 0; let downloaded = 0; let alreadyOk = 0;

        for (const item of ALL_PRODUCTS) {
            const key = `${item.cat}-${item.prod}`;
            const files = [0, 1, 2].map(i => ({
                index: i,
                name: `${key}-${i}.jpg`,
                path: path.join(UPLOADS_DIR, `${key}-${i}.jpg`),
            }));

            const existing = files.filter(f => isValid(f.path));
            const missing = files.filter(f => !isValid(f.path));

            if (missing.length === 0) { alreadyOk++; continue; }

            if (existing.length > 0) {
                // COPY strategy — fill gaps from existing images of same product
                const donor = existing[0];
                for (const m of missing) {
                    fs.copyFileSync(donor.path, m.path);
                    console.log(`  📋 Copied ${donor.name} → ${m.name}`);
                    copied++;
                }
            } else {
                // DOWNLOAD strategy — picsum.photos is 100% reliable
                // Use seed to get diverse but consistent images
                for (let i = 0; i < 3; i++) {
                    const f = files[i];
                    if (isValid(f.path)) continue;
                    const url = `https://picsum.photos/seed/${item.seed + i}/600/800`;
                    process.stdout.write(`  ⬇  ${f.name} (picsum) ... `);
                    try {
                        await downloadImage(url, f.name);
                        console.log('✓');
                        downloaded++;
                    } catch (err) {
                        console.log(`✗ ${err.message}`);
                    }
                    await sleep(200);
                }
            }
        }

        // Fix hero-home-living.jpg with picsum
        const heroPath = path.join(UPLOADS_DIR, 'hero-home-living.jpg');
        if (!isValid(heroPath)) {
            const url = 'https://picsum.photos/seed/5/800/700';
            process.stdout.write('  ⬇  hero-home-living.jpg (picsum) ... ');
            try {
                await downloadImage(url, 'hero-home-living.jpg');
                console.log('✓'); downloaded++;
            } catch (e) { console.log(`✗ ${e.message}`); }
        }

        console.log(`\n📋 Copied: ${copied} | ⬇ Downloaded: ${downloaded} | ✓ Already OK: ${alreadyOk}`);

        // Rebuild ALL product image arrays from disk
        console.log('\n🗄️  Rebuilding DB image arrays...');
        const { rows: products } = await client.query(`
            SELECT p.id, p.title, c.name as category_name
            FROM products p JOIN categories c ON p.category_id = c.id
        `);

        let dbUpdated = 0;
        for (const p of products) {
            const catSlug = p.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').slice(0, 40);
            const prodSlug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').slice(0, 40);
            const key = `${catSlug}-${prodSlug}`;
            const imageUrls = [];
            for (let i = 0; i < 3; i++) {
                const fp = path.join(UPLOADS_DIR, `${key}-${i}.jpg`);
                if (isValid(fp)) imageUrls.push(`/uploads/${key}-${i}.jpg`);
            }
            if (imageUrls.length > 0) {
                await client.query('UPDATE products SET image_url=$1, images=$2 WHERE id=$3',
                    [imageUrls[0], imageUrls, p.id]);
                dbUpdated++;
            }
        }

        const totalFiles = fs.readdirSync(UPLOADS_DIR).filter(f => f.endsWith('.jpg')).length;
        console.log(`✅ Updated ${dbUpdated} products in DB`);
        console.log(`📁 Total images in uploads/: ${totalFiles}`);
        console.log(`\n🎉 All done!\n`);

    } catch (err) {
        console.error('❌', err);
    } finally {
        client.release(); await pool.end();
    }
}

gapFill();
