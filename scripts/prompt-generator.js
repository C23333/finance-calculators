#!/usr/bin/env node
/**
 * Prompt Generator Module
 * Generates AI prompts from fetched news for article creation
 * Prepares prompts for Claude CLI, CodeX CLI workflow
 */

const fs = require('fs');
const path = require('path');

// Paths
const CONFIG_DIR = path.join(__dirname, '..', 'config');
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const NEWS_DIR = path.join(OUTPUT_DIR, 'news');
const PROMPTS_OUTPUT_DIR = path.join(OUTPUT_DIR, 'prompts');

/**
 * Load prompt templates
 */
function loadPromptTemplates() {
    const templates = {};
    const promptsDir = path.join(CONFIG_DIR, 'prompts');

    const files = ['step1-draft.md', 'step2-review.md', 'step3-polish.md'];

    files.forEach(file => {
        const filePath = path.join(promptsDir, file);
        if (fs.existsSync(filePath)) {
            templates[file.replace('.md', '')] = fs.readFileSync(filePath, 'utf8');
        }
    });

    return templates;
}

/**
 * Load affiliate products config
 */
function loadAffiliateConfig() {
    const configPath = path.join(CONFIG_DIR, 'affiliate-products.json');
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
        console.error('Failed to load affiliate config:', err.message);
        return { topicMapping: {} };
    }
}

/**
 * Load keywords config and get suggested keywords for topic
 */
function loadKeywordsConfig() {
    const configPath = path.join(CONFIG_DIR, 'keywords.json');
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
        return { topicKeywords: {}, longTailKeywords: [] };
    }
}

/**
 * Get suggested keywords for a topic
 */
function getSuggestedKeywords(topic, keywordsConfig) {
    const topicKeywords = keywordsConfig.topicKeywords || {};
    const longTail = keywordsConfig.longTailKeywords || [];
    const normalizedTopic = (topic || '').toLowerCase().replace(/\s+/g, '');

    const topicKeyMap = {
        creditScore: 'credit',
        creditscore: 'credit',
        'studentloans': 'student loans',
        personalfinance: 'general'
    };
    const lookupKey = topicKeyMap[normalizedTopic] || (topic || '').toLowerCase();

    const topicKws = topicKeywords[lookupKey] || topicKeywords[topic] || [];
    const related = Object.entries(topicKeywords)
        .filter(([t]) => (t && lookupKey && (t.includes(lookupKey) || lookupKey.includes(t))))
        .flatMap(([, kws]) => kws || []);

    const all = [...new Set([...topicKws, ...related, ...longTail.slice(0, 5)])];
    return all.slice(0, 8).join(', ') || 'Use relevant long-tail phrases for the topic';
}

/**
 * Get the most recent news file
 */
function getLatestNewsFile() {
    if (!fs.existsSync(NEWS_DIR)) {
        return null;
    }

    const files = fs.readdirSync(NEWS_DIR)
        .filter(f => f.startsWith('news-') && f.endsWith('.json'))
        .sort()
        .reverse();

    return files.length > 0 ? path.join(NEWS_DIR, files[0]) : null;
}

/**
 * Select best articles for content generation
 */
function selectArticlesForGeneration(newsData, count = 5) {
    const articles = newsData.articles || [];

    // Group by topic and select diverse topics
    const byTopic = {};
    articles.forEach(article => {
        const topic = article.topic || 'general';
        if (!byTopic[topic]) {
            byTopic[topic] = [];
        }
        byTopic[topic].push(article);
    });

    // Select articles ensuring topic diversity
    const selected = [];
    const topics = Object.keys(byTopic);
    let topicIndex = 0;

    while (selected.length < count && topics.length > 0) {
        const topic = topics[topicIndex % topics.length];
        const topicArticles = byTopic[topic];

        if (topicArticles.length > 0) {
            selected.push(topicArticles.shift());
        } else {
            topics.splice(topicIndex % topics.length, 1);
        }

        topicIndex++;
    }

    return selected;
}

/**
 * Get calculator recommendation for topic
 */
function getCalculatorForTopic(topic, affiliateConfig) {
    const mapping = affiliateConfig.topicMapping || {};
    const topicData = mapping[topic] || mapping['general'] || {};
    const calculators = topicData.calculators || [];

    return calculators.length > 0 ? calculators[0] : {
        name: 'Financial Calculator',
        path: '/calculators/',
        description: 'Explore our financial calculators'
    };
}

