#!/usr/bin/env node
/**
 * i18n Translation Sync Script
 * Copies missing keys from English base file to other language files
 * Preserves existing translations
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'js', 'i18n');
const BASE_LANG = 'en';
const SUPPORTED_LANGUAGES = ['es', 'zh', 'de', 'fr', 'pt', 'ja', 'ko', 'ar', 'hi'];

/**
 * Recursively get all keys from an object
 */
function getAllKeys(obj, prefix = '') {
    const keys = [];
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys.push(...getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

/**
 * Get value from object by dot notation key
 */
function getValue(obj, key) {
    return key.split('.').reduce((o, k) => o?.[k], obj);
}

/**
 * Set value in object by dot notation key
 */
function setValue(obj, key, value) {
    const keys = key.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key]);
            } else if (result[key] === undefined) {
                result[key] = source[key];
            }
        }
    }
    return result;
}


/**
 * Sync missing keys from base to target language
 */
function syncLanguage(baseTrans, targetTrans, lang) {
    const baseKeys = getAllKeys(baseTrans);
    const targetKeys = new Set(getAllKeys(targetTrans));
    
    let added = 0;
    const result = JSON.parse(JSON.stringify(targetTrans)); // Deep clone
    
    for (const key of baseKeys) {
        if (!targetKeys.has(key)) {
            const value = getValue(baseTrans, key);
            setValue(result, key, value);
            added++;
        }
    }
    
    return { result, added };
}

/**
 * Main sync function
 */
function main() {
    console.log('🔄 i18n Translation Sync');
    console.log('Syncing missing keys from English to other languages...\n');
    
    // Load base translations
    const basePath = path.join(I18N_DIR, `${BASE_LANG}.json`);
    const baseContent = fs.readFileSync(basePath, 'utf8');
    const baseTrans = JSON.parse(baseContent);
    
    const baseKeys = getAllKeys(baseTrans);
    console.log(`📊 Base language (${BASE_LANG}) has ${baseKeys.length} keys\n`);
    
    let totalAdded = 0;
    
    for (const lang of SUPPORTED_LANGUAGES) {
        const langPath = path.join(I18N_DIR, `${lang}.json`);
        
        try {
            const content = fs.readFileSync(langPath, 'utf8');
            const targetTrans = JSON.parse(content);
            
            const { result, added } = syncLanguage(baseTrans, targetTrans, lang);
            
            if (added > 0) {
                // Write back with proper formatting
                fs.writeFileSync(langPath, JSON.stringify(result, null, 4) + '\n');
                console.log(`✅ ${lang.toUpperCase()}: Added ${added} missing keys`);
                totalAdded += added;
            } else {
                console.log(`✓ ${lang.toUpperCase()}: Already complete`);
            }
        } catch (error) {
            console.error(`❌ ${lang.toUpperCase()}: Error - ${error.message}`);
        }
    }
    
    console.log(`\n📋 Summary: Added ${totalAdded} keys across all languages`);
    console.log('\n⚠️  Note: Added keys use English text as placeholder.');
    console.log('   Please review and translate the new keys manually.');
}

main();
