require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const HERO_IMAGES = [
    { name: 'hero-womens-fashion.jpg', id: '1469334031218-e382a71b716b', w: 800, h: 700 },
    { name: 'hero-electronics.jpg', id: '1518770660439-4636190af475', w: 800, h: 700 },
    { name: 'hero-home-living.jpg', id: '1555041469-2d7c0ca2ad15', w: 800, h: 700 },
    { name: 'hero-sports.jpg', id: '1517836357463-d25dfeac3438', w: 800, h: 700 },
];

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const file = fs.createWriteStream(filePath);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                let loc = res.headers.location;
                if (!loc.startsWith('http')) loc = 'https://images.unsplash.com' + loc;
                https.get(loc, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
                    res2.pipe(file);
                    file.on('finish', () => { file.close(); resolve(); });
                }).on('error', reject);
            } else {
                res.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            }
        }).on('error', reject);
    });
}

(async () => {
    console.log('Downloading hero images...');
    for (const hero of HERO_IMAGES) {
        const url = `https://images.unsplash.com/photo-${hero.id}?w=${hero.w}&h=${hero.h}&fit=crop&auto=format&q=80`;
        try {
            await downloadImage(url, hero.name);
            console.log(`✓ ${hero.name}`);
        } catch (e) {
            console.error(`✗ ${hero.name}`, e);
        }
    }
    console.log('Done.');
})();