/**
 * Get related calculators for topic
 */
function getRelatedCalculators(topic, affiliateConfig) {
    const mapping = affiliateConfig.topicMapping || {};
    const topicData = mapping[topic] || mapping['general'] || {};
    return topicData.calculators || [];
}

/**
 * Generate slug from title
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 60)
        .replace(/-$/, '');
}

/**
 * Generate Step 1 prompt (Claude draft)
 */
function generateStep1Prompt(article, template, affiliateConfig, keywordsConfig = {}) {
    const calculator = getCalculatorForTopic(article.topic, affiliateConfig);
    const suggestedKeywords = getSuggestedKeywords(article.topic, keywordsConfig);

    const newsSummary = `
**Title**: ${article.title}
**Source**: ${article.source}
**Published**: ${article.pubDate}
**Category**: ${article.topic}

**Summary**:
${article.description}

**Original Link**: ${article.link}
`;

    let prompt = template
        .replace('{NEWS_SUMMARY}', newsSummary)
        .replace('{TOPIC}', article.topic)
        .replace('{CALCULATOR}', calculator.name)
        .replace('{SUGGESTED_KEYWORDS}', suggestedKeywords || 'Use relevant long-tail phrases for the topic');

    return {
        type: 'step1-draft',
        article: article,
        calculator: calculator,
        prompt: prompt,
        outputFile: `draft-${generateSlug(article.title)}.md`
    };
}

/**
 * Generate Step 2 prompt (CodeX review)
 */
function generateStep2Prompt(draftContent, article, template) {
    const prompt = template.replace('{ARTICLE_DRAFT}', draftContent);

    return {
        type: 'step2-review',
        article: article,
        prompt: prompt,
        outputFile: `review-${generateSlug(article.title)}.md`
    };
}

/**
 * Generate Step 3 prompt (Claude polish)
 */
