#!/usr/bin/env node
/**
 * Add sidebar to all calculator pages
 * Usage: node scripts/add-sidebar.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CALCULATORS_DIR = path.join(__dirname, '../calculators');

// Files to process
const CALCULATOR_FILES = [
    'mortgage.html',
    'refinance.html',
    'rent-vs-buy.html',
    'home-affordability.html',
    'loan-payoff.html',
    'debt-payoff.html',
    'auto-loan.html',
    'student-loan.html',
    'compound-interest.html',
    'investment-return.html',
    'savings-goal.html',
    'emergency-fund.html',
    'retirement.html',
    '401k.html',
    'social-security.html',
    'roth-vs-traditional.html',
    'salary.html',
    'take-home-pay.html',
    'self-employment-tax.html',
    'inflation.html',
];

function addSidebarToFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Add sidebar.css if not present
    if (!content.includes('sidebar.css')) {
        content = content.replace(
            '<link rel="stylesheet" href="../css/style.css">',
            '<link rel="stylesheet" href="../css/style.css">\n    <link rel="stylesheet" href="../css/sidebar.css">'
        );
        modified = true;
    }

    // Add sidebar.js if not present
    if (!content.includes('sidebar.js')) {
        // Try to add after i18n.js
        if (content.includes('i18n.js"></script>')) {
            content = content.replace(
                'i18n.js"></script>',
                'i18n.js"></script>\n    <!-- Sidebar Navigation -->\n    <script src="../js/sidebar.js"></script>'
            );
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        return true;
    }
    return false;
}

function main() {
    console.log('🔧 Adding sidebar to calculator pages...\n');

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const file of CALCULATOR_FILES) {
        const filePath = path.join(CALCULATORS_DIR, file);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${file} - not found, skipping`);
            skipped++;
            continue;
        }

        try {
            const wasModified = addSidebarToFile(filePath);
            if (wasModified) {
                console.log(`✅ ${file} - updated`);
                updated++;
            } else {
                console.log(`⏭️  ${file} - already has sidebar`);
                skipped++;
            }
        } catch (error) {
            console.log(`❌ ${file} - error: ${error.message}`);
            errors++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Summary: ${updated} updated, ${skipped} skipped, ${errors} errors`);
}

main();
