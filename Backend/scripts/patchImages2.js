/**
 * MAISON — Targeted Image Patch v2
 * Downloads ONLY the specific missing image slots identified.
 * Run: node scripts/patchImages2.js
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
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const U = (id) => `https://images.unsplash.com/photo-${id}?w=600&h=800&fit=crop&auto=format&q=80`;

/**
 * MISSING SLOTS — only the gaps identified.
 * Format: filename → Unsplash photo ID to use.
 * Using entirely different IDs from the ones that already failed.
 */
const MISSING = {
    // Men's Fashion
    'men-s-fashion-formal-blazer-2.jpg': '1507679799987-c73779587ccf', // man in business suit
    'men-s-fashion-stretch-denim-jeans-0.jpg': '1542272604-789543d5f405', // denim jeans men
    'men-s-fashion-stretch-denim-jeans-1.jpg': '1604176354967-8d8b4e2b6e4a', // blue jeans fashion
    'men-s-fashion-stretch-denim-jeans-2.jpg': '1561052967-81310372f6e0', // slim jeans men
    'men-s-fashion-polo-t-shirt-0.jpg': '1598033129183-9d33d0d19866', // polo shirt man
    'men-s-fashion-polo-t-shirt-1.jpg': '1565084888279-aca607bb5d9d', // men casual polo
    'men-s-fashion-quilted-winter-jacket-0.jpg': '1613924823494-77fa1fc3a4d1', // men puffer jacket
    // Women's Fashion
    'women-s-fashion-high-waist-jeans-1.jpg': '1571513800374-df3e6b4b4cd9', // women jeans
    'women-s-fashion-silk-blouse-0.jpg': '1585386959984-a4155224a1ad', // women elegant top
    'women-s-fashion-silk-blouse-1.jpg': '1517940s01d30b-00', // fallback women blouse
    'women-s-fashion-embroidered-kurti-0.jpg': '1583391733956-4c0f8bd9e894', // ethnic women top
    'women-s-fashion-embroidered-kurti-1.jpg': '1554995207-c18c203602cb', // indian fashion
    'women-s-fashion-embroidered-kurti-2.jpg': '1610030017986-ba33c0dc7b3d', // kurti ethnic
    'women-s-fashion-pleated-midi-skirt-0.jpg': '1557764268-8fe9f2e5b4b1', // pleated midi skirt
    'women-s-fashion-off-shoulder-top-1.jpg': '1529635768000-78f7de8abf5c', // off shoulder women
    'women-s-fashion-off-shoulder-top-2.jpg': '1520367445093-50dc08a59d94', // fashion women top
    'women-s-fashion-anarkali-dress-0.jpg': '1583391733956-4c0f8bd9e894', // ethnic long dress
    'women-s-fashion-anarkali-dress-1.jpg': '1536243278027-2c3a5a94e4f6', // anarkali style
    'women-s-fashion-anarkali-dress-2.jpg': '1614886137166-7f5a26a9dff1', // indian gown
    'women-s-fashion-faux-leather-trousers-1.jpg': '1541099649105-f69ad21f3246', // leather pants women
    // Electronics
    'electronics-gaming-mouse-2.jpg': '1617042375876-a13e36732a04', // gaming mouse RGB
    'electronics-led-ring-light-0.jpg': '1636819488537-a9b1f3d1f93c', // ring light studio
    'electronics-led-ring-light-1.jpg': '1599305090598-fe41fc4cb03a', // streaming setup LED
    'electronics-smart-home-speaker-2.jpg': '1558089687-f282ffcbc126', // smart speaker home
    // Sports
    'sports-resistance-bands-set-0.jpg': '1598575468023-529e0d3f3a39', // resistance bands
    'sports-resistance-bands-set-2.jpg': '1574680178050-55c6a6a96e0a', // workout bands
    'sports-men-s-running-shoes-1.jpg': '1606890737304-57a1ca8a9f87', // running shoes sport
    'sports-insulated-sports-bottle-0.jpg': '1610631066894-62452d3dba38', // sports water bottle
    'sports-insulated-sports-bottle-1.jpg': '1621506016127-e651230eb24b', // gym flask bottle
    'sports-gym-duffel-bag-2.jpg': '1553062407-98eeb64c6a62', // sports duffel bag
    'sports-adjustable-dumbbells-2.jpg': '1583454122895-dead3d4dfab8', // dumbbells gym
    'sports-foam-roller-0.jpg': '1599058917727-71c401d16e54', // foam roller
    'sports-speed-jump-rope-2.jpg': '1552196563-55cd4e45efb3', // jump rope
    'sports-fitness-tracker-band-0.jpg': '1575311373937-040b8058ff62', // fitness band
    'sports-fitness-tracker-band-1.jpg': '1524741978410-350ba91a70f0', // smart band
    'sports-fitness-tracker-band-2.jpg': '1579126038374-dc7e8c2ba2ed', // health tracker
    'sports-sports-grip-gloves-0.jpg': '1583454122895-dead3d4dfab8', // gym gloves
    // Home & Living
    'home-living-wooden-photo-frame-0.jpg': '1582053433976-25c00369eb73', // photo frames
    'home-living-wooden-photo-frame-2.jpg': '1513519245088-0e12902e5a38', // wooden frames home
    'home-living-linen-cushion-covers-0.jpg': '1555041469-2d7c0ca2ad15', // cushion pillows sofa
    'home-living-ceramic-table-lamp-0.jpg': '1513694203232-719a280e022f', // lamp home
};