function generateStep3Prompt(reviewedContent, article, template, affiliateConfig) {
    const calculator = getCalculatorForTopic(article.topic, affiliateConfig);
    const relatedCalculators = getRelatedCalculators(article.topic, affiliateConfig);
    const dateStr = new Date().toISOString().split('T')[0];

    let prompt = template
        .replace('{REVIEWED_ARTICLE}', reviewedContent)
        .replace('{TOPIC}', article.topic)
        .replace('{CATEGORY}', capitalizeFirst(article.topic))
        .replace('{CALCULATOR}', calculator.name)
        .replace('{RELATED_CALCULATORS}', relatedCalculators.map(c => c.name).join(', '))
        .replace('{DATE}', dateStr)
        .replace('{SOURCE_TITLE}', article.title)
        .replace('{SOURCE_PUBLISHER}', article.source)
        .replace('{SOURCE_URL}', article.link)
        .replace('{SOURCE_DATE}', article.pubDate || dateStr);

    return {
        type: 'step3-polish',
        article: article,
        prompt: prompt,
        outputFile: `final-${generateSlug(article.title)}.json`
    };
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Save prompt to file
 */
function savePrompt(promptData, outputDir) {
    const filename = `${promptData.type}-${generateSlug(promptData.article.title)}.md`;
    const filePath = path.join(outputDir, filename);

    const content = `# ${promptData.type.toUpperCase()} Prompt

## Article Information
- **Title**: ${promptData.article.title}
- **Source**: ${promptData.article.source}
- **Topic**: ${promptData.article.topic}
- **Generated**: ${new Date().toISOString()}

---

${promptData.prompt}
`;

    fs.writeFileSync(filePath, content);
    return filePath;
}

/**
 * Generate batch prompt file for multiple articles
 */
function generateBatchPromptFile(articles, templates, affiliateConfig, outputDir) {
    const dateStr = new Date().toISOString().split('T')[0];
    const batchFile = path.join(outputDir, `batch-${dateStr}.md`);

    let content = `# Daily Article Generation Batch
**Date**: ${dateStr}
**Articles**: ${articles.length}

---

## Instructions

1. For each article below, run the Step 1 prompt in Claude CLI
2. Save the output to the corresponding draft file
3. Run the Step 2 prompt in CodeX CLI with the draft
4. Save the reviewed output
5. Run the Step 3 prompt in Claude CLI with the reviewed content
6. Save the final JSON output

---

`;

    articles.forEach((article, index) => {
        const calculator = getCalculatorForTopic(article.topic, affiliateConfig);

        content += `
## Article ${index + 1}: ${article.title}

**Topic**: ${article.topic}
**Source**: ${article.source}
**Target Calculator**: ${calculator.name}
**Slug**: ${generateSlug(article.title)}

### News Summary
${article.description}

### Step 1 Output File
\`output/drafts/draft-${generateSlug(article.title)}.md\`

### Step 2 Output File
\`output/drafts/review-${generateSlug(article.title)}.md\`

### Step 3 Output File
\`output/articles/final-${generateSlug(article.title)}.json\`

---

`;
    });

    fs.writeFileSync(batchFile, content);
    return batchFile;
}

/**
 * Main function
 */
async function main() {
    console.log('='.repeat(60));
    console.log('Prompt Generator');
    console.log('='.repeat(60));
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log();

    // Load templates
    console.log('Loading prompt templates...');
    const templates = loadPromptTemplates();
    console.log(`  Loaded ${Object.keys(templates).length} templates`);

    // Load affiliate config
    const affiliateConfig = loadAffiliateConfig();

    // Load keywords config
    const keywordsConfig = loadKeywordsConfig();

    // Get latest news
    const newsFile = getLatestNewsFile();
    if (!newsFile) {
        console.error('No news files found. Run news-fetcher.js first.');
        process.exit(1);
    }

    console.log(`\nLoading news from: ${path.basename(newsFile)}`);
    const newsData = JSON.parse(fs.readFileSync(newsFile, 'utf8'));
    console.log(`  Total articles: ${newsData.articles?.length || 0}`);

    // Select articles
    const articleCount = parseInt(process.argv[2]) || 5;
    const selectedArticles = selectArticlesForGeneration(newsData, articleCount);
    console.log(`  Selected for generation: ${selectedArticles.length}`);

    // Ensure output directories exist
    const dateStr = new Date().toISOString().split('T')[0];
    const promptsDir = path.join(PROMPTS_OUTPUT_DIR, dateStr);
    const draftsDir = path.join(OUTPUT_DIR, 'drafts', dateStr);

    [promptsDir, draftsDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Generate prompts for each article
    console.log('\nGenerating prompts...');
    const generatedPrompts = [];

    selectedArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title.substring(0, 50)}...`);

        // Generate Step 1 prompt
        const step1 = generateStep1Prompt(article, templates['step1-draft'], affiliateConfig, keywordsConfig);
        const step1Path = savePrompt(step1, promptsDir);
        console.log(`   Step 1: ${path.basename(step1Path)}`);

        generatedPrompts.push({
            article: article,
            slug: generateSlug(article.title),
            step1: step1Path,
            calculator: step1.calculator
        });
    });

    // Generate batch file
    console.log('\nGenerating batch file...');
    const batchPath = generateBatchPromptFile(selectedArticles, templates, affiliateConfig, PROMPTS_OUTPUT_DIR);
    console.log(`  Batch file: ${path.basename(batchPath)}`);

    // Generate summary
    const summaryPath = path.join(PROMPTS_OUTPUT_DIR, `summary-${dateStr}.json`);
    const summary = {
        generatedAt: new Date().toISOString(),
        newsFile: path.basename(newsFile),
        articleCount: selectedArticles.length,
        promptsDirectory: promptsDir,
        draftsDirectory: draftsDir,
        batchFile: batchPath,
        articles: generatedPrompts.map(p => ({
            title: p.article.title,
            topic: p.article.topic,
            slug: p.slug,
            calculator: p.calculator.name,
            step1Prompt: p.step1
        }))
    };

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`  Summary: ${path.basename(summaryPath)}`);

    // Print next steps
    console.log('\n' + '='.repeat(60));
    console.log('Next Steps:');
    console.log('='.repeat(60));
    console.log(`
1. Open the batch file for instructions:
   ${batchPath}

2. For each article, run Claude CLI with Step 1 prompt:
   cat "${promptsDir}/step1-draft-*.md" | claude

3. Save outputs to drafts directory:
   ${draftsDir}

4. Review with CodeX CLI (Step 2)
5. Final polish with Claude CLI (Step 3)
6. Run html-builder.js to generate HTML files
`);

    return summary;
}

// Export for use as module
module.exports = {
    main,
    generateStep1Prompt,
    generateStep2Prompt,
    generateStep3Prompt,
    selectArticlesForGeneration,
    generateSlug
};

// Run if called directly
if (require.main === module) {
    main().catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
}
