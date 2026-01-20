#!/usr/bin/env node
/**
 * Affiliate Matcher Module
 * Matches articles with relevant calculators and affiliate recommendations
 * Based on topic and content analysis
 */

const fs = require('fs');
const path = require('path');

// Paths
const CONFIG_DIR = path.join(__dirname, '..', 'config');
const AFFILIATE_CONFIG_PATH = path.join(CONFIG_DIR, 'affiliate-products.json');

/**
 * Load affiliate configuration
 */
function loadAffiliateConfig() {
    try {
        return JSON.parse(fs.readFileSync(AFFILIATE_CONFIG_PATH, 'utf8'));
    } catch (err) {
        console.error('Failed to load affiliate config:', err.message);
        return { topicMapping: {} };
    }
}

/**
 * Keyword patterns for topic detection
 */
const TOPIC_PATTERNS = {
    mortgage: [
        'mortgage', 'home loan', 'housing', 'home buying', 'real estate',
        'house prices', 'home value', 'down payment', 'refinance', 'housing market',
        'home equity', 'property', 'first-time homebuyer', 'pmi'
    ],
    investing: [
        'stock', 'invest', 'portfolio', 'etf', 'mutual fund', 'dividend',
        's&p 500', 'nasdaq', 'dow jones', 'bull market', 'bear market',
        'bonds', 'securities', 'brokerage', 'asset allocation'
    ],
    retirement: [
        'retirement', '401k', '401(k)', 'ira', 'roth', 'pension',
        'social security', 'retire', 'nest egg', '403b', 'sep ira',
        'required minimum distribution', 'rmd'
    ],
    debt: [
        'debt', 'credit card', 'loan payoff', 'balance transfer',
        'debt consolidation', 'debt snowball', 'debt avalanche',
        'interest rate', 'apr', 'minimum payment'
    ],
    savings: [
        'savings', 'emergency fund', 'high-yield', 'cd rates', 'money market',
        'savings account', 'save money', 'rainy day fund', 'apy'
    ],
    taxes: [
        'tax', 'irs', 'deduction', 'tax credit', 'tax return',
        'capital gains', 'tax bracket', 'w-2', 'self-employment tax',
        'tax refund', 'taxable income'
    ],
    creditScore: [
        'credit score', 'fico', 'credit report', 'credit history',
        'credit utilization', 'credit bureau', 'vantagescore'
    ],
    economy: [
        'fed', 'federal reserve', 'interest rate', 'inflation', 'recession',
        'gdp', 'employment', 'unemployment', 'economic', 'cpi',
        'monetary policy', 'rate hike', 'rate cut'
    ],
    studentLoans: [
        'student loan', 'student debt', 'college', 'university',
        'fafsa', 'loan forgiveness', 'pslf', 'income-driven repayment'
    ],
    autoLoans: [
        'car loan', 'auto loan', 'car payment', 'vehicle financing',
        'car buying', 'auto financing'
    ]
};

/**
 * Detect topic from text content
 */
function detectTopic(text) {
    const normalizedText = text.toLowerCase();
    const scores = {};

    Object.entries(TOPIC_PATTERNS).forEach(([topic, patterns]) => {
        scores[topic] = 0;
        patterns.forEach(pattern => {
            const regex = new RegExp(pattern, 'gi');
            const matches = normalizedText.match(regex);
            if (matches) {
                scores[topic] += matches.length;
            }
        });
    });

    // Get topic with highest score
    let maxTopic = 'general';
    let maxScore = 0;

    Object.entries(scores).forEach(([topic, score]) => {
        if (score > maxScore) {
            maxScore = score;
            maxTopic = topic;
        }
    });

    return {
        topic: maxTopic,
        score: maxScore,
        allScores: scores
    };
}

/**
 * Get calculator recommendations for article
 */