// Fallback IDs — well-known working Unsplash photos as last resort
const FALLBACKS = {
    fashion: '1521572163474-6864f9cf17ab',
    women: '1496747611176-843222e1e57c',
    kids: '1503454537195-1dcabb73ffb9',
    home: '1555041469-2d7c0ca2ad15',
    beauty: '1556228453-efd6c1ff04f6',
    electronics: '1526374965328-7f61d4dc18c5',
    sports: '1517836357463-d25dfeac3438',
};

function getFallback(filename) {
    if (filename.startsWith('women')) return FALLBACKS.women;
    if (filename.startsWith('kids')) return FALLBACKS.kids;
    if (filename.startsWith('home')) return FALLBACKS.home;
    if (filename.startsWith('beauty')) return FALLBACKS.beauty;
    if (filename.startsWith('electronics')) return FALLBACKS.electronics;
    if (filename.startsWith('sports')) return FALLBACKS.sports;
    return FALLBACKS.fashion;
}

async function patch() {
    const client = await pool.connect();
    try {
        console.log('\n🔧 MAISON — Targeted Image Patch v2\n');

        let downloaded = 0; let failed = 0;
        for (const [filename, photoId] of Object.entries(MISSING)) {
            const filePath = path.join(UPLOADS_DIR, filename);
            if (fs.existsSync(filePath) && fs.statSync(filePath).size > 10000) {
                console.log(`  ✓ Already exists: ${filename}`);
                continue;
            }
            const url = U(photoId);
            process.stdout.write(`  ⬇  ${filename} ... `);
            try {
                await downloadImage(url, filename);
                console.log('✓');
                downloaded++;
            } catch (err) {
                // Use fallback
                const fbId = getFallback(filename);
                try {
                    await downloadImage(U(fbId), filename);
                    console.log(`✓ (fallback)`);
                    downloaded++;
                } catch (err2) {
                    console.log(`✗ (${err2.message})`);
                    failed++;
                }
            }
            await sleep(300);
        }

        console.log(`\n📥 Downloaded: ${downloaded}, Failed: ${failed}`);

        // Now rebuild DB images arrays for all products
        console.log('\n🗄️  Updating database image arrays...');
        const { rows: products } = await client.query(`
            SELECT p.id, p.title, c.name as category_name
            FROM products p JOIN categories c ON p.category_id = c.id
        `);

        let updated = 0;
        for (const p of products) {
            const catSlug = p.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').slice(0, 40);
            const prodSlug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').slice(0, 40);
            const key = `${catSlug}-${prodSlug}`;

            const imageUrls = [];
            for (let i = 0; i < 3; i++) {
                const f = `${key}-${i}.jpg`;
                const fp = path.join(UPLOADS_DIR, f);
                if (fs.existsSync(fp) && fs.statSync(fp).size > 10000) {
                    imageUrls.push(`/uploads/${f}`);
                }
            }
            if (imageUrls.length > 0) {
                await client.query(
                    'UPDATE products SET image_url=$1, images=$2 WHERE id=$3',
                    [imageUrls[0], imageUrls, p.id]
                );
                updated++;
            }
        }
        console.log(`✅ Updated ${updated} product records in DB\n`);

    } catch (err) {
        console.error('❌ FAILED:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

patch();
