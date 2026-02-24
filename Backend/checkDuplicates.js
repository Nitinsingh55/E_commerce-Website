const fs = require('fs');
const path = require('path');
const https = require('https');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const files = fs.readdirSync(UPLOADS_DIR).filter(f => f.endsWith('.jpg'));

const sizeMap = new Map();
files.forEach(f => {
    const stat = fs.statSync(path.join(UPLOADS_DIR, f));
    if (!sizeMap.has(stat.size)) sizeMap.set(stat.size, []);
    sizeMap.get(stat.size).push(f);
});

console.log("Duplicate sizes (likely fallbacks):");
for (const [size, fList] of sizeMap.entries()) {
    if (fList.length > 3) {
        console.log(`Size ${size} used by ${fList.length} files. Example: ${fList[0]}`);
    }
}
