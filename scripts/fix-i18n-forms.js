#!/usr/bin/env node
/**
 * Fix i18n in calculator forms
 * - Add data-i18n to select options
 * - Mark currency symbols for dynamic update
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CALCULATORS_DIR = path.join(__dirname, '../calculators');

// Mapping of option text to i18n keys
const OPTION_MAPPINGS = {
    // Loan terms
    '30 years': 'common.loanTerm30',
    '20 years': 'common.loanTerm20',
    '15 years': 'common.loanTerm15',
    '10 years': 'common.loanTerm10',
    // Compound frequency
    'Daily': 'calculators.compoundInterest.daily',
    'Monthly': 'calculators.compoundInterest.monthly',
    'Quarterly': 'calculators.compoundInterest.quarterly',
    'Annually': 'calculators.compoundInterest.annually',
    // Pay periods
    'Annual': 'calculators.salary.annual',
    'Monthly': 'calculators.salary.monthly',
    'Bi-Weekly': 'calculators.salary.biWeekly',
    'Weekly': 'calculators.salary.weekly',
    'Hourly': 'calculators.salary.hourly',
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    
    // Find all <option> tags without data-i18n
    const optionRegex = /<option\s+value="([^"]+)"(?![^>]*data-i18n)>([^<]+)<\/option>/g;
    
    content = content.replace(optionRegex, (match, value, text) => {
        const trimmedText = text.trim();
        
        // Check if we have a mapping for this text
        if (OPTION_MAPPINGS[trimmedText]) {
            modified = true;
            return `<option value="${value}" data-i18n="${OPTION_MAPPINGS[trimmedText]}">${trimmedText}</option>`;
        }
        
        return match;
    });
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        return true;
    }
    return false;
}

function main() {
    console.log('🔧 Fixing i18n in calculator forms...\n');
    
    const files = fs.readdirSync(CALCULATORS_DIR).filter(f => f.endsWith('.html'));
    let updated = 0;
    
    for (const file of files) {
        const filePath = path.join(CALCULATORS_DIR, file);
        try {
            if (processFile(filePath)) {
                console.log(`✅ ${file} - updated`);
                updated++;
            } else {
                console.log(`⏭️  ${file} - no changes needed`);
            }
        } catch (error) {
            console.log(`❌ ${file} - error: ${error.message}`);
        }
    }
    
    console.log(`\n📊 Summary: ${updated} files updated`);
}

main();
