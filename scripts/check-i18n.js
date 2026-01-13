#!/usr/bin/env node
/**
 * i18n Translation Checker Script
 * Compares all translation files against the English base file
 * Reports missing keys, extra keys, and coverage statistics
 */

const fs = require('fs');
const path = require('path');

// Configuration
const I18N_DIR = path.join(__dirname, '..', 'js', 'i18n');
const BASE_LANG = 'en';
const SUPPORTED_LANGUAGES = ['en', 'es', 'zh', 'de', 'fr', 'pt', 'ja', 'ko', 'ar', 'hi'];

/**
 * Recursively extract all keys from a nested object
 * @param {object} obj - The object to extract keys from
 * @param {string} prefix - Current key prefix for nested keys
 * @returns {string[]} Array of dot-notation keys
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
 * Compare two translation objects and find differences
 * @param {object} base - Base translation object (English)
 * @param {object} target - Target translation object
 * @returns {{ missing: string[], extra: string[] }}
 */
function compareTranslations(base, target) {
    const baseKeys = new Set(getAllKeys(base));
    const targetKeys = new Set(getAllKeys(target));
    
    const missing = [...baseKeys].filter(key => !targetKeys.has(key));
    const extra = [...targetKeys].filter(key => !baseKeys.has(key));
    
    return { missing, extra };
}


/**
 * Load a JSON translation file
 * @param {string} lang - Language code
 * @returns {object|null} Parsed JSON or null if error
 */
function loadTranslationFile(lang) {
    const filePath = path.join(I18N_DIR, `${lang}.json`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`❌ File not found: ${filePath}`);
        } else if (error instanceof SyntaxError) {
            console.error(`❌ Invalid JSON in ${lang}.json: ${error.message}`);
        } else {
            console.error(`❌ Error loading ${lang}.json: ${error.message}`);
        }
        return null;
    }
}

/**
 * Generate a translation report for all languages
 * @returns {object} Complete check result
 */
function generateReport() {
    const timestamp = new Date().toISOString();
    const reports = [];
    
    // Load base (English) translations
    const baseTranslations = loadTranslationFile(BASE_LANG);
    if (!baseTranslations) {
        console.error('❌ Cannot proceed without base English translation file');
        process.exit(1);
    }
    
    const baseKeys = getAllKeys(baseTranslations);
    console.log(`\n📊 Base language (${BASE_LANG}) has ${baseKeys.length} translation keys\n`);
    console.log('='.repeat(60));
    
    let fullyTranslated = 0;
    let needsWork = 0;
    
    for (const lang of SUPPORTED_LANGUAGES) {
        if (lang === BASE_LANG) continue;
        
        const translations = loadTranslationFile(lang);
        
        if (!translations) {
            reports.push({
                language: lang,
                missingKeys: baseKeys,
                extraKeys: [],
                totalKeys: 0,
                coverage: 0,
                error: 'File not found or invalid'
            });
            needsWork++;
            continue;
        }
        
        const { missing, extra } = compareTranslations(baseTranslations, translations);
        const targetKeys = getAllKeys(translations);
        const coverage = ((baseKeys.length - missing.length) / baseKeys.length * 100).toFixed(1);
        
        const report = {
            language: lang,
            missingKeys: missing,
            extraKeys: extra,
            totalKeys: targetKeys.length,
            coverage: parseFloat(coverage)
        };
        
        reports.push(report);
        
        // Print report for this language
        const status = missing.length === 0 ? '✅' : '⚠️';
        console.log(`\n${status} ${lang.toUpperCase()} - Coverage: ${coverage}%`);
        console.log(`   Total keys: ${targetKeys.length} | Missing: ${missing.length} | Extra: ${extra.length}`);
        
        if (missing.length > 0) {
            console.log(`   Missing keys:`);
            missing.slice(0, 10).forEach(key => console.log(`     - ${key}`));
            if (missing.length > 10) {
                console.log(`     ... and ${missing.length - 10} more`);
            }
            needsWork++;
        } else {
            fullyTranslated++;
        }
        
        if (extra.length > 0) {
            console.log(`   Extra keys (not in English):`);
            extra.slice(0, 5).forEach(key => console.log(`     + ${key}`));
            if (extra.length > 5) {
                console.log(`     ... and ${extra.length - 5} more`);
            }
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📋 SUMMARY');
    console.log(`   Total languages: ${SUPPORTED_LANGUAGES.length}`);
    console.log(`   Fully translated: ${fullyTranslated}`);
    console.log(`   Needs work: ${needsWork}`);
    
    return {
        timestamp,
        baseLanguage: BASE_LANG,
        baseKeyCount: baseKeys.length,
        reports,
        summary: {
            totalLanguages: SUPPORTED_LANGUAGES.length,
            fullyTranslated,
            needsWork
        }
    };
}

/**
 * Export missing keys to a JSON file for easy reference
 * @param {object} result - The check result
 */
function exportMissingKeys(result) {
    const missingByLang = {};
    
    for (const report of result.reports) {
        if (report.missingKeys.length > 0) {
            missingByLang[report.language] = report.missingKeys;
        }
    }
    
    if (Object.keys(missingByLang).length > 0) {
        const outputPath = path.join(__dirname, 'missing-translations.json');
        fs.writeFileSync(outputPath, JSON.stringify(missingByLang, null, 2));
        console.log(`\n📁 Missing keys exported to: ${outputPath}`);
    }
}

// Main execution
console.log('🔍 i18n Translation Checker');
console.log('Checking translation files against English base...');

const result = generateReport();
exportMissingKeys(result);

// Exit with error code if there are missing translations
if (result.summary.needsWork > 0) {
    console.log('\n⚠️  Some languages have missing translations');
    process.exit(1);
} else {
    console.log('\n✅ All languages are fully translated!');
    process.exit(0);
}
