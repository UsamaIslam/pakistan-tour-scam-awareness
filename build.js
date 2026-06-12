const fs = require('fs');
const path = require('path');

const SRC_DIR = __dirname;
const DEST_DIR = '/var/www/tour-scam-website';

function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ')             // Collapse spaces
        .replace(/\s*([{};:])\s*/g, '$1') // Clean around braces, colons, semi-colons
        .replace(/;}/g, '}')             // Remove trailing semi-colons
        .trim();
}

function minifyJS(js) {
    return js
        .replace(/\/\*[\s\S]*?\*\//g, '') // Strip block comments
        .replace(/(^|[\s;])\/\/[^\n]*/g, '$1') // Strip line comments
        .replace(/\s+/g, ' ')             // Collapse whitespace
        .trim();
}

function copyFolderSync(from, to, minifiedCSS) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);

        if (fs.lstatSync(fromPath).isDirectory()) {
            if (element !== 'node_modules') {
                copyFolderSync(fromPath, toPath, minifiedCSS);
            }
        } else {
            const ext = path.extname(element);
            if (ext === '.html') {
                console.log(`Inlining CSS into HTML: ${element}`);
                let content = fs.readFileSync(fromPath, 'utf8');
                // Replace stylesheet link and preload link with inline stylesheet tag
                content = content.replace(
                    /<link rel="preload" href="style\.css" as="style">\s*<link rel="stylesheet" href="style\.css">/,
                    `<style>${minifiedCSS}</style>`
                );
                fs.writeFileSync(toPath, content, 'utf8');
            } else if (ext === '.css') {
                console.log(`Minifying CSS asset: ${element}`);
                const content = fs.readFileSync(fromPath, 'utf8');
                fs.writeFileSync(toPath, minifyCSS(content), 'utf8');
            } else if (ext === '.js' && element !== 'build.js') {
                console.log(`Minifying JS: ${element}`);
                const content = fs.readFileSync(fromPath, 'utf8');
                fs.writeFileSync(toPath, minifyJS(content), 'utf8');
            } else {
                // Copy directly
                fs.copyFileSync(fromPath, toPath);
            }
        }
    });
}

function main() {
    console.log('Starting deployment build with CSS inlining...');
    
    // Read and minify style.css
    const cssPath = path.join(SRC_DIR, 'public', 'style.css');
    let minifiedCSS = '';
    if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        minifiedCSS = minifyCSS(cssContent);
        console.log(`Successfully prepared minified CSS (${Buffer.byteLength(minifiedCSS)} bytes)`);
    } else {
        console.warn('Warning: style.css not found, skipping inline compilation.');
    }

    // Copy public directory with inlining
    const srcPublic = path.join(SRC_DIR, 'public');
    const destPublic = path.join(DEST_DIR, 'public');
    copyFolderSync(srcPublic, destPublic, minifiedCSS);

    // Copy server files
    const serverFiles = ['server.js', 'package.json', 'package-lock.json'];
    serverFiles.forEach(file => {
        const fromPath = path.join(SRC_DIR, file);
        const toPath = path.join(DEST_DIR, file);
        if (fs.existsSync(fromPath)) {
            console.log(`Copying server asset: ${file}`);
            fs.copyFileSync(fromPath, toPath);
        }
    });

    console.log('Build and deployment complete.');
}

main();
