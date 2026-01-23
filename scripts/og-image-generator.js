#!/usr/bin/env node
/**
 * OG Image Generator Module
 * Uses Gemini CLI to generate SVG social sharing images for articles
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const OG_IMAGES_DIR = path.join(PROJECT_ROOT, 'blog', 'images', 'og');

// Brand colors and styling
const BRAND_CONFIG = {
    primaryColor: '#4f46e5',  // Indigo
    secondaryColor: '#818cf8',
    backgroundColor: '#f8fafc',
    darkBackground: '#1e293b',
    textColor: '#1e293b',
    lightText: '#f8fafc',
    brandName: 'FinCalc',
    width: 1200,
    height: 630
};

// Category icons (emoji or simple shapes)
const CATEGORY_ICONS = {
    mortgage: '🏠',
    investing: '📈',
    retirement: '🎯',
    debt: '💳',
    savings: '💰',
    taxes: '📋',
    creditScore: '⭐',
    economy: '🏛️',
    general: '💵',
    'personal-finance': '💵'
};

/**
 * Generate SVG OG image using Gemini CLI
 */
async function generateWithGemini(title, category, slug) {
    const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.general;

    const prompt = `Generate a clean, professional SVG image for a financial article social media preview.

Requirements:
- Exact dimensions: ${BRAND_CONFIG.width}x${BRAND_CONFIG.height} pixels
- Title text: "${title}"
- Category: ${category} (use icon ${icon} if helpful)
- Style: Modern, minimal, professional financial design
- Brand color: ${BRAND_CONFIG.primaryColor} (indigo) as primary accent
- Background: Subtle gradient from ${BRAND_CONFIG.backgroundColor} to a slightly darker shade, OR a clean pattern
- Include "FinCalc" brand text in bottom right corner, small but readable
- Typography: Bold title text, ensure it's readable at small thumbnail sizes
- Title should be centered and may wrap to 2-3 lines if long
- Add subtle decorative elements related to finance (abstract chart lines, geometric shapes)
- DO NOT include any external images or links
- DO NOT include any text other than the title and brand name

Output ONLY the complete SVG code starting with <?xml or <svg, no explanations or markdown.`;

    try {
        // Try to use Gemini CLI
        const result = execSync(`gemini -p "${prompt.replace(/"/g, '\\"')}"`, {
            encoding: 'utf8',
            timeout: 60000,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Extract SVG from response
        const svgMatch = result.match(/<svg[\s\S]*<\/svg>/i);
        if (svgMatch) {
            return svgMatch[0];
        }

        // If no SVG found, generate fallback
        console.log('    Gemini output did not contain valid SVG, using fallback');
        return generateFallbackSvg(title, category);
    } catch (err) {
        console.log(`    Gemini CLI error: ${err.message}`);
        console.log('    Using fallback SVG generator');
        return generateFallbackSvg(title, category);
    }
}

/**
 * Generate fallback SVG when Gemini is unavailable
 */
function generateFallbackSvg(title, category) {
    const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.general;
    const { width, height, primaryColor, secondaryColor, brandName } = BRAND_CONFIG;

    // Truncate and wrap title
    const maxCharsPerLine = 35;
    const words = title.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
            currentLine = (currentLine + ' ' + word).trim();
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine) lines.push(currentLine);

    // Limit to 3 lines
    const displayLines = lines.slice(0, 3);
    if (lines.length > 3) {
        displayLines[2] = displayLines[2].substring(0, maxCharsPerLine - 3) + '...';
    }

    const titleY = height / 2 - (displayLines.length - 1) * 30;

    const titleTspans = displayLines.map((line, i) =>
        `<tspan x="${width / 2}" dy="${i === 0 ? 0 : 60}">${escapeXml(line)}</tspan>`
    ).join('\n            ');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>

    <!-- Decorative elements -->
    <path d="M0 ${height} L400 ${height - 100} L800 ${height - 50} L${width} ${height - 150} L${width} ${height} Z" fill="${primaryColor}" opacity="0.05"/>
    <path d="M0 ${height} L300 ${height - 60} L600 ${height - 90} L${width} ${height - 40} L${width} ${height} Z" fill="${secondaryColor}" opacity="0.08"/>

    <!-- Accent bar at top -->
    <rect x="0" y="0" width="${width}" height="8" fill="url(#accentGradient)"/>

    <!-- Category icon -->
    <text x="${width / 2}" y="120" font-size="64" text-anchor="middle" dominant-baseline="middle">${icon}</text>

    <!-- Category label -->
    <text x="${width / 2}" y="170" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="500" fill="${primaryColor}" text-anchor="middle" text-transform="uppercase" letter-spacing="2">${escapeXml(category.toUpperCase())}</text>

    <!-- Title -->
    <text x="${width / 2}" y="${titleY}" font-family="Inter, system-ui, sans-serif" font-size="48" font-weight="700" fill="#1e293b" text-anchor="middle">
            ${titleTspans}
    </text>

    <!-- Brand name -->
    <text x="${width - 50}" y="${height - 30}" font-family="Inter, system-ui, sans-serif" font-size="24" font-weight="600" fill="${primaryColor}" text-anchor="end">${brandName}</text>

    <!-- Decorative corner -->
    <rect x="${width - 120}" y="${height - 8}" width="120" height="8" fill="url(#accentGradient)"/>
</svg>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Generate OG image for an article
 */
async function generateOgImage(articleData, options = {}) {
    const { useGemini = true, forceRegenerate = false } = options;
    const { title, slug, category } = articleData.metadata || articleData;

    if (!title || !slug) {
        throw new Error('Article must have title and slug');
    }

    const outputPath = path.join(OG_IMAGES_DIR, `${slug}.svg`);

    // Check if image already exists
    if (!forceRegenerate && fs.existsSync(outputPath)) {
        console.log(`  OG image already exists: ${slug}.svg`);
        return {
            success: true,
            path: outputPath,
            relativePath: `/blog/images/og/${slug}.svg`,
            existed: true
        };
    }

    // Ensure output directory exists
    if (!fs.existsSync(OG_IMAGES_DIR)) {
        fs.mkdirSync(OG_IMAGES_DIR, { recursive: true });
    }

    console.log(`  Generating OG image for: ${title.substring(0, 50)}...`);

    let svg;
    if (useGemini) {
        svg = await generateWithGemini(title, category || 'general', slug);
    } else {
        svg = generateFallbackSvg(title, category || 'general');
    }

    // Save SVG
    fs.writeFileSync(outputPath, svg);

    return {
        success: true,
        path: outputPath,
        relativePath: `/blog/images/og/${slug}.svg`,
        existed: false
    };
}

/**
 * Batch generate OG images for multiple articles
 */
async function generateBatchOgImages(articles, options = {}) {
    const results = [];

    console.log(`\nGenerating OG images for ${articles.length} articles...`);

    for (const article of articles) {
        try {
            const result = await generateOgImage(article, options);
            results.push(result);
            if (!result.existed) {
                console.log(`    ✓ Created: ${path.basename(result.path)}`);
            }
        } catch (err) {
            console.error(`    ✗ Error for ${article.metadata?.slug || 'unknown'}: ${err.message}`);
            results.push({ success: false, error: err.message });
        }
    }

    const created = results.filter(r => r.success && !r.existed).length;
    const existed = results.filter(r => r.existed).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\nOG Image Summary: ${created} created, ${existed} existed, ${failed} failed`);

    return results;
}

/**
 * Main function for CLI usage
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
OG Image Generator

Usage: node og-image-generator.js [options] [title]

Options:
  --test <title>    Generate test image with specified title
  --no-gemini       Use fallback SVG generator only
  --force           Force regenerate existing images
  --help, -h        Show this help message

Examples:
  node og-image-generator.js --test "Mortgage Rates Fall to 6.5%"
  node og-image-generator.js --no-gemini --test "Test Title"
`);
        process.exit(0);
    }

    const useGemini = !args.includes('--no-gemini');
    const forceRegenerate = args.includes('--force');

    // Test mode
    const testIndex = args.indexOf('--test');
    if (testIndex !== -1) {
        const title = args[testIndex + 1] || 'Test Article Title for OG Image Generation';

        console.log('='.repeat(60));
        console.log('OG Image Generator - Test Mode');
        console.log('='.repeat(60));
        console.log(`Title: ${title}`);
        console.log(`Using Gemini: ${useGemini}`);
        console.log();

        const testArticle = {
            metadata: {
                title,
                slug: 'test-og-image',
                category: 'mortgage'
            }
        };

        const result = await generateOgImage(testArticle, { useGemini, forceRegenerate: true });

        if (result.success) {
            console.log(`\n✓ Test image created: ${result.path}`);
        } else {
            console.error(`\n✗ Test failed: ${result.error}`);
            process.exit(1);
        }
        return;
    }

    console.log('OG Image Generator');
    console.log('Run with --test "Title" to generate a test image');
    console.log('This module is typically called by html-builder.js');
}

// Run if called directly
if (require.main === module) {
    main().catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
}

module.exports = {
    generateOgImage,
    generateBatchOgImages,
    generateFallbackSvg,
    BRAND_CONFIG,
    OG_IMAGES_DIR
};
