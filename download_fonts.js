const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, 'public', 'fonts');
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

const url = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap';

function get(url, headers = {}) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', err => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function start() {
    console.log('Fetching Google Fonts CSS...');
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const cssText = await get(url, { 'User-Agent': userAgent });
    
    const regex = /\/\*\s*latin\s*\*\/[\s\S]*?@font-face\s*\{([\s\S]*?)\}/g;
    let match;
    let localRules = [];
    let downloadPromises = [];
    let processedKeys = new Set();
    
    while ((match = regex.exec(cssText)) !== null) {
        const body = match[1];
        
        const familyMatch = body.match(/font-family:\s*['"]?([^'"]+)['"]?/);
        const weightMatch = body.match(/font-weight:\s*(\d+)/);
        const styleMatch = body.match(/font-style:\s*([a-z]+)/);
        const srcMatch = body.match(/src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^\)]+)\)/);
        
        if (familyMatch && weightMatch && styleMatch && srcMatch) {
            const family = familyMatch[1];
            const weight = weightMatch[1];
            const style = styleMatch[1];
            const remoteUrl = srcMatch[1];
            
            const key = `${family}-${weight}-${style}`;
            if (processedKeys.has(key)) continue;
            processedKeys.add(key);

            const localName = `${family.toLowerCase().replace(/\s+/g, '-')}-${weight}-${style}.woff2`;
            const localPath = path.join(fontsDir, localName);
            
            console.log(`Queueing download: ${localName} from ${remoteUrl}`);
            downloadPromises.push(
                downloadFile(remoteUrl, localPath).then(() => {
                    console.log(`Downloaded: ${localName}`);
                }).catch(err => {
                    console.error(`Error downloading ${localName}:`, err.message);
                })
            );
            
            localRules.push(`@font-face {
  font-family: '${family}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: optional;
  src: url('/fonts/${localName}') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}`);
        }
    }
    
    await Promise.all(downloadPromises);
    
    // Write local font rules to a fonts.css file
    const localCssContent = localRules.join('\n\n');
    const localCssPath = path.join(__dirname, 'public', 'fonts.css');
    fs.writeFileSync(localCssPath, localCssContent, 'utf8');
    console.log('Created public/fonts.css');

    // Prepend to public/style.css (removing any previous local font prepends to avoid duplicates)
    const styleCssPath = path.join(__dirname, 'public', 'style.css');
    if (fs.existsSync(styleCssPath)) {
        let originalStyle = fs.readFileSync(styleCssPath, 'utf8');
        
        // Remove any old @font-face blocks to avoid stacking them
        originalStyle = originalStyle.replace(/@font-face\s*\{[\s\S]*?font-display:\s*optional;[\s\S]*?\}/g, '');
        originalStyle = originalStyle.trim();

        fs.writeFileSync(styleCssPath, localCssContent + '\n\n' + originalStyle, 'utf8');
        console.log('Prepended font rules to public/style.css');
    }
}

start().catch(console.error);
