#!/usr/bin/env node
/**
 * Article History Module
 * Manages article history, deduplication, and version control
 *
 * Features:
 * - Track all generated articles by URL and slug
 * - Prevent duplicate generation across days
 * - Version control with automatic archiving
 * - CLI commands for statistics, version listing, and restoration
 */

const fs = require('fs');
const path = require('path');

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const ARCHIVE_DIR = path.join(DATA_DIR, 'archive');
const HISTORY_PATH = path.join(DATA_DIR, 'article-history.json');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output', 'articles');
const BLOG_DIR = path.join(PROJECT_ROOT, 'blog');

// Default history structure
const DEFAULT_HISTORY = {
    version: 1,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    statistics: {
        totalArticles: 0,
        totalVersions: 0,
        archivedVersions: 0
    },
    bySlug: {},
    bySourceUrl: {}
};

/**
 * Ensure data directories exist
 */
function ensureDirectories() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ARCHIVE_DIR)) {
        fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    }
}

/**
 * Load history from file
 */
function loadHistory() {
    ensureDirectories();
    try {
        if (fs.existsSync(HISTORY_PATH)) {
            const data = fs.readFileSync(HISTORY_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Warning: Failed to load history, creating new:', err.message);
    }
    return { ...DEFAULT_HISTORY };
}

/**
 * Save history to file
 */
function saveHistory(history) {
    ensureDirectories();
    history.lastUpdated = new Date().toISOString();
    updateStatistics(history);
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');
}

/**
 * Update statistics in history
 */
function updateStatistics(history) {
    const slugs = Object.keys(history.bySlug);
    let totalVersions = 0;
    let archivedVersions = 0;

    slugs.forEach(slug => {
        const article = history.bySlug[slug];
        if (article.versions) {
            totalVersions += article.versions.length;
            archivedVersions += article.versions.filter(v => v.archived).length;
        }
    });

    history.statistics = {
        totalArticles: slugs.length,
        totalVersions,
        archivedVersions
    };
}

/**
 * Normalize title for comparison
 */
function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 100);
}

/**
 * Calculate similarity between two normalized titles
 */
function calculateSimilarity(title1, title2) {
    const words1 = new Set(title1.split(' '));
    const words2 = new Set(title2.split(' '));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
}

/**
 * Check if source URL has already been used for article generation
 */
function isArticleGenerated(sourceUrl, history = null) {
    if (!history) history = loadHistory();
    return !!history.bySourceUrl[sourceUrl];
}

/**
 * Check if slug is already used
 */
function isSlugUsed(slug, history = null) {
    if (!history) history = loadHistory();
    return !!history.bySlug[slug];
}

/**
 * Find similar title in history
 * Returns the slug of similar article if found, null otherwise
 */
function findSimilarTitle(title, history = null, threshold = 0.7) {
    if (!history) history = loadHistory();
    const normalizedInput = normalizeTitle(title);

    for (const slug of Object.keys(history.bySlug)) {
        const article = history.bySlug[slug];
        const normalizedExisting = normalizeTitle(article.title);
        const similarity = calculateSimilarity(normalizedInput, normalizedExisting);

        if (similarity >= threshold) {
            return {
                slug,
                title: article.title,
                similarity: Math.round(similarity * 100)
            };
        }
    }
    return null;
}

/**
 * Get current version number for a slug
 */
function getCurrentVersion(slug, history = null) {
    if (!history) history = loadHistory();
    const article = history.bySlug[slug];
    return article ? article.currentVersion : 0;
}

/**
 * Archive the current version of an article
 */
function archiveVersion(slug, history = null) {
    if (!history) history = loadHistory();
    const article = history.bySlug[slug];

    if (!article) {
        console.log(`  [History] No existing article found for slug: ${slug}`);
        return null;
    }

    const currentVersion = article.currentVersion;
    const currentPath = path.join(OUTPUT_DIR, `final-${slug}.json`);

    if (!fs.existsSync(currentPath)) {
        console.log(`  [History] Current article file not found: ${currentPath}`);
        return null;
    }

    // Read current article data
    const articleData = JSON.parse(fs.readFileSync(currentPath, 'utf8'));

    // Create archive filename
    const archiveFilename = `${slug}-v${currentVersion}.json`;
    const archivePath = path.join(ARCHIVE_DIR, archiveFilename);

    // Save to archive
    fs.writeFileSync(archivePath, JSON.stringify(articleData, null, 2), 'utf8');

    // Update version info in history
    const versionInfo = article.versions.find(v => v.version === currentVersion);
    if (versionInfo) {
        versionInfo.archived = true;
        versionInfo.archivePath = `data/archive/${archiveFilename}`;
        versionInfo.archivedAt = new Date().toISOString();
    }

    saveHistory(history);

    console.log(`  [History] Archived version ${currentVersion} to: ${archiveFilename}`);
    return archivePath;
}

/**
 * Record a newly generated article
 */
