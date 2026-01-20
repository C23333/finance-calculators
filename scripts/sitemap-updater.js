#!/usr/bin/env node
/**
 * Sitemap Updater Module
 * Updates sitemap.xml with new blog articles
 * Also updates blog index page
 */

const fs = require('fs');
const path = require('path');

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const SITEMAP_PATH = path.join(PROJECT_ROOT, 'sitemap.xml');
const BLOG_INDEX_PATH = path.join(PROJECT_ROOT, 'blog', 'index.html');
const BLOG_DIR = path.join(PROJECT_ROOT, 'blog');

/**
 * Parse existing sitemap
 */
function parseSitemap(xmlContent) {
    const urls = [];
    const urlRegex = /<url>([\s\S]*?)<\/url>/g;
    const locRegex = /<loc>(.*?)<\/loc>/;
    const lastmodRegex = /<lastmod>(.*?)<\/lastmod>/;
    const changefreqRegex = /<changefreq>(.*?)<\/changefreq>/;
    const priorityRegex = /<priority>(.*?)<\/priority>/;

    let match;
    while ((match = urlRegex.exec(xmlContent)) !== null) {
        const urlBlock = match[1];
        const locMatch = locRegex.exec(urlBlock);
        const lastmodMatch = lastmodRegex.exec(urlBlock);
        const changefreqMatch = changefreqRegex.exec(urlBlock);
        const priorityMatch = priorityRegex.exec(urlBlock);

        if (locMatch) {
            urls.push({
                loc: locMatch[1],
                lastmod: lastmodMatch ? lastmodMatch[1] : null,
                changefreq: changefreqMatch ? changefreqMatch[1] : 'monthly',
                priority: priorityMatch ? priorityMatch[1] : '0.5'
            });
        }
    }

    return urls;
}

/**
 * Generate sitemap XML
 */
function generateSitemapXml(urls) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Sort URLs: homepage first, then calculators, then blog
    urls.sort((a, b) => {
        const aPath = a.loc.replace('https://financecalc.cc', '');
        const bPath = b.loc.replace('https://financecalc.cc', '');

        // Homepage first
        if (aPath === '/') return -1;
        if (bPath === '/') return 1;

        // Calculators before blog
        if (aPath.includes('/calculators/') && !bPath.includes('/calculators/')) return -1;
        if (!aPath.includes('/calculators/') && bPath.includes('/calculators/')) return 1;

        // Alphabetical within categories
        return aPath.localeCompare(bPath);
    });

    urls.forEach(url => {
        xml += `
  <url>
    <loc>${url.loc}</loc>`;
        if (url.lastmod) {
            xml += `
    <lastmod>${url.lastmod}</lastmod>`;
        }
        xml += `
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
    });

    xml += `
</urlset>
`;

    return xml;
}

/**
 * Get all blog HTML files
 */
function getBlogFiles() {
    const files = [];

    if (!fs.existsSync(BLOG_DIR)) {
        return files;
    }

    // Get only top-level HTML files (not language subdirectories)
    const items = fs.readdirSync(BLOG_DIR);
    items.forEach(item => {
        if (item.endsWith('.html') && item !== 'index.html') {
            const fullPath = path.join(BLOG_DIR, item);
            const stat = fs.statSync(fullPath);
            files.push({
                filename: item,
                path: fullPath,
                mtime: stat.mtime
            });
        }
    });

    return files;
}

/**
 * Extract title from HTML file
 */
function extractTitle(htmlContent) {
    const h1Match = /<h1[^>]*>(.*?)<\/h1>/i.exec(htmlContent);
    if (h1Match) {
        return h1Match[1].replace(/<[^>]+>/g, '').trim();
    }

    const titleMatch = /<title[^>]*>(.*?)\|/i.exec(htmlContent);
    if (titleMatch) {
        return titleMatch[1].trim();
    }

    return 'Untitled';
}

/**
 * Extract category from HTML file
 */
function extractCategory(htmlContent) {
    const categoryMatch = /<span class="article-category">(.*?)<\/span>/i.exec(htmlContent);
    if (categoryMatch) {
        return categoryMatch[1].trim();
    }
    return 'General';
}

/**
 * Extract intro/description from HTML file
 */
function extractIntro(htmlContent) {
    const introMatch = /<p class="article-intro">(.*?)<\/p>/i.exec(htmlContent);
    if (introMatch) {
        return introMatch[1].replace(/<[^>]+>/g, '').trim();
    }

    const metaMatch = /<meta name="description" content="(.*?)"/i.exec(htmlContent);
    if (metaMatch) {
        return metaMatch[1].trim();
    }

    return '';
}

/**
 * Extract reading time from HTML file
 */
function extractReadingTime(htmlContent) {
    const timeMatch = /(\d+)\s*min\s*read/i.exec(htmlContent);
    if (timeMatch) {
        return timeMatch[1];
    }
    return '5';
}

/**
 * Update sitemap with new blog articles
 */
function updateSitemap(blogFiles) {
    // Read existing sitemap
    let existingUrls = [];
    if (fs.existsSync(SITEMAP_PATH)) {
        const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
        existingUrls = parseSitemap(sitemapContent);
    }

    // Create a map of existing URLs
    const urlMap = new Map();
    existingUrls.forEach(url => {
        urlMap.set(url.loc, url);
    });

    // Add/update blog article URLs
    const today = new Date().toISOString().split('T')[0];
    let addedCount = 0;
    let updatedCount = 0;

    blogFiles.forEach(file => {
        const url = `https://financecalc.cc/blog/${file.filename}`;
        const existingEntry = urlMap.get(url);

        if (existingEntry) {
            // Update lastmod if file was modified
            existingEntry.lastmod = today;
            updatedCount++;
        } else {
            // Add new entry
            urlMap.set(url, {
                loc: url,
                lastmod: today,
                changefreq: 'monthly',
                priority: '0.8'
            });
            addedCount++;
        }
    });

    // Update blog index lastmod
    const blogIndexUrl = 'https://financecalc.cc/blog/';
    if (urlMap.has(blogIndexUrl)) {
        urlMap.get(blogIndexUrl).lastmod = today;
    }

    // Generate new sitemap
    const urls = Array.from(urlMap.values());
    const newSitemapXml = generateSitemapXml(urls);

    // Write sitemap
    fs.writeFileSync(SITEMAP_PATH, newSitemapXml);

    return { addedCount, updatedCount, totalUrls: urls.length };
}

