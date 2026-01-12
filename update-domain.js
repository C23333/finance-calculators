#!/usr/bin/env node
/**
 * Domain Update Script
 * Run this after purchasing your domain to update all files
 *
 * Usage: node update-domain.js your-actual-domain.com
 */

const fs = require('fs');
const path = require('path');

const OLD_DOMAIN = 'financecalc.cc';
const NEW_DOMAIN = process.argv[2];

if (!NEW_DOMAIN) {
    console.error('Usage: node update-domain.js <new-domain>');
    console.error('Example: node update-domain.js calcmoney.com');
    process.exit(1);
}

const ROOT_DIR = __dirname;
const EXTENSIONS = ['.html', '.xml', '.txt', '.js'];

function updateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(OLD_DOMAIN)) {
        const updated = content.replace(new RegExp(OLD_DOMAIN, 'g'), NEW_DOMAIN);
        fs.writeFileSync(filePath, updated);
        console.log(`Updated: ${filePath}`);
        return true;
    }
    return false;
}

function walkDir(dir) {
    let updated = 0;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.startsWith('.')) {
            updated += walkDir(filePath);
        } else if (stat.isFile() && EXTENSIONS.includes(path.extname(file))) {
            if (updateFile(filePath)) updated++;
        }
    }

    return updated;
}

console.log(`Updating domain from "${OLD_DOMAIN}" to "${NEW_DOMAIN}"...\n`);
const count = walkDir(ROOT_DIR);
console.log(`\nDone! Updated ${count} files.`);
console.log('\nNext steps:');
console.log('1. Update config.js with your Google Analytics and AdSense IDs');
console.log('2. Deploy to Cloudflare Pages or Vercel');
console.log('3. Submit sitemap to Google Search Console');
