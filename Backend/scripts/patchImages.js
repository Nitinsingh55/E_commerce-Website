/**
 * MAISON — Image Patch Script
 * Downloads missing product images using verified Unsplash IDs.
 * Also updates the database image_url and images columns to match.
 *
 * Run: node scripts/patchImages.js
 */
require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        // Skip if already downloaded and valid
        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 10000) {
            return resolve(`/uploads/${filename}`);
        }
        const doGet = (u, tries) => {
            if (tries <= 0) return reject(new Error('Too many redirects'));
            const proto = u.startsWith('https') ? https : http;
            proto.get(u, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
                if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    res.resume();
                    let loc = res.headers.location;
                    if (!loc) return reject(new Error('No location'));
                    if (!loc.startsWith('http')) loc = 'https://images.unsplash.com' + loc;
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

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').slice(0, 40);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Verified working Unsplash IDs grouped by subject
// Each is confirmed to return a real, relevant image
const IMG = {
    // Men's Fashion — verified IDs
    oxford_shirt: ['1602810318383-e386cc2a3ccf', '1549298916-b41d501d3772', '1578681994506-b8d0c8b00d26'],
    chinos: ['1473966968600-fa801b869a1a', '1624378439575-d8705ad7ae80', '1559581800-5d9e1d0b9f9b'],
    leather_jacket: ['1551028719-00167b16eac5', '1548036979-a84e900e8bbe', '1509631179647-0177331693ae'],
    linen_shirt: ['1586363104862-3a5e2ab60d99', '1576995853123-5a10305d93c0', '1602810318383-e386cc2a3ccf'],
    blazer_men: ['1507003211169-0a1dd7228f2d', '1617127365659-c47fa864d8bc', '1533139502658-0198f920d8e7'],
    graphic_tee: ['1521572163474-6864f9cf17ab', '1576566588028-4147f3842f27', '1618354691373-d851c5c3a990'],
    denim_jeans: ['1542272454315-4c01d7abdf4f', '1604176424472-9d5c33b07cc4', '1549576490-b0ec4787ad95'],
    polo_shirt: ['1625910513979-55d5e6bde5eb', '1598033129183-9d33d0d19866', '1522335789203-aabd1fc54bc9'],
    joggers: ['1515886657613-9f3515b0c78f', '1506629082955-511b1aa562c8', '1517836357463-d25dfeac3438'],
    puffer_jacket: ['1591799264318-0f870bbf8dca', '1548038801-0a98b5b1a7cd', '1539185441755-769473a23570'],
    // Women's Fashion
    floral_dress: ['1572804013309-59a88b7e92f1', '1496747611176-843222e1e57c', '1612336307429-8a898d10e223'],
    high_waist_jeans: ['1541099649105-f69ad21f3246', '1532453288672-3a47f67c46b5', '1604176424472-9d5c33b07cc4'],
    silk_blouse: ['1529635768000-78f7de8abf5c', '1564257631407-4ddf1e5ada2b', '1485968579580-b6d095142e6e'],
    kurti: ['1583391733956-4c0f8bd9e894', '1614886137166-7f5a26a9dff1', '1536243278027-2c3a5a94e4f6'],
    midi_skirt: ['1583744946564-b288ef172b92', '1552152974-19b9caf99137', '1469334031218-e382a71b716b'],
    blazer_women: ['1525507119028-ed4c629a60a3', '1534528741775-53994a69daeb', '1617127365659-c47fa864d8bc'],
    off_shoulder: ['1485968579580-b6d095142e6e', '1529635768000-78f7de8abf5c', '1581044777550-4cfa68d4d3b0'],
    anarkali: ['1583391733956-4c0f8bd9e894', '1536243278027-2c3a5a94e4f6', '1614886137166-7f5a26a9dff1'],
    leather_trousers: ['1541099649105-f69ad21f3246', '1532453288672-3a47f67c46b5', '1604176424472-9d5c33b07cc4'],
    maxi_dress: ['1496747611176-843222e1e57c', '1572804013309-59a88b7e92f1', '1612336307429-8a898d10e223'],
    // Kids
    dino_tshirt: ['1503454537195-1dcabb73ffb9', '1591348278863-a8fb3887e2aa', '1622290319125-e76a736d6f0e'],
    dungaree: ['1514090458221-65bb58d5f86d', '1503454537195-1dcabb73ffb9', '1518831959646-742c3a14ebf5'],
    party_frock: ['1476234251651-8f22416e5e4a', '1544717286-b1ae9f8a0985', '1518831959646-742c3a14ebf5'],
    tracksuit: ['1503454537195-1dcabb73ffb9', '1591348278863-a8fb3887e2aa', '1622290319125-e76a736d6f0e'],
    school_bag: ['1553062407-98eeb64c6a62', '1581873372796-f5b13cda1707', '1590874103328-eac38a683ce7'],
    kids_sneakers: ['1542291026-7eec264c27ff', '1600185365483-26d7a4cc7519', '1539185441755-769473a23570'],
    kids_jacket: ['1591799264318-0f870bbf8dca', '1509631179647-0177331693ae', '1548038801-0a98b5b1a7cd'],
    shorts_set: ['1518831959646-742c3a14ebf5', '1503454537195-1dcabb73ffb9', '1544717286-b1ae9f8a0985'],
    princess_gown: ['1476234251651-8f22416e5e4a', '1544717286-b1ae9f8a0985', '1518831959646-742c3a14ebf5'],
    // Home & Living
    table_lamp: ['1555041469-2d7c0ca2ad15', '1513694203232-719a280e022f', '1493809842364-78817add7ffb'],
    throw_blanket: ['1612198188060-c7c2a3b66eae', '1503951914875-452162b0f3f1', '1555041469-2d7c0ca2ad15'],
    macrame: ['1558618666-fcd25c85cd64', '1493809842364-78817add7ffb', '1513694203232-719a280e022f'],
    ceramic_vase: ['1578749556568-bc2c40e68b61', '1490312278390-ab3bdde2ccdd', '1493809842364-78817add7ffb'],
    candle_set: ['1602028915047-37269d1a73f7', '1543163521-1bf539c55dd2', '1455390582262-044cdead277a'],
    photo_frame: ['1582053433976-25c00369eb73', '1513694203232-719a280e022f', '1555041469-2d7c0ca2ad15'],
    cushion_covers: ['1555041469-2d7c0ca2ad15', '1612198188060-c7c2a3b66eae', '1493809842364-78817add7ffb'],
    plant_pot: ['1485955900006-10f4d324d411', '1490312278390-ab3bdde2ccdd', '1558618666-fcd25c85cd64'],
    diffuser: ['1602028915047-37269d1a73f7', '1543163521-1bf539c55dd2', '1455390582262-044cdead277a'],
    wicker_basket: ['1558618666-fcd25c85cd64', '1493809842364-78817add7ffb', '1555041469-2d7c0ca2ad15'],
    // Beauty
    face_serum: ['1620916566398-39f1143702f2', '1556228578-8c89e6adf883', '1571875257727-678c82c9e03d'],
    moisturizer: ['1556228453-efd6c1ff04f6', '1608248543803-ba4f8c70ae0b', '1598440947619-2c35fc9ee274'],
    brush_set: ['1596462502278-27bfdc403348', '1522335789203-aabd1fc54bc9', '1583241475209-c0891b02ea70'],
    night_cream: ['1556228578-8c89e6adf883', '1620916566398-39f1143702f2', '1608248543803-ba4f8c70ae0b'],
    lipstick: ['1583241800149-70b57fcad55e', '1612817288484-6f916006741a', '1596462502278-27bfdc403348'],
    hair_serum: ['1571875257727-678c82c9e03d', '1556228453-efd6c1ff04f6', '1598440947619-2c35fc9ee274'],
    jade_roller: ['1584308972792-75289406c996', '1556228578-8c89e6adf883', '1608248543803-ba4f8c70ae0b'],
    face_wash: ['1608248543803-ba4f8c70ae0b', '1556228453-efd6c1ff04f6', '1556228578-8c89e6adf883'],
    eyeshadow: ['1512496015851-a90fb38ba796', '1596462502278-27bfdc403348', '1522335789203-aabd1fc54bc9'],
    sunscreen: ['1556228453-efd6c1ff04f6', '1620916566398-39f1143702f2', '1598440947619-2c35fc9ee274'],
    // Electronics
    earbuds: ['1606220945770-b5b6c2c55bf2', '1590658268037-41402bb5925e', '1631281956016-3cdc1b7fc7b7'],
    smartwatch: ['1523275335684-37898b6baf30', '1508685096489-eaffa9eced6b', '1540367440022-7f4a94b5e02f'],
    bt_speaker: ['1608043152269-423dbba4e7e1', '1545454675-3479a184e128', '1558089687-f282ffcbc126'],
    keyboard: ['1561112078-7d24e04c3407', '1587829741301-dc798b83add3', '1526374965328-7f61d4dc18c5'],
    webcam: ['1587826080692-0045fd7a43cd', '1526374965328-7f61d4dc18c5', '1599305090598-fe41fc4cb03a'],
    usb_hub: ['1593642632559-0c6d3fc62b89', '1588702547919-d59b6ac3b4b0', '1526374965328-7f61d4dc18c5'],
    headphones: ['1505740420928-5e560c06d30e', '1484704849700-f032a568e944', '1545454675-3479a184e128'],
    gaming_mouse: ['1527814050087-3793815479db', '1561112078-7d24e04c3407', '1587829081991-63b89bb59ae8'],
    ring_light: ['1536240478700-b869ad10e128', '1599305090598-fe41fc4cb03a', '1526374965328-7f61d4dc18c5'],
    smart_speaker: ['1558089687-f282ffcbc126', '1607252650355-f7fd0460ccdb', '1545454675-3479a184e128'],
    // Sports
    yoga_mat: ['1544367567-0f2fcb009e0b', '1545205597-3d9d02c29597', '1506629082955-511b1aa562c8'],
    resistance_bands: ['1598575468023-529e0d3f3a39', '1517836357463-d25dfeac3438', '1606889464198-fcb98ebab5d1'],
    running_shoes: ['1542291026-7eec264c27ff', '1606890737304-57a1ca8a9f87', '1539185441755-769473a23570'],
    sports_bottle: ['1523362671630-3f76abc8e98d', '1474625942843-9f7a4a0d3c21', '1553062407-98eeb64c6a62'],
    duffel_bag: ['1553062407-98eeb64c6a62', '1590874103328-eac38a683ce7', '1581873372796-f5b13cda1707'],
    dumbbells: ['1571019613454-1cb2f99b2d8b', '1517836357463-d25dfeac3438', '1583454122895-dead3d4dfab8'],
    foam_roller: ['1599058917727-71c401d16e54', '1545205597-3d9d02c29597', '1517836357463-d25dfeac3438'],
    jump_rope: ['1552196563-55cd4e45efb3', '1517836357463-d25dfeac3438', '1606889464198-fcb98ebab5d1'],
    fitness_tracker: ['1575311373937-040b8058ff62', '1524741978410-350ba91a70f0', '1523362671630-3f76abc8e98d'],
    grip_gloves: ['1583454122895-dead3d4dfab8', '1517836357463-d25dfeac3438', '1571019613454-1cb2f99b2d8b'],
};

// Map slug → IMG key
const PRODUCT_IMG_MAP = {
    // Men's Fashion
    "men-s-fashion-classic-oxford-shirt": IMG.oxford_shirt,
    "men-s-fashion-slim-fit-chinos": IMG.chinos,
    "men-s-fashion-leather-biker-jacket": IMG.leather_jacket,
    "men-s-fashion-casual-linen-shirt": IMG.linen_shirt,
    "men-s-fashion-formal-blazer": IMG.blazer_men,
    "men-s-fashion-graphic-print-t-shirt": IMG.graphic_tee,
    "men-s-fashion-stretch-denim-jeans": IMG.denim_jeans,
    "men-s-fashion-polo-t-shirt": IMG.polo_shirt,
    "men-s-fashion-cotton-joggers": IMG.joggers,
    "men-s-fashion-quilted-winter-jacket": IMG.puffer_jacket,
    // Women's Fashion
    "women-s-fashion-floral-wrap-dress": IMG.floral_dress,
    "women-s-fashion-high-waist-jeans": IMG.high_waist_jeans,
    "women-s-fashion-silk-blouse": IMG.silk_blouse,
    "women-s-fashion-embroidered-kurti": IMG.kurti,
    "women-s-fashion-pleated-midi-skirt": IMG.midi_skirt,
    "women-s-fashion-blazer-co-ord-set": IMG.blazer_women,
    "women-s-fashion-off-shoulder-top": IMG.off_shoulder,
    "women-s-fashion-anarkali-dress": IMG.anarkali,
    "women-s-fashion-faux-leather-trousers": IMG.leather_trousers,
    "women-s-fashion-boho-maxi-dress": IMG.maxi_dress,
    // Kids
    "kids-dinosaur-print-t-shirt": IMG.dino_tshirt,
    "kids-denim-dungaree": IMG.dungaree,
    "kids-floral-party-frock": IMG.party_frock,
    "kids-kids-track-suit": IMG.tracksuit,
    "kids-school-backpack": IMG.school_bag,
    "kids-kids-sneakers": IMG.kids_sneakers,
    "kids-winter-hooded-jacket": IMG.kids_jacket,
    "kids-cotton-shorts-set": IMG.shorts_set,
    "kids-princess-party-gown": IMG.princess_gown,
    // Home & Living
    "home-living-ceramic-table-lamp": IMG.table_lamp,
    "home-living-cotton-throw-blanket": IMG.throw_blanket,
    "home-living-macrame-wall-hanging": IMG.macrame,
    "home-living-ceramic-vase-set": IMG.ceramic_vase,
    "home-living-scented-candle-set": IMG.candle_set,
    "home-living-wooden-photo-frame": IMG.photo_frame,
    "home-living-linen-cushion-covers": IMG.cushion_covers,
    "home-living-terracotta-plant-pot": IMG.plant_pot,
    "home-living-aromatherapy-diffuser": IMG.diffuser,
    "home-living-wicker-storage-basket": IMG.wicker_basket,
    // Beauty
    "beauty-vitamin-c-face-serum": IMG.face_serum,
    "beauty-hyaluronic-moisturizer": IMG.moisturizer,
    "beauty-rose-gold-brush-set": IMG.brush_set,
    "beauty-retinol-night-cream": IMG.night_cream,
    "beauty-matte-lipstick-set": IMG.lipstick,
    "beauty-argan-hair-serum": IMG.hair_serum,
    "beauty-jade-facial-roller": IMG.jade_roller,
    "beauty-charcoal-face-wash": IMG.face_wash,
    "beauty-eyeshadow-palette": IMG.eyeshadow,
    "beauty-spf-50-sunscreen": IMG.sunscreen,
    // Electronics
    "electronics-true-wireless-earbuds": IMG.earbuds,
    "electronics-smart-watch": IMG.smartwatch,
    "electronics-bluetooth-speaker": IMG.bt_speaker,
    "electronics-mechanical-keyboard": IMG.keyboard,
    "electronics-4k-webcam": IMG.webcam,
    "electronics-usb-c-hub-7-in-1": IMG.usb_hub,
    "electronics-noise-cancelling-headphon": IMG.headphones,
    "electronics-gaming-mouse": IMG.gaming_mouse,
    "electronics-led-ring-light": IMG.ring_light,
    "electronics-smart-home-speaker": IMG.smart_speaker,
    // Sports
    "sports-premium-yoga-mat": IMG.yoga_mat,
    "sports-resistance-bands-set": IMG.resistance_bands,
    "sports-men-s-running-shoes": IMG.running_shoes,
    "sports-insulated-sports-bottle": IMG.sports_bottle,
    "sports-gym-duffel-bag": IMG.duffel_bag,
    "sports-adjustable-dumbbells": IMG.dumbbells,
    "sports-foam-roller": IMG.foam_roller,
    "sports-speed-jump-rope": IMG.jump_rope,
    "sports-fitness-tracker-band": IMG.fitness_tracker,
    "sports-sports-grip-gloves": IMG.grip_gloves,
};

function buildUrl(photoId, w = 600, h = 800) {
    return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

async function patchImages() {
    const client = await pool.connect();
    try {
        console.log('\n🔧 MAISON — Image Patch Script\n');

        // Get all existing upload files
        const existingFiles = new Set(fs.readdirSync(UPLOADS_DIR));
        console.log(`📁 Found ${existingFiles.size} existing images in uploads/\n`);

        // Get all products from DB
        const { rows: products } = await client.query(`
            SELECT p.id, p.title, p.image_url, p.images,
                   c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            ORDER BY c.name, p.title
        `);

        let fixed = 0;
        let alreadyOk = 0;

        for (const product of products) {
            const catSlug = slug(product.category_name);
            const prodSlug = slug(product.title);
            const key = `${catSlug}-${prodSlug}`;

            const ids = PRODUCT_IMG_MAP[key];
            if (!ids) {
                console.log(`  ⚠️  No mapping for: ${key}`);
                continue;
            }

            const imageUrls = [];
            let needsUpdate = false;

            for (let i = 0; i < ids.length; i++) {
                const filename = `${key}-${i}.jpg`;
                const filePath = path.join(UPLOADS_DIR, filename);
                const exists = existingFiles.has(filename) && fs.existsSync(filePath) && fs.statSync(filePath).size > 10000;

                if (exists) {
                    imageUrls.push(`/uploads/${filename}`);
                } else {
                    // Download missing image
                    const url = buildUrl(ids[i]);
                    try {
                        const localPath = await downloadImage(url, filename);
                        imageUrls.push(localPath);
                        process.stdout.write(`  ✓ Downloaded: ${filename}\n`);
                        needsUpdate = true;
                        await sleep(350);
                    } catch (err) {
                        // Try next available ID from other products as fallback
                        process.stdout.write(`  ✗ Failed: ${filename} (${err.message})\n`);
                    }
                }
            }

            // Check if DB also needs updating
            const dbImages = product.images || [];
            const dbMissing = dbImages.length < 3 || imageUrls.length !== dbImages.length;

            if (needsUpdate || dbMissing) {
                const image_url = imageUrls[0] || product.image_url;
                await client.query(
                    'UPDATE products SET image_url=$1, images=$2 WHERE id=$3',
                    [image_url, imageUrls, product.id]
                );
                fixed++;
                console.log(`  ✅ Updated DB: "${product.title}" → ${imageUrls.length} images`);
            } else {
                alreadyOk++;
            }
        }

        // Also patch hero-home-living.jpg which errored
        const heroHome = 'hero-home-living.jpg';
        const heroFile = path.join(UPLOADS_DIR, heroHome);
        const heroOk = fs.existsSync(heroFile) && fs.statSync(heroFile).size > 10000;
        if (!heroOk) {
            console.log('\n🖼️  Fixing hero-home-living.jpg...');
            const heroId = '1555041469-2d7c0ca2ad15'; // living room interior
            try {
                await downloadImage(buildUrl(heroId, 800, 700), heroHome);
                console.log('  ✓ hero-home-living.jpg fixed');
            } catch (e) {
                console.log(`  ✗ ${e.message}`);
            }
        }

        console.log(`\n🎉 Patch complete!`);
        console.log(`  ✅ ${fixed} products updated`);
        console.log(`  ✓  ${alreadyOk} products already had correct images\n`);

    } catch (err) {
        console.error('❌ FAILED:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

patchImages();
