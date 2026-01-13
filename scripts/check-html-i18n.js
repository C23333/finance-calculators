/**
 * Check if all data-i18n keys used in HTML files exist in translation files
 */

const fs = require('fs');
const path = require('path');

// Load English translations as base
const enTranslations = JSON.parse(fs.readFileSync('js/i18n/en.json', 'utf8'));

// Get all keys from translation object
function getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

const translationKeys = new Set(getAllKeys(enTranslations));

// Find all data-i18n attributes in HTML files
function findI18nKeysInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /data-i18n="([^"]+)"/g;
    const keys = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        keys.push({ key: match[1], file: filePath });
    }
    return keys;
}

function scanDirectory(dir, results = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            scanDirectory(filePath, results);
        } else if (file.endsWith('.html')) {
            results.push(...findI18nKeysInFile(filePath));
        }
    }
    return results;
}

console.log('🔍 Checking HTML files for missing i18n keys...\n');

// Scan all HTML files
const allKeys = scanDirectory('.');
const uniqueKeys = [...new Set(allKeys.map(k => k.key))];

console.log(`📊 Found ${uniqueKeys.length} unique data-i18n keys in HTML files\n`);

// Find missing keys
const missingKeys = [];
for (const item of allKeys) {
    if (!translationKeys.has(item.key)) {
        missingKeys.push(item);
    }
}

// Group by key
const missingByKey = {};
for (const item of missingKeys) {
    if (!missingByKey[item.key]) {
        missingByKey[item.key] = [];
    }
    missingByKey[item.key].push(item.file);
}

if (Object.keys(missingByKey).length === 0) {
    console.log('✅ All data-i18n keys in HTML files exist in translations!\n');
} else {
    console.log(`❌ Found ${Object.keys(missingByKey).length} missing keys:\n`);
    for (const key of Object.keys(missingByKey).sort()) {
        console.log(`  - ${key}`);
        console.log(`    Used in: ${missingByKey[key].slice(0, 3).join(', ')}${missingByKey[key].length > 3 ? ` (+${missingByKey[key].length - 3} more)` : ''}`);
    }
}

console.log('\n============================================================\n');

// Also check for keys in JS files that might be used dynamically
console.log('🔍 Checking JS files for potential i18n usage...\n');

function findI18nInJS(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Look for patterns like t('key') or i18n.t('key') or translations['key']
    const patterns = [
        /t\(['"]([^'"]+)['"]\)/g,
        /i18n\.t\(['"]([^'"]+)['"]\)/g,
        /translations\[['"]([^'"]+)['"]\]/g,
        /getTranslation\(['"]([^'"]+)['"]\)/g
    ];
    const keys = [];
    for (const regex of patterns) {
        let match;
        while ((match = regex.exec(content)) !== null) {
            keys.push({ key: match[1], file: filePath });
        }
    }
    return keys;
}

function scanJSFiles(dir, results = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'i18n') {
            scanJSFiles(filePath, results);
        } else if (file.endsWith('.js') && !file.includes('i18n')) {
            results.push(...findI18nInJS(filePath));
        }
    }
    return results;
}

const jsKeys = scanJSFiles('js');
const uniqueJSKeys = [...new Set(jsKeys.map(k => k.key))];

if (uniqueJSKeys.length > 0) {
    console.log(`Found ${uniqueJSKeys.length} potential i18n keys in JS files`);
    const missingJSKeys = uniqueJSKeys.filter(k => !translationKeys.has(k));
    if (missingJSKeys.length > 0) {
        console.log(`⚠️  ${missingJSKeys.length} keys might be missing:`);
        missingJSKeys.forEach(k => console.log(`  - ${k}`));
    } else {
        console.log('✅ All JS i18n keys exist in translations');
    }
} else {
    console.log('No dynamic i18n keys found in JS files');
}

console.log('\n📋 SUMMARY');
console.log(`   HTML keys: ${uniqueKeys.length}`);
console.log(`   Missing from translations: ${Object.keys(missingByKey).length}`);