/**
 * Generate blog card HTML for index
 */
function generateBlogCardHtml(article) {
    // Map category to emoji
    const categoryEmojis = {
        'Retirement': '📋',
        'Home Buying': '🏠',
        'Mortgages': '🔑',
        'Debt Payoff': '💳',
        'Savings': '🛡️',
        'Taxes': '📝',
        'Investing': '📈',
        'Student Loans': '🎓',
        'Auto Loans': '🚗',
        'Economy': '📊',
        'General': '📰'
    };

    const emoji = categoryEmojis[article.category] || '📰';

    return `
                    <!-- Article: ${article.title} -->
                    <a href="${article.filename}" class="blog-card">
                        <div class="blog-card-image">${emoji}</div>
                        <div class="blog-card-content">
                            <div class="blog-card-meta">
                                <span class="blog-card-category">${article.category}</span>
                                <span>${article.readingTime} <span data-i18n="blog.minRead">min read</span></span>
                            </div>
                            <h2>${escapeHtml(article.title)}</h2>
                            <p>${escapeHtml(article.intro)}</p>
                            <span class="blog-card-link" data-i18n="blog.readMore">Read More →</span>
                        </div>
                    </a>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Update blog index page
 */
function updateBlogIndex(blogFiles) {
    if (!fs.existsSync(BLOG_INDEX_PATH)) {
        console.log('Blog index not found, skipping index update');
        return { success: false, reason: 'index not found' };
    }

    // Read existing index
    let indexContent = fs.readFileSync(BLOG_INDEX_PATH, 'utf8');

    // Extract article information from each blog file
    const articles = blogFiles.map(file => {
        const content = fs.readFileSync(file.path, 'utf8');
        return {
            filename: file.filename,
            title: extractTitle(content),
            category: extractCategory(content),
            intro: extractIntro(content),
            readingTime: extractReadingTime(content),
            mtime: file.mtime
        };
    });

    // Sort by modification time (newest first)
    articles.sort((a, b) => b.mtime - a.mtime);

    // Generate cards HTML
    const cardsHtml = articles.map(article => generateBlogCardHtml(article)).join('\n');

    // Find and replace the blog posts section
    const postsRegex = /(<div class="blog-posts">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/;
    const match = postsRegex.exec(indexContent);

    if (match) {
        const newContent = match[1] + cardsHtml + '\n                ' + match[3];
        indexContent = indexContent.replace(postsRegex, newContent);
        fs.writeFileSync(BLOG_INDEX_PATH, indexContent);
        return { success: true, articleCount: articles.length };
    }

    return { success: false, reason: 'could not find blog-posts section' };
}

/**
 * Main function
 */
async function main() {
    console.log('='.repeat(60));
    console.log('Sitemap Updater');
    console.log('='.repeat(60));
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log();

    // Get blog files
    const blogFiles = getBlogFiles();
    console.log(`Found ${blogFiles.length} blog articles`);

    if (blogFiles.length === 0) {
        console.log('No blog articles found.');
        return;
    }

    // List articles
    console.log('\nBlog articles:');
    blogFiles.forEach(file => {
        console.log(`  - ${file.filename}`);
    });

    // Update sitemap
    console.log('\nUpdating sitemap.xml...');
    const sitemapResult = updateSitemap(blogFiles);
    console.log(`  Added: ${sitemapResult.addedCount}`);
    console.log(`  Updated: ${sitemapResult.updatedCount}`);
    console.log(`  Total URLs: ${sitemapResult.totalUrls}`);

    // Update blog index
    console.log('\nUpdating blog index...');
    const indexResult = updateBlogIndex(blogFiles);
    if (indexResult.success) {
        console.log(`  Updated with ${indexResult.articleCount} articles`);
    } else {
        console.log(`  Skipped: ${indexResult.reason}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Done!');
    console.log('='.repeat(60));

    console.log('\nNext steps:');
    console.log('  1. Review the changes');
    console.log('  2. Run publish.js to deploy');
}

// Export for use as module
module.exports = {
    main,
    updateSitemap,
    updateBlogIndex,
    parseSitemap,
    generateSitemapXml,
    getBlogFiles
};

// Run if called directly
if (require.main === module) {
    main().catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
}