function recordArticle(articleInfo, history = null) {
    if (!history) history = loadHistory();
    const { slug, sourceUrl, title, generatedAt } = articleInfo;

    const now = generatedAt || new Date().toISOString();

    if (history.bySlug[slug]) {
        // Existing article - add new version
        const article = history.bySlug[slug];
        article.currentVersion++;
        article.lastUpdated = now;
        article.title = title; // Update title in case it changed
        article.versions.push({
            version: article.currentVersion,
            generatedAt: now,
            archived: false,
            currentPath: `output/articles/final-${slug}.json`
        });

        // Update source URL mapping
        if (sourceUrl && !history.bySourceUrl[sourceUrl]) {
            history.bySourceUrl[sourceUrl] = slug;
        }
    } else {
        // New article
        history.bySlug[slug] = {
            slug,
            title,
            sourceUrl,
            currentVersion: 1,
            createdAt: now,
            lastUpdated: now,
            versions: [{
                version: 1,
                generatedAt: now,
                archived: false,
                currentPath: `output/articles/final-${slug}.json`
            }]
        };

        // Map source URL to slug
        if (sourceUrl) {
            history.bySourceUrl[sourceUrl] = slug;
        }
    }

    saveHistory(history);
    return history.bySlug[slug];
}

/**
 * List all versions of an article
 */
function listVersions(slug, history = null) {
    if (!history) history = loadHistory();
    const article = history.bySlug[slug];

    if (!article) {
        return null;
    }

    return {
        slug: article.slug,
        title: article.title,
        currentVersion: article.currentVersion,
        versions: article.versions
    };
}

/**
 * Restore a specific version of an article
 */
function restoreVersion(slug, version, history = null) {
    if (!history) history = loadHistory();
    const article = history.bySlug[slug];

    if (!article) {
        return { success: false, error: `Article not found: ${slug}` };
    }

    const versionInfo = article.versions.find(v => v.version === version);
    if (!versionInfo) {
        return { success: false, error: `Version ${version} not found for ${slug}` };
    }

    if (!versionInfo.archived) {
        return { success: false, error: `Version ${version} is the current version, nothing to restore` };
    }

    const archivePath = path.join(PROJECT_ROOT, versionInfo.archivePath);
    if (!fs.existsSync(archivePath)) {
        return { success: false, error: `Archive file not found: ${versionInfo.archivePath}` };
    }

    // Archive current version first
    archiveVersion(slug, history);

    // Restore the specified version
    const archivedData = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
    const currentPath = path.join(OUTPUT_DIR, `final-${slug}.json`);
    fs.writeFileSync(currentPath, JSON.stringify(archivedData, null, 2), 'utf8');

    // Update history
    article.currentVersion++;
    article.lastUpdated = new Date().toISOString();
    article.versions.push({
        version: article.currentVersion,
        generatedAt: new Date().toISOString(),
        archived: false,
        currentPath: `output/articles/final-${slug}.json`,
        restoredFrom: version
    });

    saveHistory(history);

    return {
        success: true,
        message: `Restored version ${version} as new version ${article.currentVersion}`,
        newVersion: article.currentVersion
    };
}

/**
 * Get statistics about the article history
 */
function getStatistics(history = null) {
    if (!history) history = loadHistory();

    const slugs = Object.keys(history.bySlug);
    const stats = {
        totalArticles: slugs.length,
        totalVersions: 0,
        archivedVersions: 0,
        articlesWithMultipleVersions: 0,
        oldestArticle: null,
        newestArticle: null,
        byMonth: {}
    };

    slugs.forEach(slug => {
        const article = history.bySlug[slug];
        const versions = article.versions || [];
        stats.totalVersions += versions.length;
        stats.archivedVersions += versions.filter(v => v.archived).length;

        if (versions.length > 1) {
            stats.articlesWithMultipleVersions++;
        }

        // Track oldest and newest
        const createdDate = new Date(article.createdAt);
        if (!stats.oldestArticle || createdDate < new Date(stats.oldestArticle.date)) {
            stats.oldestArticle = { slug, date: article.createdAt };
        }
        if (!stats.newestArticle || createdDate > new Date(stats.newestArticle.date)) {
            stats.newestArticle = { slug, date: article.createdAt };
        }

        // Group by month
        const month = article.createdAt.substring(0, 7); // YYYY-MM
        stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });

    return stats;
}

/**
 * List all articles with basic info
 */
function listArticles(history = null, options = {}) {
    if (!history) history = loadHistory();

    const { limit = 50, sortBy = 'lastUpdated', order = 'desc' } = options;

    let articles = Object.values(history.bySlug).map(article => ({
        slug: article.slug,
        title: article.title,
        currentVersion: article.currentVersion,
        createdAt: article.createdAt,
        lastUpdated: article.lastUpdated,
        versionCount: (article.versions || []).length
    }));

    // Sort
    articles.sort((a, b) => {
        const aVal = a[sortBy] || '';
        const bVal = b[sortBy] || '';
        return order === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    });

    // Limit
    if (limit > 0) {
        articles = articles.slice(0, limit);
    }

    return articles;
}

