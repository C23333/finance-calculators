const fs = require('fs');
const path = require('path');

// Remove all data-i18n attributes from HTML files
function removeI18nAttributes(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove data-i18n attributes
    content = content.replace(/\s+data-i18n="[^"]*"/g, '');
    
    // Remove i18n script references
    content = content.replace(/<script[^>]*i18n\.js[^>]*><\/script>/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Cleaned ${path.basename(filePath)}`);
}

// Process all calculator HTML files
const calculatorsDir = path.join(__dirname, '../calculators');
const files = fs.readdirSync(calculatorsDir);

files.forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(calculatorsDir, file);
        removeI18nAttributes(filePath);
    }
});

console.log('\n✓ All i18n attributes removed!');
