/**
 * Build script for FinCalc Desktop App
 * Copies web files and prepares for Electron packaging
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..');
const WEB_DIR = path.join(__dirname, 'web');

// Files and folders to copy
const COPY_LIST = [
    'index.html',
    'privacy.html',
    'terms.html',
    'favicon.svg',
    'css',
    'js',
    'calculators'
];

// Files to exclude
const EXCLUDE = [
    '.git',
    'node_modules',
    'desktop-app',
    'blog',
    'includes',
    'ads.txt',
    'robots.txt',
    'sitemap.xml',
    'wrangler.jsonc',
    '.claude'
];

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    
    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const files = fs.readdirSync(src);
        for (const file of files) {
            if (EXCLUDE.includes(file) || file.startsWith('tmpclaude')) continue;
            copyRecursive(path.join(src, file), path.join(dest, file));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

function modifyForDesktop(filePath) {
    if (!filePath.endsWith('.html')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove Google Analytics
    content = content.replace(/<script async src="https:\/\/www\.googletagmanager\.com[^<]*<\/script>/g, '');
    content = content.replace(/<script>[^<]*gtag[^<]*<\/script>/g, '');
    
    // Remove AdSense
    content = content.replace(/<script async src="https:\/\/pagead2\.googlesyndication\.com[^<]*<\/script>/g, '');
    
    // Remove HTTPS redirect
    content = content.replace(/<script>if\(location\.protocol[^<]*<\/script>/g, '');
    
    // Add desktop app indicator
    content = content.replace('</head>', `
    <script>window.IS_DESKTOP_APP = true;</script>
</head>`);
    
    fs.writeFileSync(filePath, content);
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.html')) {
            modifyForDesktop(filePath);
            console.log(`  Modified: ${filePath}`);
        }
    }
}

// Main build process
console.log('Building FinCalc Desktop App...\n');

// Clean web directory
if (fs.existsSync(WEB_DIR)) {
    fs.rmSync(WEB_DIR, { recursive: true });
}
fs.mkdirSync(WEB_DIR, { recursive: true });

// Copy files
console.log('Copying web files...');
for (const item of COPY_LIST) {
    const src = path.join(SOURCE_DIR, item);
    const dest = path.join(WEB_DIR, item);
    
    if (fs.existsSync(src)) {
        copyRecursive(src, dest);
        console.log(`  Copied: ${item}`);
    }
}

// Modify HTML files for desktop
console.log('\nModifying HTML files for desktop...');
processDirectory(WEB_DIR);

// Create icons directory
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

console.log('\n✅ Build complete!');
console.log('\nNext steps:');
console.log('1. Add app icons to desktop-app/icons/');
console.log('2. Run: npm install');
console.log('3. Run: npm run build:win (or build:mac, build:linux)');
