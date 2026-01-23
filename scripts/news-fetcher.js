#!/usr/bin/env node
/**
 * News Fetcher Module
 * Fetches financial news from RSS feeds and NewsAPI
 * Outputs JSON files for AI article generation
 *
 * Features:
 * - Retry mechanism with exponential backoff
 * - Health check integration
 * - Detailed logging
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Import article history module for cross-day deduplication
let articleHistory;
try {
    articleHistory = require('./article-history');
} catch (e) {
    articleHistory = null;
    console.log('Note: article-history module not available, skipping cross-day deduplication');
}

// Configuration
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'news-sources.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'news');
const HEALTH_REPORT_PATH = path.join(__dirname, '..', 'output', 'health-report.json');

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Load news sources configuration
 */
function loadConfig() {
    try {
        const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
        return JSON.parse(configData);
    } catch (err) {
        console.error('Failed to load config:', err.message);
        // Return default config
        return {
            rssFeeds: [
                { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'general' },
                { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', category: 'markets' },
                { name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', category: 'business' }
            ],
            newsApiKey: process.env.NEWS_API_KEY || '',
            maxArticlesPerSource: 10,
            keywords: ['finance', 'investing', 'mortgage', 'retirement', '401k', 'credit', 'debt', 'savings', 'stock market', 'economy']
        };
    }
}

/**
 * Load health report to check feed status
 */
function loadHealthReport() {
    try {
        if (fs.existsSync(HEALTH_REPORT_PATH)) {
            return JSON.parse(fs.readFileSync(HEALTH_REPORT_PATH, 'utf8'));
        }
    } catch (err) {
        // Ignore
    }
    return null;
}

/**
 * Filter feeds based on health status
 */
function getHealthyFeeds(feeds) {
    const report = loadHealthReport();

    if (!report || !report.details) {
        // No health report available, return all enabled feeds
        return feeds.filter(f => f.enabled !== false);
    }

    return feeds.filter(feed => {
        if (feed.enabled === false) return false;

        const healthCheck = report.details.find(r => r.url === feed.url);
        if (healthCheck && !healthCheck.healthy) {
            console.log(`  [SKIP] ${feed.name} - marked unhealthy`);
            return false;
        }
        return true;
    });
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make HTTP(S) request
 */
function fetchUrl(url, options = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const reqOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, application/json, */*',
                ...options.headers
            },
            timeout: 15000
        };

        const req = protocol.request(reqOptions, (res) => {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fetchUrl(res.headers.location, options).then(resolve).catch(reject);
                return;
            }

            let data = '';
            res.setEncoding('utf8');
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        req.end();
    });
}

/**
 * Fetch URL with retry logic and exponential backoff
 */
async function fetchUrlWithRetry(url, options = {}, retryCount = 0) {
    try {
        return await fetchUrl(url, options);
    } catch (err) {
        if (retryCount < MAX_RETRIES) {
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
            console.log(`    Retry ${retryCount + 1}/${MAX_RETRIES} after ${delay}ms...`);
            await sleep(delay);
            return fetchUrlWithRetry(url, options, retryCount + 1);
        }
        throw err;
    }
}

/**
 * Parse RSS/XML feed
 */
function parseRssFeed(xml, sourceName) {
    const articles = [];

    // Simple XML parsing for RSS items
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const titleRegex = /<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i;
    const linkRegex = /<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i;
    const descRegex = /<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i;
    const pubDateRegex = /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i;
    const categoryRegex = /<category[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/gi;

    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
        const item = match[1];

        const titleMatch = titleRegex.exec(item);
        const linkMatch = linkRegex.exec(item);
        const descMatch = descRegex.exec(item);
        const pubDateMatch = pubDateRegex.exec(item);

        // Extract categories
        const categories = [];
        let catMatch;
        while ((catMatch = categoryRegex.exec(item)) !== null) {
            categories.push(catMatch[1].trim());
        }

        if (titleMatch && linkMatch) {
            const title = cleanHtml(titleMatch[1]);
            const description = descMatch ? cleanHtml(descMatch[1]) : '';
            const link = linkMatch[1].trim();
            const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

            articles.push({
                title,
                description,
                link,
                pubDate,
                source: sourceName,
                categories
            });
        }
    }

    return articles;
}

/**
 * Clean HTML entities and tags
 */
function cleanHtml(text) {
    return text
        // 移除 HTML 标签
        .replace(/<[^>]+>/g, '')
        // 处理十六进制 HTML 实体 (&#x2018; -> ')
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        // 处理十进制 HTML 实体 (&#8216; -> ')
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
        // 常见命名实体
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&lsquo;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        .replace(/&hellip;/g, '...')
        // 清理多余空格
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Fetch from NewsAPI
 */
async function fetchNewsApi(apiKey, keywords) {
    if (!apiKey) {
        console.log('NewsAPI key not configured, skipping...');
        return [];
    }

    const articles = [];

    try {
        const query = keywords.slice(0, 5).join(' OR ');
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20`;

        const response = await fetchUrl(url, {
            headers: { 'X-Api-Key': apiKey }
        });

        if (response.statusCode === 200) {
            const data = JSON.parse(response.data);
            if (data.articles) {
                data.articles.forEach(article => {
                    articles.push({
                        title: article.title,
                        description: article.description || '',
                        link: article.url,
                        pubDate: article.publishedAt,
                        source: article.source?.name || 'NewsAPI',
                        categories: ['news']
                    });
                });
            }
        }
    } catch (err) {
        console.error('NewsAPI fetch failed:', err.message);
    }

    return articles;
}

/**
 * Score article relevance
 */
function scoreArticle(article, keywords) {
    let score = 0;
    const text = `${article.title} ${article.description}`.toLowerCase();

    keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
            score += 10;
        }
    });

    // Boost for financial keywords
    const financeKeywords = ['mortgage', 'loan', 'interest rate', '401k', 'retirement', 'investing', 'stock', 'market', 'fed', 'inflation', 'credit score', 'debt'];
    financeKeywords.forEach(kw => {
        if (text.includes(kw)) {
            score += 5;
        }
    });

    // Penalize clickbait
    const clickbaitPatterns = ['you won\'t believe', 'shocking', 'secret', 'one weird trick'];
    clickbaitPatterns.forEach(pattern => {
        if (text.includes(pattern)) {
            score -= 20;
        }
    });

    return score;
}

/**
 * Deduplicate articles by title similarity
 */
function deduplicateArticles(articles) {
    const seen = new Map();
    const unique = [];

    articles.forEach(article => {
        // Create a normalized key from title
        const key = article.title.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 50);

        if (!seen.has(key)) {
            seen.set(key, true);
            unique.push(article);
        }
    });

    return unique;
}

/**
 * Filter out articles that have already been generated (cross-day deduplication)
 * Uses article history to check source URLs and similar titles
 */
function filterAlreadyGenerated(articles) {
    if (!articleHistory) {
        return { newArticles: articles, skipped: [] };
    }

    const history = articleHistory.loadHistory();
    const newArticles = [];
    const skipped = [];

    for (const article of articles) {
        // Check if source URL was already used
        if (articleHistory.isArticleGenerated(article.link, history)) {
            const existingSlug = history.bySourceUrl[article.link];
            skipped.push({
                reason: 'already_generated',
                existingSlug,
                article
            });
            continue;
        }

        // Check for similar titles
        const similar = articleHistory.findSimilarTitle(article.title, history);
        if (similar) {
            skipped.push({
                reason: 'similar_title',
                existingSlug: similar.slug,
                similarity: similar.similarity,
                article
            });
            continue;
        }

        newArticles.push(article);
    }

    return { newArticles, skipped };
}

/**
 * Categorize article by topic
 */
function categorizeArticle(article) {
    const text = `${article.title} ${article.description}`.toLowerCase();

    const topicPatterns = {
        mortgage: ['mortgage', 'home loan', 'housing market', 'home buying', 'real estate', 'house prices'],
        investing: ['stock', 'invest', 'portfolio', 'etf', 'mutual fund', 'dividend', 's&p 500', 'nasdaq', 'dow jones'],
        retirement: ['retirement', '401k', '401(k)', 'ira', 'pension', 'social security', 'retire'],
        debt: ['debt', 'credit card', 'loan payoff', 'balance transfer', 'debt consolidation'],
        savings: ['savings', 'emergency fund', 'high-yield', 'cd rates', 'money market'],
        taxes: ['tax', 'irs', 'deduction', 'tax credit', 'tax return', 'capital gains'],
        creditScore: ['credit score', 'fico', 'credit report', 'credit history'],
        economy: ['fed', 'federal reserve', 'interest rate', 'inflation', 'recession', 'gdp', 'employment']
    };

    for (const [topic, patterns] of Object.entries(topicPatterns)) {
        for (const pattern of patterns) {
            if (text.includes(pattern)) {
                return topic;
            }
        }
    }

    return 'general';
}

/**
 * Main function
 */
async function main() {
    console.log('='.repeat(60));
    console.log('Financial News Fetcher');
    console.log('='.repeat(60));
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log();

    const config = loadConfig();
    let allArticles = [];
    let fetchStats = { success: 0, failed: 0, skipped: 0 };

    // Filter feeds based on health check
    const healthyFeeds = getHealthyFeeds(config.rssFeeds);
    const skippedCount = config.rssFeeds.filter(f => f.enabled !== false).length - healthyFeeds.length;

    if (skippedCount > 0) {
        fetchStats.skipped = skippedCount;
        console.log(`Skipped ${skippedCount} unhealthy feeds based on health report\n`);
    }

    // Fetch from RSS feeds
    console.log(`Fetching from ${healthyFeeds.length} RSS feeds...`);
    for (const feed of healthyFeeds) {
        try {
            console.log(`  - ${feed.name}...`);
            const response = await fetchUrlWithRetry(feed.url);
            if (response.statusCode === 200) {
                const articles = parseRssFeed(response.data, feed.name);
                console.log(`    ✓ Found ${articles.length} articles`);
                allArticles = allArticles.concat(articles);
                fetchStats.success++;
            } else {
                console.log(`    ✗ Failed: HTTP ${response.statusCode}`);
                fetchStats.failed++;
            }
        } catch (err) {
            console.log(`    ✗ Error: ${err.message}`);
            fetchStats.failed++;
        }
    }

    // Fetch from NewsAPI if enabled
    if (config.newsApiEnabled) {
        console.log('\nFetching from NewsAPI...');
        const newsApiArticles = await fetchNewsApi(config.newsApiKey, config.keywords);
        console.log(`  Found ${newsApiArticles.length} articles`);
        allArticles = allArticles.concat(newsApiArticles);
    } else {
        console.log('\nNewsAPI disabled, skipping...');
    }

    // Deduplicate
    console.log('\nProcessing articles...');
    const uniqueArticles = deduplicateArticles(allArticles);
    console.log(`  Unique articles (today): ${uniqueArticles.length}`);

    // Filter out already generated articles (cross-day deduplication)
    const { newArticles: filteredArticles, skipped: historySkipped } = filterAlreadyGenerated(uniqueArticles);
    if (historySkipped.length > 0) {
        console.log(`  History filter: ${historySkipped.length} skipped (already generated)`);
        // Log details of skipped articles
        historySkipped.slice(0, 3).forEach(item => {
            const reason = item.reason === 'similar_title'
                ? `similar to "${item.existingSlug}" (${item.similarity}%)`
                : `URL exists as "${item.existingSlug}"`;
            console.log(`    - Skipped: ${item.article.title.substring(0, 40)}... (${reason})`);
        });
        if (historySkipped.length > 3) {
            console.log(`    ... and ${historySkipped.length - 3} more`);
        }
    }
    console.log(`  New articles for processing: ${filteredArticles.length}`);

    // Score and categorize
    const scoredArticles = filteredArticles.map(article => ({
        ...article,
        score: scoreArticle(article, config.keywords),
        topic: categorizeArticle(article)
    }));

    // Sort by score
    scoredArticles.sort((a, b) => b.score - a.score);

    // Take top articles
    const topArticles = scoredArticles.slice(0, 20);
    console.log(`  Top articles selected: ${topArticles.length}`);

    // Group by topic
    const byTopic = {};
    topArticles.forEach(article => {
        if (!byTopic[article.topic]) {
            byTopic[article.topic] = [];
        }
        byTopic[article.topic].push(article);
    });

    console.log('\nArticles by topic:');
    Object.entries(byTopic).forEach(([topic, articles]) => {
        console.log(`  - ${topic}: ${articles.length}`);
    });

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Generate output filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const outputFile = path.join(OUTPUT_DIR, `news-${dateStr}.json`);

    // Save to JSON
    const output = {
        fetchedAt: new Date().toISOString(),
        fetchStats,
        totalFetched: allArticles.length,
        totalUnique: uniqueArticles.length,
        historyFiltered: historySkipped.length,
        totalSelected: topArticles.length,
        byTopic,
        articles: topArticles,
        skippedByHistory: historySkipped.map(item => ({
            reason: item.reason,
            existingSlug: item.existingSlug,
            title: item.article.title,
            link: item.article.link
        }))
    };

    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`\nSaved to: ${outputFile}`);

    // Print top 5 articles
    console.log('\n' + '='.repeat(60));
    console.log('Top 5 Articles:');
    console.log('='.repeat(60));
    topArticles.slice(0, 5).forEach((article, i) => {
        console.log(`\n${i + 1}. [${article.topic}] ${article.title}`);
        console.log(`   Source: ${article.source} | Score: ${article.score}`);
        console.log(`   ${article.description.substring(0, 100)}...`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('Done!');
    console.log('='.repeat(60));

    return output;
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, fetchUrl, parseRssFeed, scoreArticle };
