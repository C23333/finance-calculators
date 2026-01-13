/**
 * Build script for FinCalc Mobile App
 * Copies web files and prepares for Capacitor
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..');
const WWW_DIR = path.join(__dirname, 'www');

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
    'mobile-app',
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

function modifyForMobile(filePath) {
    if (!filePath.endsWith('.html')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove Google Analytics
    content = content.replace(/<script async src="https:\/\/www\.googletagmanager\.com[^<]*<\/script>/g, '');
    content = content.replace(/<script>[^<]*gtag[^<]*<\/script>/g, '');
    
    // Remove AdSense
    content = content.replace(/<script async src="https:\/\/pagead2\.googlesyndication\.com[^<]*<\/script>/g, '');
    
    // Remove HTTPS redirect
    content = content.replace(/<script>if\(location\.protocol[^<]*<\/script>/g, '');
    
    // Add mobile app indicator and viewport meta
    content = content.replace('</head>', `
    <script>window.IS_MOBILE_APP = true;</script>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
</head>`);
    
    // Remove download section script (not needed in app)
    content = content.replace(/<script src="js\/payhip\.js"[^>]*><\/script>/g, '');
    
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
            modifyForMobile(filePath);
            console.log(`  Modified: ${filePath}`);
        }
    }
}

// Main build process
console.log('Building FinCalc Mobile App...\n');

// Clean www directory
if (fs.existsSync(WWW_DIR)) {
    fs.rmSync(WWW_DIR, { recursive: true });
}
fs.mkdirSync(WWW_DIR, { recursive: true });

// Copy files
console.log('Copying web files...');
for (const item of COPY_LIST) {
    const src = path.join(SOURCE_DIR, item);
    const dest = path.join(WWW_DIR, item);
    
    if (fs.existsSync(src)) {
        copyRecursive(src, dest);
        console.log(`  Copied: ${item}`);
    }
}

// Modify HTML files for mobile
console.log('\nModifying HTML files for mobile...');
processDirectory(WWW_DIR);

console.log('\n✅ Build complete!');
console.log('\nNext steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run cap:add:android (for Android)');
console.log('3. Run: npm run cap:add:ios (for iOS, requires Mac)');
console.log('4. Run: npm run cap:sync');
console.log('5. Open in Android Studio or Xcode to build');