/**
 * CLI interface
 */
function runCli() {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log('='.repeat(60));
    console.log('Article History Manager');
    console.log('='.repeat(60));

    switch (command) {
        case '--stats':
        case '-s': {
            const stats = getStatistics();
            console.log('\nStatistics:');
            console.log(`  Total articles: ${stats.totalArticles}`);
            console.log(`  Total versions: ${stats.totalVersions}`);
            console.log(`  Archived versions: ${stats.archivedVersions}`);
            console.log(`  Articles with multiple versions: ${stats.articlesWithMultipleVersions}`);

            if (stats.oldestArticle) {
                console.log(`\n  Oldest: ${stats.oldestArticle.slug} (${stats.oldestArticle.date.split('T')[0]})`);
            }
            if (stats.newestArticle) {
                console.log(`  Newest: ${stats.newestArticle.slug} (${stats.newestArticle.date.split('T')[0]})`);
            }

            console.log('\nBy month:');
            Object.entries(stats.byMonth).sort().forEach(([month, count]) => {
                console.log(`  ${month}: ${count} articles`);
            });
            break;
        }

        case '--versions':
        case '-v': {
            const slug = args[1];
            if (!slug) {
                console.log('Usage: node article-history.js --versions <slug>');
                process.exit(1);
            }

            const info = listVersions(slug);
            if (!info) {
                console.log(`Article not found: ${slug}`);
                process.exit(1);
            }

            console.log(`\nArticle: ${info.title}`);
            console.log(`Slug: ${info.slug}`);
            console.log(`Current version: ${info.currentVersion}`);
            console.log('\nVersions:');
            info.versions.forEach(v => {
                const status = v.archived ? '[ARCHIVED]' : '[CURRENT]';
                const restored = v.restoredFrom ? ` (restored from v${v.restoredFrom})` : '';
                console.log(`  v${v.version} - ${v.generatedAt.split('T')[0]} ${status}${restored}`);
                if (v.archived && v.archivePath) {
                    console.log(`         Archive: ${v.archivePath}`);
                }
            });
            break;
        }

        case '--restore':
        case '-r': {
            const slug = args[1];
            const versionArg = args.find(a => a.startsWith('--version=') || a.startsWith('-V='));
            const version = versionArg ? parseInt(versionArg.split('=')[1]) : parseInt(args[3]);

            if (!slug || !version) {
                console.log('Usage: node article-history.js --restore <slug> --version=<n>');
                process.exit(1);
            }

            console.log(`\nRestoring ${slug} to version ${version}...`);
            const result = restoreVersion(slug, version);
            if (result.success) {
                console.log(`Success: ${result.message}`);
            } else {
                console.log(`Failed: ${result.error}`);
                process.exit(1);
            }
            break;
        }

        case '--list':
        case '-l': {
            const limit = parseInt(args[1]) || 20;
            const articles = listArticles(null, { limit });

            console.log(`\nRecent articles (showing ${articles.length}):\n`);
            articles.forEach(article => {
                const versions = article.versionCount > 1 ? ` [${article.versionCount} versions]` : '';
                console.log(`  ${article.slug}${versions}`);
                console.log(`    "${article.title.substring(0, 50)}${article.title.length > 50 ? '...' : ''}"`);
                console.log(`    Last updated: ${article.lastUpdated.split('T')[0]}`);
            });
            break;
        }

        case '--check':
        case '-c': {
            const url = args[1];
            if (!url) {
                console.log('Usage: node article-history.js --check <url>');
                process.exit(1);
            }

            const exists = isArticleGenerated(url);
            if (exists) {
                const history = loadHistory();
                const slug = history.bySourceUrl[url];
                console.log(`\nURL already used: ${url}`);
                console.log(`  Article slug: ${slug}`);
            } else {
                console.log(`\nURL not found in history: ${url}`);
            }
            break;
        }

        case '--help':
        case '-h':
        default:
            console.log(`
Usage: node article-history.js <command> [options]

Commands:
  --stats, -s              Show statistics
  --list, -l [limit]       List recent articles
  --versions, -v <slug>    List versions of an article
  --restore, -r <slug> --version=<n>  Restore a specific version
  --check, -c <url>        Check if URL has been used

Examples:
  node article-history.js --stats
  node article-history.js --list 10
  node article-history.js --versions mortgage-rates-drop
  node article-history.js --restore mortgage-rates-drop --version=2
  node article-history.js --check "https://example.com/news/article"
`);
    }
}

// Export module functions
module.exports = {
    loadHistory,
    saveHistory,
    isArticleGenerated,
    isSlugUsed,
    findSimilarTitle,
    getCurrentVersion,
    archiveVersion,
    recordArticle,
    listVersions,
    restoreVersion,
    getStatistics,
    listArticles,
    normalizeTitle,
    calculateSimilarity,
    HISTORY_PATH,
    ARCHIVE_DIR,
    DATA_DIR
};

// Run CLI if called directly
if (require.main === module) {
    runCli();
}
