#!/usr/bin/env node
/**
 * Social Media Post Generator
 * Generates ready-to-post content for Twitter, Reddit, LinkedIn from blog articles
 * Output: Markdown file with copy-paste ready posts
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const BLOG_DIR = path.join(PROJECT_ROOT, 'blog');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output');

const BASE_URL = 'https://financecalc.cc';

function getLatestBlogArticles(limit = 5) {
    const files = [];
    if (!fs.existsSync(BLOG_DIR)) return files;

    fs.readdirSync(BLOG_DIR).forEach(item => {
        if (item.endsWith('.html') && item !== 'index.html' && !item.includes('/')) {
            const fullPath = path.join(BLOG_DIR, item);
            const stat = fs.statSync(fullPath);
            files.push({ filename: item, path: fullPath, mtime: stat.mtime });
        }
    });

    return files
        .sort((a, b) => b.mtime - a.mtime)
        .slice(0, limit);
}

function extractArticleInfo(htmlPath) {
    const content = fs.readFileSync(htmlPath, 'utf8');
    const titleMatch = /<h1[^>]*>([^<]+)<\/h1>/.exec(content) ||
        /<title[^>]*>([^|]+)\s*\|/.exec(content);
    const descMatch = /<meta name="description" content="([^"]+)"/.exec(content);
    const title = titleMatch ? titleMatch[1].trim() : 'FinCalc Article';
    const description = descMatch ? descMatch[1].trim() : '';
    const slug = path.basename(htmlPath, '.html');
    const url = `${BASE_URL}/blog/${path.basename(htmlPath)}`;
    return { title, description, slug, url };
}

function generateTwitterPost(article, maxLength = 280) {
    let text = `${article.title}\n\n${article.url}`;
    if (text.length > maxLength) {
        const maxTitleLen = maxLength - article.url.length - 4;
        text = `${article.title.substring(0, maxTitleLen)}...\n\n${article.url}`;
    }
    return text;
}

function generateRedditPost(article, subreddit = 'personalfinance') {
    const title = article.title.length > 300 ? article.title.substring(0, 297) + '...' : article.title;
    return `Subreddit: r/${subreddit}

Title:
${title}

Body (optional - or post link only):
${article.description}

${article.url}

---
Tip: Read subreddit rules before posting. Add value in comments. Don't spam.`;
}

function generateLinkedInPost(article) {
    return `${article.title}

${article.description}

Use our free calculators to plan your finances: ${article.url}

#personalfinance #financialplanning #finance`;
}

function main() {
    const args = process.argv.slice(2);
    const count = parseInt(args[0], 10) || 3;

    console.log('Social Media Post Generator');
    console.log('='.repeat(40));

    const articles = getLatestBlogArticles(count);
    if (articles.length === 0) {
        console.log('No blog articles found.');
        return;
    }

    const outputDir = path.join(OUTPUT_DIR, 'social');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const dateStr = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `posts-${dateStr}.md`);

    let content = `# Social Media Posts - ${dateStr}
Generated for FinCalc blog articles

## Instructions
- **Twitter/X**: Copy the text, stay under 280 chars
- **Reddit**: Check subreddit rules (r/personalfinance, r/investing, r/financialindependence)
- **LinkedIn**: Add personal commentary for better engagement

---

`;

    articles.forEach((file, i) => {
        const article = extractArticleInfo(file.path);
        content += `## Article ${i + 1}: ${article.title}\n\n`;
        content += `### Twitter/X\n\`\`\`\n${generateTwitterPost(article)}\n\`\`\`\n\n`;
        content += `### Reddit\n\`\`\`\n${generateRedditPost(article)}\n\`\`\`\n\n`;
        content += `### LinkedIn\n\`\`\`\n${generateLinkedInPost(article)}\n\`\`\`\n\n`;
        content += '---\n\n';
    });

    fs.writeFileSync(outputPath, content);
    console.log(`Generated: ${outputPath}`);
    console.log(`Articles: ${articles.length}`);
}

main();
