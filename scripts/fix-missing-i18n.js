/**
 * Fix missing i18n keys by extracting default values from HTML
 * and adding them to en.json
 */

const fs = require('fs');
const path = require('path');

// Load English translations
const enPath = 'js/i18n/en.json';
let enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));

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

// Set a nested key in an object
function setNestedKey(obj, keyPath, value) {
    const parts = keyPath.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
            current[parts[i]] = {};
        }
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
}

const translationKeys = new Set(getAllKeys(enTranslations));

// Find all data-i18n attributes with their default values
function findI18nKeysInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    // Pattern to match data-i18n="key">default value</tag>
    // Also handles self-closing and various tag patterns
    const patterns = [
        // <tag data-i18n="key">value</tag>
        /data-i18n="([^"]+)"[^>]*>([^<]+)</g,
        // <span data-i18n="key">value</span>
        /<[^>]+data-i18n="([^"]+)"[^>]*>([^<]*)</g,
    ];
    
    for (const regex of patterns) {
        let match;
        while ((match = regex.exec(content)) !== null) {
            const key = match[1];
            let value = match[2].trim();
            if (value && !translationKeys.has(key)) {
                results.push({ key, value, file: filePath });
            }
        }
    }
    
    return results;
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

console.log('🔍 Finding missing i18n keys and their default values...\n');

// Scan all HTML files
const allMissing = scanDirectory('.');

// Deduplicate by key, keeping first value found
const missingByKey = {};
for (const item of allMissing) {
    if (!missingByKey[item.key] && item.value) {
        missingByKey[item.key] = item.value;
    }
}

console.log(`Found ${Object.keys(missingByKey).length} missing keys with default values\n`);

// Add missing keys to translations
let addedCount = 0;
for (const [key, value] of Object.entries(missingByKey)) {
    if (!translationKeys.has(key)) {
        setNestedKey(enTranslations, key, value);
        console.log(`+ ${key}: "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`);
        addedCount++;
    }
}

// Save updated translations
fs.writeFileSync(enPath, JSON.stringify(enTranslations, null, 4), 'utf8');

console.log(`\n✅ Added ${addedCount} keys to en.json`);

// Now sync to other languages
console.log('\n🔄 Syncing to other language files...');
const languages = ['es', 'zh', 'de', 'fr', 'pt', 'ja', 'ko', 'ar', 'hi'];

for (const lang of languages) {
    const langPath = `js/i18n/${lang}.json`;
    if (fs.existsSync(langPath)) {
        let langTranslations = JSON.parse(fs.readFileSync(langPath, 'utf8'));
        const langKeys = new Set(getAllKeys(langTranslations));
        
        let syncedCount = 0;
        for (const [key, value] of Object.entries(missingByKey)) {
            if (!langKeys.has(key)) {
                setNestedKey(langTranslations, key, value);
                syncedCount++;
            }
        }
        
        fs.writeFileSync(langPath, JSON.stringify(langTranslations, null, 4), 'utf8');
        console.log(`  ${lang.toUpperCase()}: +${syncedCount} keys`);
    }
}

console.log('\n✅ Done!');
