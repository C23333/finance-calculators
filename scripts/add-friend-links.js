/**
 * Script to add friend links to all HTML pages
 * Run with: node scripts/add-friend-links.js
 */

const fs = require('fs');
const path = require('path');

const friendLinksHtml = `            <div class="friend-links">
                <span data-i18n="footer.friendLinks">Friend Links:</span>
                <a href="https://qrmaker.life/" target="_blank" rel="noopener" data-i18n="footer.qrmaker">QR Code Generator</a>
            </div>`;

function addFriendLinksToFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Skip if already has friend-links
        if (content.includes('friend-links')) {
            console.log(`[SKIP] ${filePath} - already has friend links`);
            return false;
        }
        
        // Find the </div> before </footer> and insert friend links before it
        // Pattern: look for </div>\n    </footer> or </div>\n</footer>
        const footerPattern = /(\s*<\/div>)(\s*<\/footer>)/;
        
        if (footerPattern.test(content)) {
            content = content.replace(footerPattern, (match, divClose, footerClose) => {
                return `\n${friendLinksHtml}${divClose}${footerClose}`;
            });
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`[UPDATED] ${filePath}`);
            return true;
        } else {
            console.log(`[WARN] ${filePath} - footer pattern not found`);
            return false;
        }
    } catch (err) {
        console.error(`[ERROR] ${filePath}: ${err.message}`);
        return false;
    }
}

function processDirectory(dir, recursive = false) {
    const files = fs.readdirSync(dir);
    let updated = 0;
    let skipped = 0;
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && recursive) {
            const result = processDirectory(filePath, recursive);
            updated += result.updated;
            skipped += result.skipped;
        } else if (file.endsWith('.html')) {
            if (addFriendLinksToFile(filePath)) {
                updated++;
            } else {
                skipped++;
            }
        }
    }
    
    return { updated, skipped };
}

console.log('Adding friend links to HTML pages...\n');

// Process calculators
console.log('=== Processing calculators/ ===');
const calcResult = processDirectory('calculators');

// Process blog (including language subdirectories)
console.log('\n=== Processing blog/ ===');
const blogResult = processDirectory('blog', true);

console.log('\n=== Summary ===');
console.log(`Calculators: ${calcResult.updated} updated, ${calcResult.skipped} skipped`);
console.log(`Blog: ${blogResult.updated} updated, ${blogResult.skipped} skipped`);
console.log(`Total: ${calcResult.updated + blogResult.updated} files updated`);