function getCalculatorRecommendations(topic, affiliateConfig, limit = 3) {
    const mapping = affiliateConfig.topicMapping || {};
    const topicData = mapping[topic] || mapping['general'] || {};
    const calculators = topicData.calculators || [];

    return calculators.slice(0, limit);
}

/**
 * Get affiliate recommendations for article
 */
function getAffiliateRecommendations(topic, affiliateConfig) {
    const mapping = affiliateConfig.topicMapping || {};
    const topicData = mapping[topic] || mapping['general'] || {};
    return topicData.affiliates || [];
}

/**
 * Get related articles for topic
 */
function getRelatedArticles(topic, affiliateConfig, exclude = []) {
    const relatedMap = affiliateConfig.relatedArticles || {};
    const articles = relatedMap[topic] || [];

    return articles
        .filter(article => !exclude.includes(article))
        .slice(0, 3);
}

/**
 * Match article content with recommendations
 */
function matchArticle(articleContent, options = {}) {
    const affiliateConfig = options.config || loadAffiliateConfig();
    const excludeArticles = options.excludeArticles || [];

    // Build text from article content
    let text = '';
    if (typeof articleContent === 'string') {
        text = articleContent;
    } else if (articleContent.content) {
        text = articleContent.metadata?.title || '';
        text += ' ' + (articleContent.content.headline || '');
        text += ' ' + (articleContent.content.intro || '');
        if (articleContent.content.sections) {
            articleContent.content.sections.forEach(section => {
                text += ' ' + (section.heading || '');
                text += ' ' + (section.content || '');
            });
        }
    }

    // Detect topic
    const topicResult = detectTopic(text);

    // Get recommendations
    const calculators = getCalculatorRecommendations(topicResult.topic, affiliateConfig);
    const affiliates = getAffiliateRecommendations(topicResult.topic, affiliateConfig);
    const relatedArticles = getRelatedArticles(topicResult.topic, affiliateConfig, excludeArticles);

    return {
        detectedTopic: topicResult.topic,
        topicScore: topicResult.score,
        calculators: calculators,
        affiliates: affiliates,
        relatedArticles: relatedArticles,
        allTopicScores: topicResult.allScores
    };
}

/**
 * Generate CTA HTML for calculators
 */
function generateCalculatorCta(calculator) {
    return {
        html: `<div class="calculator-cta">
    <h3>Calculate Your ${calculator.name.replace(' Calculator', '')}</h3>
    <p>${calculator.description}</p>
    <a href="${calculator.path}" class="cta-btn">${calculator.name} →</a>
</div>`,
        name: calculator.name,
        path: calculator.path
    };
}

/**
 * Generate related tools section HTML
 */
function generateRelatedToolsSection(calculators) {
    if (!calculators || calculators.length === 0) return '';

    const items = calculators.map(calc =>
        `        <li><a href="${calc.path}">${calc.name}</a> - ${calc.description}</li>`
    ).join('\n');

    return `<div class="related-tools">
    <h3>📊 Related Calculators</h3>
    <ul>
${items}
    </ul>
</div>`;
}

/**
 * Generate affiliate recommendation section HTML
 */
function generateAffiliateSection(affiliates) {
    if (!affiliates || affiliates.length === 0) return '';

    const items = affiliates.map(aff => {
        if (aff.type === 'service') {
            return `<div class="affiliate-item">
    <h4>${aff.name}</h4>
    <p>${aff.description}</p>
    <span class="cta-link">${aff.cta} →</span>
</div>`;
        }
        return '';
    }).filter(Boolean).join('\n');

    if (!items) return '';

    return `<div class="affiliate-recommendations">
    <h3>💡 Recommended Services</h3>
${items}
    <p class="affiliate-disclosure">We may earn a commission from partner links. This doesn't affect our recommendations.</p>
</div>`;
}

/**
 * Enrich article data with matched recommendations
 */
