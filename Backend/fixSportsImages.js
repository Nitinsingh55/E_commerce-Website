const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, 'uploads');

const targets = [
    { file: 'sports-sports-grip-gloves-0.jpg', id: '1583454122895-dead3d4dfab8', text: 'Grip+Gloves' },
    { file: 'sports-fitness-tracker-band-0.jpg', id: '1575311373937-040b8058ff62', text: 'Fitness+Tracker' },
    { file: 'sports-foam-roller-0.jpg', id: '1599058917727-71c401d16e54', text: 'Foam+Roller' }
];

function download(url, filePath) {
    return new Promise((resolve, reject) => {
        console.log('Downloading', url, 'to', filePath);
        const proto = url.startsWith('https') ? https : http;
        proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                let loc = res.headers.location;
                if (!loc.startsWith('http')) loc = 'https://images.unsplash.com' + loc;
                return download(loc, filePath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error('Status ' + res.statusCode));
            }
            const file = fs.createWriteStream(filePath);
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
    });
}

async function run() {
    for (const t of targets) {
        const filePath = path.join(UPLOADS_DIR, t.file);
        try {
            const url = `https://images.unsplash.com/photo-${t.id}?w=600&h=800&fit=crop&auto=format&q=80`;
            await download(url, filePath);
            console.log('Success Unsplash for', t.file);
        } catch (e) {
            console.log('Unsplash failed, using placeholder for', t.file, e.message);
            const fallbackUrl = `https://placehold.co/600x800/1e293b/ffffff/jpeg?text=${t.text}`;
            await download(fallbackUrl, filePath);
            console.log('Success Placeholder for', t.file);
        }
    }
}

run();
