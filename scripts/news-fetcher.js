#!/usr/bin/env node
/**
 * News Fetcher Module
 * Fetches financial news from RSS feeds and NewsAPI
 * Outputs JSON files for AI article generation
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'news-sources.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'news');

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

    // Fetch from RSS feeds
    console.log('Fetching RSS feeds...');
    for (const feed of config.rssFeeds) {
        try {
            console.log(`  - ${feed.name}...`);
            const response = await fetchUrl(feed.url);
            if (response.statusCode === 200) {
                const articles = parseRssFeed(response.data, feed.name);
                console.log(`    Found ${articles.length} articles`);
                allArticles = allArticles.concat(articles);
            } else {
                console.log(`    Failed: HTTP ${response.statusCode}`);
            }
        } catch (err) {
            console.log(`    Error: ${err.message}`);
        }
    }

    // Fetch from NewsAPI
    console.log('\nFetching from NewsAPI...');
    const newsApiArticles = await fetchNewsApi(config.newsApiKey, config.keywords);
    console.log(`  Found ${newsApiArticles.length} articles`);
    allArticles = allArticles.concat(newsApiArticles);

    // Deduplicate
    console.log('\nProcessing articles...');
    const uniqueArticles = deduplicateArticles(allArticles);
    console.log(`  Unique articles: ${uniqueArticles.length}`);

    // Score and categorize
    const scoredArticles = uniqueArticles.map(article => ({
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
        totalFetched: allArticles.length,
        totalUnique: uniqueArticles.length,
        totalSelected: topArticles.length,
        byTopic,
        articles: topArticles
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
