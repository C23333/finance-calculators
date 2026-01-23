#!/usr/bin/env node
/**
 * Initialize Article History
 * Scans existing articles and builds the initial history index
 *
 * Run this script once to initialize the history from existing articles:
 *   node scripts/init-history.js
 *
 * Options:
 *   --dry-run    Preview what would be recorded without saving
 *   --force      Overwrite existing history (use with caution)
 */

const fs = require('fs');
const path = require('path');
const history = require('./article-history');

const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output', 'articles');
const BLOG_DIR = path.join(PROJECT_ROOT, 'blog');

/**
 * Extract metadata from article JSON file
 */
function extractArticleInfo(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        // Extract slug from filename (final-{slug}.json)
        const filename = path.basename(filePath);
        const slugFromFile = filename.replace(/^final-/, '').replace(/\.json$/, '');

        // Get info from metadata
        const metadata = data.metadata || {};
        const slug = metadata.slug || slugFromFile;
        const title = metadata.title || data.content?.headline || 'Unknown Title';

        // Try to find source URL from various locations
        let sourceUrl = null;
        if (data.sourceUrl) {
            sourceUrl = data.sourceUrl;
        } else if (data.newsSource?.link) {
            sourceUrl = data.newsSource.link;
        } else if (data.originalNews?.link) {
            sourceUrl = data.originalNews.link;
        }

        // Get dates
        const publishDate = metadata.publishDate || metadata.createdAt;
        const modifiedDate = metadata.modifiedDate || publishDate;

        // Get file stats for fallback dates
        const stats = fs.statSync(filePath);

        return {
            slug,
            title,
            sourceUrl,
            publishDate: publishDate || stats.birthtime.toISOString(),
            modifiedDate: modifiedDate || stats.mtime.toISOString(),
            filePath
        };
    } catch (err) {
        console.error(`  Error parsing ${filePath}: ${err.message}`);
        return null;
    }
}

/**
 * Scan output/articles for JSON files
 */
function scanArticleFiles() {
    const articles = [];

    if (!fs.existsSync(OUTPUT_DIR)) {
        console.log('No articles directory found.');
        return articles;
    }

    const files = fs.readdirSync(OUTPUT_DIR);
    for (const file of files) {
        if (file.startsWith('final-') && file.endsWith('.json')) {
            const filePath = path.join(OUTPUT_DIR, file);
            const info = extractArticleInfo(filePath);
            if (info) {
                articles.push(info);
            }
        }
    }

    return articles;
}

/**
 * Scan blog directory for HTML files to cross-reference
 */
function scanBlogFiles() {
    const htmlFiles = new Set();

    if (!fs.existsSync(BLOG_DIR)) {
        return htmlFiles;
    }

    const files = fs.readdirSync(BLOG_DIR);
    for (const file of files) {
        if (file.endsWith('.html') && !file.startsWith('index')) {
            const slug = file.replace('.html', '');
            htmlFiles.add(slug);
        }
    }

    return htmlFiles;
}

/**
 * Main initialization function
 */
async function initializeHistory(options = {}) {
    const { dryRun = false, force = false } = options;

    console.log('='.repeat(60));
    console.log('Article History Initialization');
    console.log('='.repeat(60));
    console.log();

    // Check if history already exists
    const existingHistory = history.loadHistory();
    const hasExisting = Object.keys(existingHistory.bySlug).length > 0;

    if (hasExisting && !force) {
        console.log('Existing history found:');
        console.log(`  Articles: ${Object.keys(existingHistory.bySlug).length}`);
        console.log(`  Source URLs: ${Object.keys(existingHistory.bySourceUrl).length}`);
        console.log();
        console.log('Use --force to overwrite, or manually merge.');

        if (!dryRun) {
            console.log('\nRunning in merge mode (adding new articles only)...\n');
        }
    }

    // Scan existing files
    console.log('Scanning article files...');
    const articles = scanArticleFiles();
    console.log(`  Found ${articles.length} article JSON files`);

    const blogSlugs = scanBlogFiles();
    console.log(`  Found ${blogSlugs.size} blog HTML files`);

    // Count articles with HTML
    const withHtml = articles.filter(a => blogSlugs.has(a.slug)).length;
    console.log(`  Articles with matching HTML: ${withHtml}`);
    console.log();

    // Sort by date (oldest first)
    articles.sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));

    // Preview or record
    let newCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    const newHistory = force ? {
        version: 1,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        statistics: {},
        bySlug: {},
        bySourceUrl: {}
    } : { ...existingHistory };

    console.log('Processing articles:');
    for (const article of articles) {
        const existing = newHistory.bySlug[article.slug];

        if (existing && !force) {
            // Skip if already exists in non-force mode
            skippedCount++;
            continue;
        }

        if (dryRun) {
            console.log(`  [DRY RUN] Would record: ${article.slug}`);
            console.log(`            Title: ${article.title.substring(0, 50)}...`);
            if (article.sourceUrl) {
                console.log(`            Source: ${article.sourceUrl.substring(0, 60)}...`);
            }
            newCount++;
        } else {
            // Record the article
            newHistory.bySlug[article.slug] = {
                slug: article.slug,
                title: article.title,
                sourceUrl: article.sourceUrl,
                currentVersion: 1,
                createdAt: article.publishDate,
                lastUpdated: article.modifiedDate,
                versions: [{
                    version: 1,
                    generatedAt: article.publishDate,
                    archived: false,
                    currentPath: `output/articles/final-${article.slug}.json`
                }]
            };

            // Map source URL
            if (article.sourceUrl) {
                newHistory.bySourceUrl[article.sourceUrl] = article.slug;
            }

            if (existing) {
                updatedCount++;
                console.log(`  [UPDATED] ${article.slug}`);
            } else {
                newCount++;
                console.log(`  [ADDED] ${article.slug}`);
            }
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log(`  New articles: ${newCount}`);
    console.log(`  Updated: ${updatedCount}`);
    console.log(`  Skipped (already exists): ${skippedCount}`);

    if (dryRun) {
        console.log('\n[DRY RUN] No changes made.');
        console.log('Run without --dry-run to apply changes.');
    } else if (newCount > 0 || updatedCount > 0) {
        // Save history
        history.saveHistory(newHistory);
        console.log(`\nHistory saved to: ${history.HISTORY_PATH}`);

        // Verify
        const verified = history.loadHistory();
        console.log(`\nVerification:`);
        console.log(`  Total articles in history: ${Object.keys(verified.bySlug).length}`);
        console.log(`  Total source URLs mapped: ${Object.keys(verified.bySourceUrl).length}`);
    } else {
        console.log('\nNo changes needed.');
    }

    console.log('='.repeat(60));
    return newHistory;
}

// CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {
        dryRun: args.includes('--dry-run'),
        force: args.includes('--force')
    };

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: node init-history.js [options]

Options:
  --dry-run    Preview what would be recorded without saving
  --force      Overwrite existing history (use with caution)
  --help, -h   Show this help

Examples:
  node scripts/init-history.js              # Initialize or merge
  node scripts/init-history.js --dry-run    # Preview changes
  node scripts/init-history.js --force      # Rebuild from scratch
`);
        process.exit(0);
    }

    initializeHistory(options).catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
}

module.exports = { initializeHistory, scanArticleFiles, extractArticleInfo };