function enrichArticleData(articleData) {
    const match = matchArticle(articleData);

    // Add CTA data
    if (!articleData.cta) {
        articleData.cta = {};
    }

    articleData.cta.calculators = match.calculators.map((calc, index) => ({
        ...calc,
        insertAfterSection: index === 0 ? [1] : [] // Insert first CTA after section 1
    }));

    articleData.cta.relatedTools = match.calculators;
    articleData.cta.affiliates = match.affiliates;

    // Add related articles
    if (!articleData.relatedArticles || articleData.relatedArticles.length === 0) {
        articleData.relatedArticles = match.relatedArticles.map(articlePath => {
            const title = articlePath
                .replace('.html', '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());
            return {
                title,
                path: articlePath,
                description: `Learn more about ${title.toLowerCase()}`
            };
        });
    }

    // Update topic if not set
    if (!articleData.metadata.category) {
        articleData.metadata.category = capitalizeFirst(match.detectedTopic);
    }

    return articleData;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Main function - process article files and add recommendations
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node affiliate-matcher.js <article.json> [--enrich]');
        console.log('       node affiliate-matcher.js --analyze "text to analyze"');
        console.log('\nExamples:');
        console.log('  node affiliate-matcher.js output/articles/final-article.json');
        console.log('  node affiliate-matcher.js output/articles/final-article.json --enrich');
        console.log('  node affiliate-matcher.js --analyze "How to refinance your mortgage"');
        return;
    }

    const affiliateConfig = loadAffiliateConfig();

    // Analyze text mode
    if (args[0] === '--analyze') {
        const text = args.slice(1).join(' ');
        console.log('Analyzing text:', text.substring(0, 50) + '...\n');

        const match = matchArticle(text, { config: affiliateConfig });

        console.log('Detected Topic:', match.detectedTopic);
        console.log('Confidence Score:', match.topicScore);
        console.log('\nTopic Scores:');
        Object.entries(match.allTopicScores)
            .sort((a, b) => b[1] - a[1])
            .forEach(([topic, score]) => {
                if (score > 0) {
                    console.log(`  ${topic}: ${score}`);
                }
            });

        console.log('\nRecommended Calculators:');
        match.calculators.forEach(calc => {
            console.log(`  - ${calc.name}: ${calc.path}`);
        });

        console.log('\nRelated Articles:');
        match.relatedArticles.forEach(article => {
            console.log(`  - ${article}`);
        });

        return;
    }

    // Process article file
    const filePath = args[0];
    const shouldEnrich = args.includes('--enrich');

    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        process.exit(1);
    }

    const articleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const match = matchArticle(articleData, { config: affiliateConfig });

    console.log('='.repeat(60));
    console.log('Affiliate Matcher Results');
    console.log('='.repeat(60));
    console.log(`File: ${path.basename(filePath)}`);
    console.log(`Title: ${articleData.metadata?.title || 'Unknown'}`);
    console.log(`Detected Topic: ${match.detectedTopic}`);
    console.log(`Confidence: ${match.topicScore}`);
    console.log();

    console.log('Recommended Calculators:');
    match.calculators.forEach(calc => {
        console.log(`  - ${calc.name}`);
        console.log(`    ${calc.path}`);
    });

    console.log('\nRelated Articles:');
    match.relatedArticles.forEach(article => {
        console.log(`  - ${article}`);
    });

    if (shouldEnrich) {
        console.log('\nEnriching article data...');
        const enrichedData = enrichArticleData(articleData);

        // Save enriched data
        const outputPath = filePath.replace('.json', '-enriched.json');
        fs.writeFileSync(outputPath, JSON.stringify(enrichedData, null, 2));
        console.log(`Saved enriched data to: ${outputPath}`);
    }
}

// Export for use as module
module.exports = {
    matchArticle,
    detectTopic,
    enrichArticleData,
    getCalculatorRecommendations,
    getAffiliateRecommendations,
    generateCalculatorCta,
    generateRelatedToolsSection,
    generateAffiliateSection,
    loadAffiliateConfig
};

// Run if called directly
if (require.main === module) {
    main().catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
}
