#!/usr/bin/env node
/**
 * HTML Builder Module (Enhanced)
 * Converts AI-generated JSON articles into HTML pages
 * Includes: Sources, Recommended Reading, Suggested Searches, Interactive Tools
 * Enhanced: OG Images, Auto Internal Links, NewsArticle Schema
 */

const fs = require('fs');
const path = require('path');

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const TEMPLATE_PATH = path.join(PROJECT_ROOT, 'templates', 'blog-article.html');
const BLOG_DIR = path.join(PROJECT_ROOT, 'blog');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output', 'articles');
const TOOLS_DIR = path.join(PROJECT_ROOT, 'tools');

// Import tool generator
let toolGenerator;
try {
    toolGenerator = require('./tool-generator');
} catch (e) {
    toolGenerator = null;
}

// Import OG image generator
let ogImageGenerator;
try {
    ogImageGenerator = require('./og-image-generator');
} catch (e) {
    ogImageGenerator = null;
}

// Keyword to calculator internal links
const KEYWORD_LINKS = {
    'mortgage calculator': '/calculators/mortgage.html',
    'mortgage payment': '/calculators/mortgage.html',
    'calculate your mortgage': '/calculators/mortgage.html',
    'refinance calculator': '/calculators/refinance.html',
    'refinance': '/calculators/refinance.html',
    '401k calculator': '/calculators/401k.html',
    '401k': '/calculators/401k.html',
    '401(k)': '/calculators/401k.html',
    'retirement calculator': '/calculators/retirement.html',
    'retirement savings': '/calculators/retirement.html',
    'social security calculator': '/calculators/social-security.html',
    'roth vs traditional': '/calculators/roth-vs-traditional.html',
    'compound interest calculator': '/calculators/compound-interest.html',
    'compound interest': '/calculators/compound-interest.html',
    'loan calculator': '/calculators/loan-payoff.html',
    'loan payment': '/calculators/loan-payoff.html',
    'amortization calculator': '/calculators/mortgage.html',
    'amortization schedule': '/calculators/mortgage.html',
    'amortization': '/calculators/mortgage.html',
    'debt payoff calculator': '/calculators/debt-payoff.html',
    'debt payoff': '/calculators/debt-payoff.html',
    'pay off debt': '/calculators/debt-payoff.html',
    'student loan calculator': '/calculators/student-loan.html',
    'student loan payoff': '/calculators/student-loan.html',
    'home affordability calculator': '/calculators/home-affordability.html',
    'home affordability': '/calculators/home-affordability.html',
    'how much house can i afford': '/calculators/home-affordability.html',
    'rent vs buy calculator': '/calculators/rent-vs-buy.html',
    'rent vs buy': '/calculators/rent-vs-buy.html',
    'savings calculator': '/calculators/savings-goal.html',
    'savings goal': '/calculators/savings-goal.html',
    'emergency fund calculator': '/calculators/emergency-fund.html',
    'investment calculator': '/calculators/investment-return.html',
    'investment returns': '/calculators/investment-return.html',
    'auto loan calculator': '/calculators/auto-loan.html',
    'car payment': '/calculators/auto-loan.html',
    'take home pay calculator': '/calculators/take-home-pay.html',
    'take-home pay': '/calculators/take-home-pay.html',
    'salary calculator': '/calculators/salary.html',
    'inflation calculator': '/calculators/inflation.html',
    'self-employment tax calculator': '/calculators/self-employment-tax.html',
    'credit card payoff': '/calculators/debt-payoff.html',
    'credit card calculator': '/calculators/debt-payoff.html'
};

/**
 * Load HTML template
 */
function loadTemplate() {
    if (fs.existsSync(TEMPLATE_PATH)) {
        return fs.readFileSync(TEMPLATE_PATH, 'utf8');
    }
    return getDefaultTemplate();
}

/**
 * Get default template
 */
function getDefaultTemplate() {
    return `<!DOCTYPE html>
<html lang="en" data-theme="auto">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)">
    <script>
        (function() {
            const theme = localStorage.getItem('fincalc-theme') || 'auto';
            const effective = theme === 'auto'
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : theme;
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.setAttribute('data-effective-theme', effective);
        })();
    </script>
    <title>{{TITLE}} | FinCalc</title>
    <meta name="description" content="{{META_DESCRIPTION}}">
    <meta name="keywords" content="{{KEYWORDS}}">
    <link rel="canonical" href="https://financecalc.cc/blog/{{SLUG}}.html">
    <script>if(location.protocol !== 'https:' && location.hostname !== 'localhost'){location.replace('https:' + location.href.substring(location.protocol.length));}</script>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta property="og:title" content="{{TITLE}}">
    <meta property="og:description" content="{{META_DESCRIPTION}}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://financecalc.cc/blog/{{SLUG}}.html">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9483557811977052" crossorigin="anonymous"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-QFTQMV9QP7"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QFTQMV9QP7');
    </script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "{{TITLE}}",
        "description": "{{META_DESCRIPTION}}",
        "author": {"@type": "Organization", "name": "FinCalc", "url": "https://financecalc.cc"},
        "publisher": {"@type": "Organization", "name": "FinCalc", "url": "https://financecalc.cc"},
        "datePublished": "{{PUBLISH_DATE}}",
        "dateModified": "{{MODIFIED_DATE}}"
    }
    </script>
    {{FAQ_SCHEMA}}
    <script src="/js/seo.js" defer></script>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/blog.css">
    <link rel="stylesheet" href="../css/interactive-tools.css">
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <header>
        <nav class="container">
            <a href="/" class="logo">FinCalc</a>
            <button class="mobile-menu-toggle" aria-label="Toggle menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
            <ul class="nav-links">
                <li><a href="/#calculators">Calculators</a></li>
                <li><a href="/blog/" class="active">Blog</a></li>
                <li><a href="/#about">About</a></li>
            </ul>
            <div class="nav-controls"></div>
        </nav>
    </header>
    <main id="main-content" class="article-page">
        <div class="article-container">
            <nav class="breadcrumb">
                <a href="/">Home</a> <span>/</span> <a href="/blog/">Blog</a> <span>/</span> <span>{{BREADCRUMB_TITLE}}</span>
            </nav>
        </div>
        <div class="article-layout">
            <div class="article-main">
                <article>
                    <header class="article-header">
                        <div class="article-meta">
                            <span class="article-category">{{CATEGORY}}</span>
                            <span>{{PUBLISH_DATE_DISPLAY}}</span>
                            <span>{{READING_TIME}}</span>
                        </div>
                        <h1>{{HEADLINE}}</h1>
                        <p class="article-intro">{{INTRO}}</p>
                    </header>
                    <div class="article-content">
                        {{CONTENT}}
                    </div>
                </article>
                {{ENGAGEMENT_SECTIONS}}
                {{RELATED_ARTICLES}}
            </div>
            <aside class="article-sidebar">
                {{SIDEBAR_TOOLS}}
            </aside>
        </div>
    </main>
    <footer>
        <div class="container">
            <p>© 2026 FinCalc. All rights reserved.</p>
            <p class="footer-links">
                <a href="/privacy.html">Privacy Policy</a>
                <a href="/terms.html">Terms of Service</a>
            </p>
            <p class="disclaimer">Disclaimer: This content is for informational purposes only.</p>
        </div>
    </footer>
    <script src="../js/theme.js"></script>
    <script src="../js/i18n.js"></script>
    <script src="../js/interactive-tools.js"></script>
    <script>
        document.querySelector('.mobile-menu-toggle')?.addEventListener('click', function() {
            this.classList.toggle('active');
            document.querySelector('.nav-links')?.classList.toggle('open');
        });
    </script>
    {{TOOL_SCRIPTS}}
</body>
</html>`;
}

/**
 * Generate FAQ Schema JSON-LD
 */
function generateFaqSchema(faqs) {
    if (!faqs || faqs.length === 0) return '';
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
        }))
    };
    return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * 生成资料来源 HTML (Sources)
 */
function generateSourcesHtml(sources) {
    if (!sources || sources.length === 0) return '';

    const sourceItems = sources.map(source => `
        <li class="source-item">
            <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
                ${escapeHtml(source.title)}
            </a>
            <span class="source-publisher">— ${escapeHtml(source.publisher)}</span>
            ${source.accessDate ? `<span class="source-date">(Accessed: ${source.accessDate})</span>` : ''}
            ${source.description ? `<span class="source-desc">${escapeHtml(source.description)}</span>` : ''}
        </li>
    `).join('');

    return `
        <div class="article-sources">
            <h3>📚 Sources</h3>
            <ul class="sources-list">
                ${sourceItems}
            </ul>
        </div>
    `;
}

/**
 * Generate disclosure / methodology block
 */
function generateDisclosureHtml(metadata) {
    if (!metadata) return '';

    const disclosure = metadata.disclosure || '';
    const methodology = metadata.methodology || '';
    const reviewedBy = metadata.reviewedBy || '';

    if (!disclosure && !methodology && !reviewedBy) return '';

    return `
        <div class="article-disclosure">
            <h3>Editorial Disclosure</h3>
            ${disclosure ? `<p>${escapeHtml(disclosure)}</p>` : ''}
            ${methodology ? `<p class="disclosure-methodology">${escapeHtml(methodology)}</p>` : ''}
            ${reviewedBy ? `<p class="disclosure-review">Reviewed by: ${escapeHtml(reviewedBy)}</p>` : ''}
            <p class="disclosure-link">
                <a href="/editorial.html">Read our Editorial Policy</a>
                <span class="disclosure-sep">|</span>
                <a href="/methodology.html">Methodology</a>
            </p>
        </div>
    `;
}

/**
 * 生成推荐阅读 HTML (Recommended Reading)
 */
function generateRecommendedReadingHtml(recommendedReading) {
    if (!recommendedReading) return '';

    let html = '<div class="recommended-reading">\n<h3>📖 Recommended Reading</h3>\n';

    // Internal articles
    if (recommendedReading.internal && recommendedReading.internal.length > 0) {
        html += '<div class="reading-section internal">\n<h4>More from FinCalc</h4>\n<ul>\n';
        recommendedReading.internal.forEach(item => {
            html += `
                <li>
                    <a href="${escapeHtml(item.path)}">${escapeHtml(item.title)}</a>
                    ${item.reason ? `<span class="reading-reason">— ${escapeHtml(item.reason)}</span>` : ''}
                </li>
            `;
        });
        html += '</ul>\n</div>\n';
    }

    // External resources
    if (recommendedReading.external && recommendedReading.external.length > 0) {
        html += '<div class="reading-section external">\n<h4>External Resources</h4>\n<ul>\n';
        recommendedReading.external.forEach(item => {
            html += `
                <li>
                    <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(item.title)}
                    </a>
                    <span class="reading-source">(${escapeHtml(item.source)})</span>
                </li>
            `;
        });
        html += '</ul>\n</div>\n';
    }

    html += '</div>\n';
    return html;
}

/**
 * 生成推荐搜索 HTML (Suggested Searches)
 */
function generateSuggestedSearchesHtml(searches) {
    if (!searches || searches.length === 0) return '';

    const searchItems = searches.map(search => {
        const searchUrl = search.searchUrl || `https://www.google.com/search?q=${encodeURIComponent(search.query)}`;
        return `
            <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="search-chip">
                <span class="search-icon">🔍</span>
                <span class="search-query">${escapeHtml(search.query)}</span>
                ${search.intent ? `<span class="search-intent">${escapeHtml(search.intent)}</span>` : ''}
            </a>
        `;
    }).join('');

    return `
        <div class="suggested-searches">
            <h3>🔍 Continue Your Research</h3>
            <p>Explore these related topics:</p>
            <div class="search-chips">
                ${searchItems}
            </div>
        </div>
    `;
}

/**
 * 生成互动工具 HTML (Interactive Tools) - 最重要！
 */
function generateInteractiveToolHtml(tool) {
    if (!tool) return '';

    const toolId = `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate inputs
    const inputsHtml = (tool.inputs || []).map(input => {
        switch (input.type) {
            case 'number':
                return `
                    <div class="tool-input-group">
                        <label for="${toolId}-${input.id}">${escapeHtml(input.label)}</label>
                        <input type="number"
                               id="${toolId}-${input.id}"
                               name="${input.id}"
                               value="${input.default || ''}"
                               ${input.min !== undefined ? `min="${input.min}"` : ''}
                               ${input.max !== undefined ? `max="${input.max}"` : ''}
                               ${input.step ? `step="${input.step}"` : ''}
                               placeholder="${input.placeholder || ''}">
                        ${input.helpText ? `<small class="input-help">${escapeHtml(input.helpText)}</small>` : ''}
                    </div>`;
            case 'select':
                const options = (input.options || []).map(opt =>
                    `<option value="${opt}" ${opt === input.default ? 'selected' : ''}>${opt}</option>`
                ).join('');
                return `
                    <div class="tool-input-group">
                        <label for="${toolId}-${input.id}">${escapeHtml(input.label)}</label>
                        <select id="${toolId}-${input.id}" name="${input.id}">${options}</select>
                    </div>`;
            case 'range':
                return `
                    <div class="tool-input-group">
                        <label for="${toolId}-${input.id}">
                            ${escapeHtml(input.label)}:
                            <span id="${toolId}-${input.id}-value">${input.default || input.min || 0}</span>
                        </label>
                        <input type="range"
                               id="${toolId}-${input.id}"
                               name="${input.id}"
                               min="${input.min || 0}"
                               max="${input.max || 100}"
                               step="${input.step || 1}"
                               value="${input.default || input.min || 0}"
                               oninput="document.getElementById('${toolId}-${input.id}-value').textContent = this.value">
                    </div>`;
            case 'boolean':
                return `
                    <div class="tool-input-group tool-checkbox">
                        <label>
                            <input type="checkbox" id="${toolId}-${input.id}" name="${input.id}">
                            ${escapeHtml(input.label)}
                        </label>
                    </div>`;
            default:
                return `
                    <div class="tool-input-group">
                        <label for="${toolId}-${input.id}">${escapeHtml(input.label)}</label>
                        <input type="text" id="${toolId}-${input.id}" name="${input.id}" value="${input.default || ''}">
                    </div>`;
        }
    }).join('\n');

    // Generate outputs
    const outputsHtml = (tool.outputs || []).map(output => `
        <div class="tool-output-item ${output.highlight ? 'highlighted' : ''}" id="${toolId}-output-${output.id}">
            <span class="output-label">${escapeHtml(output.label)}</span>
            <span class="output-value" data-format="${output.format || 'text'}">--</span>
        </div>
    `).join('\n');

    // CTA
    const ctaHtml = tool.callToAction ? `
        <a href="${escapeHtml(tool.callToAction.link)}" class="tool-cta-btn">
            ${escapeHtml(tool.callToAction.text)} →
        </a>
    ` : '';

    return `
        <div class="interactive-tool" id="${toolId}" data-tool-type="${tool.type}">
            <div class="tool-header">
                <div class="tool-badge">🧮 Interactive Tool</div>
                <h3>${escapeHtml(tool.title)}</h3>
                <p>${escapeHtml(tool.description)}</p>
            </div>
            <div class="tool-body">
                <form class="tool-form" onsubmit="return false;">
                    ${inputsHtml}
                    <button type="button" class="tool-calculate-btn" onclick="calculateTool('${toolId}')">
                        Calculate My Results →
                    </button>
                </form>
                <div class="tool-results" id="${toolId}-results" style="display: none;">
                    <h4>📊 Your Personalized Results</h4>
                    <div class="results-grid">
                        ${outputsHtml}
                    </div>
                    ${ctaHtml}
                </div>
            </div>
            <div class="tool-footer">
                <p class="tool-disclaimer">* This calculator provides estimates for educational purposes only. Results may vary based on your specific situation.</p>
            </div>
        </div>
    `;
}

/**
 * Generate tool calculation script
 */
function generateToolScript(tool, toolId) {
    if (!tool || !tool.calculation) return '';

    const calcType = tool.calculation.type || tool.type;
    let calcLogic = '';

    // Build calculation based on type
    switch (calcType) {
        case 'rate-calculator':
        case 'mortgage-comparison':
            calcLogic = `
                const inputs = getToolInputs('${toolId}');
                const principal = parseFloat(inputs.loanAmount || inputs.principal) || 300000;
                const oldRate = parseFloat(inputs.currentRate || inputs.oldRate) / 100 / 12;
                const newRate = parseFloat(inputs.newRate) / 100 / 12;
                const term = parseInt(inputs.loanTerm || inputs.term || 30) * 12;

                const calcPayment = (p, r, n) => p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                const currentPayment = calcPayment(principal, oldRate, term);
                const newPayment = calcPayment(principal, newRate, term);

                return {
                    currentPayment: formatCurrency(currentPayment),
                    newPayment: formatCurrency(newPayment),
                    monthlyIncrease: formatCurrency(newPayment - currentPayment),
                    totalDifference: formatCurrency((newPayment - currentPayment) * term)
                };`;
            break;

        case 'savings-estimator':
            calcLogic = `
                const inputs = getToolInputs('${toolId}');
                const current = parseFloat(inputs.currentMonthly || inputs.current) || 0;
                const newVal = parseFloat(inputs.newMonthly || inputs.newValue) || 0;
                const months = parseInt(inputs.months || inputs.period) || 12;
                const monthly = current - newVal;
                return {
                    monthlySavings: formatCurrency(monthly),
                    yearlySavings: formatCurrency(monthly * 12),
                    totalSavings: formatCurrency(monthly * months)
                };`;
            break;

        case 'impact-calculator':
            calcLogic = `
                const inputs = getToolInputs('${toolId}');
                const before = parseFloat(inputs.currentValue || inputs.before) || 0;
                const changeRate = parseFloat(inputs.changeRate || 5) / 100;
                const after = before * (1 + changeRate);
                return {
                    beforeValue: formatCurrency(before),
                    afterValue: formatCurrency(after),
                    difference: formatCurrency(after - before),
                    percentChange: (changeRate * 100).toFixed(1) + '%'
                };`;
            break;

        case 'eligibility-checker':
        case 'policy-checker':
            calcLogic = `
                const inputs = getToolInputs('${toolId}');
                // Simple eligibility logic - can be customized per tool
                let eligible = true;
                let reasons = [];

                if (inputs.income && parseFloat(inputs.income) > 150000) {
                    eligible = false;
                    reasons.push('Income exceeds limit');
                }
                if (inputs.creditScore && parseFloat(inputs.creditScore) < 620) {
                    eligible = false;
                    reasons.push('Credit score below minimum');
                }

                return {
                    eligible: eligible ? '✅ Yes, you likely qualify!' : '❌ You may not qualify',
                    details: reasons.length > 0 ? reasons.join(', ') : 'All criteria met',
                    recommendation: eligible ? 'Consider applying soon' : 'Work on improving your profile'
                };`;
            break;

        default:
            calcLogic = `
                const inputs = getToolInputs('${toolId}');
                return { result: 'Calculation completed', inputs: JSON.stringify(inputs) };`;
    }

    return `
<script>
(function() {
    window.toolCalculations = window.toolCalculations || {};
    window.toolCalculations['${toolId}'] = function() {
        ${calcLogic}
    };
})();
</script>`;
}

/**
 * Generate related articles HTML
 * Only includes articles that actually exist
 */
function generateRelatedArticlesHtml(relatedArticles) {
    if (!relatedArticles || relatedArticles.length === 0) return '';

    // Filter to only include articles that exist
    const existingArticles = relatedArticles.filter(article => {
        const articlePath = path.join(BLOG_DIR, path.basename(article.path));
        return fs.existsSync(articlePath);
    });

    if (existingArticles.length === 0) return '';

    const articlesHtml = existingArticles.map(article => `
        <a href="${article.path}" class="related-card">
            <h4>${escapeHtml(article.title)}</h4>
            <p>${escapeHtml(article.description)}</p>
        </a>
    `).join('\n');

    return `
        <div class="related-articles">
            <h3>Related Articles</h3>
            <div class="related-grid">${articlesHtml}</div>
        </div>
    `;
}

/**
 * Generate calculator CTA HTML
 */
function generateCalculatorCtaHtml(calculator) {
    return `
        <div class="calculator-cta">
            <h3>Calculate Your ${escapeHtml(calculator.name.replace(' Calculator', ''))}</h3>
            <p>${escapeHtml(calculator.description)}</p>
            <a href="${calculator.path}" class="cta-btn">${escapeHtml(calculator.name)} →</a>
        </div>
    `;
}

/**
 * Generate related tools HTML
 */
function generateRelatedToolsHtml(tools) {
    if (!tools || tools.length === 0) return '';

    const toolsHtml = tools.map(tool =>
        `<li><a href="${tool.path}">${escapeHtml(tool.name)}</a> - ${escapeHtml(tool.description)}</li>`
    ).join('\n');

    return `
        <div class="related-tools">
            <h3>📊 Related Calculators</h3>
            <ul>${toolsHtml}</ul>
        </div>
    `;
}

/**
 * Generate key takeaways HTML
 */
function generateKeyTakeawaysHtml(takeaways) {
    if (!takeaways || takeaways.length === 0) return '';

    const items = takeaways.map(t => `<li>${escapeHtml(t)}</li>`).join('\n');
    return `
        <div class="key-takeaways">
            <h2>Key Takeaways</h2>
            <ul>${items}</ul>
        </div>
    `;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Add internal links to content based on keywords
 * Rules:
 * - Each keyword is linked only once (first occurrence)
 * - Don't replace inside existing links or headings
 * - Add title attribute for SEO
 */
function addInternalLinks(html) {
    const linkedKeywords = new Set();

    // Sort keywords by length (longer first) to match longer phrases first
    const sortedKeywords = Object.keys(KEYWORD_LINKS).sort((a, b) => b.length - a.length);

    for (const keyword of sortedKeywords) {
        if (linkedKeywords.has(keyword.toLowerCase())) continue;

        const url = KEYWORD_LINKS[keyword];
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Match keyword not inside HTML tags or existing links
        // Negative lookbehind for <a...> and negative lookahead for </a>
        const regex = new RegExp(
            `(?<!<[^>]*)\\b(${escapedKeyword})\\b(?![^<]*<\\/a>)(?![^<]*<\\/h[1-6]>)`,
            'i'
        );

        const match = html.match(regex);
        if (match) {
            const originalText = match[1];
            const link = `<a href="${url}" title="Use our ${originalText} tool" class="internal-link">${originalText}</a>`;
            html = html.replace(regex, link);
            linkedKeywords.add(keyword.toLowerCase());
        }
    }

    return html;
}

/**
 * Generate NewsArticle schema (more appropriate for timely content)
 */
function generateNewsArticleSchema(articleData) {
    const { metadata, content } = articleData;
    const ogImagePath = `/blog/images/og/${metadata.slug}.svg`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": metadata.title || content.headline,
        "description": metadata.metaDescription,
        "image": [
            `https://financecalc.cc${ogImagePath}`
        ],
        "datePublished": metadata.publishDate,
        "dateModified": metadata.modifiedDate || metadata.publishDate,
        "author": {
            "@type": "Organization",
            "name": "FinCalc",
            "url": "https://financecalc.cc"
        },
        "publisher": {
            "@type": "Organization",
            "name": "FinCalc",
            "url": "https://financecalc.cc",
            "logo": {
                "@type": "ImageObject",
                "url": "https://financecalc.cc/favicon.svg"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://financecalc.cc/blog/${metadata.slug}.html`
        }
    };

    // Add speakable specification for voice assistants
    schema.speakable = {
        "@type": "SpeakableSpecification",
        "cssSelector": [".article-intro", ".key-takeaways"]
    };

    return schema;
}

/**
 * Format date for display
 */
function formatDateDisplay(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Format date for short display (Jan 20, 2026)
 */
function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Calculate word count from article sections
 */
function calculateWordCount(sections) {
    if (!sections || sections.length === 0) return 0;

    let totalWords = 0;
    sections.forEach(section => {
        // Count words in heading
        if (section.heading) {
            totalWords += section.heading.split(/\s+/).length;
        }
        // Count words in content (strip HTML tags first)
        if (section.content) {
            const textContent = section.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            totalWords += textContent.split(/\s+/).length;
        }
    });

    return totalWords;
}

/**
 * Format word count for display
 */
function formatWordCount(count) {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
}

/**
 * Generate category slug from category name
 */
function generateCategorySlug(category) {
    return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Get author avatar (emoji or initials)
 */
function getAuthorAvatar(authorName) {
    if (!authorName) return '👤';
    // Return first letter of each word
    const initials = authorName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    return initials || '👤';
}

/**
 * Build article content HTML from sections
 * Note: Interactive tools are now placed in sidebar, not in content
 */
function buildContentHtml(articleData) {
    const { content, cta } = articleData;
    let html = '';
    let toolScripts = '';

    // Process sections
    if (content.sections && content.sections.length > 0) {
        content.sections.forEach((section, index) => {
            html += `<h2>${escapeHtml(section.heading)}</h2>\n${section.content}\n`;

            // Insert calculator CTA after specified sections
            if (cta && cta.calculators) {
                cta.calculators.forEach(calc => {
                    if (calc.insertAfterSection && calc.insertAfterSection.includes(index)) {
                        html += generateCalculatorCtaHtml(calc);
                    }
                });
            }
        });
    }

    // Add key takeaways
    if (content.keyTakeaways) {
        html += generateKeyTakeawaysHtml(content.keyTakeaways);
    }

    // Add related tools
    if (cta && cta.relatedTools) {
        html += generateRelatedToolsHtml(cta.relatedTools);
    }

    // Add conclusion
    if (content.conclusion) {
        html += `<h2>Conclusion</h2>\n${content.conclusion}\n`;
    }

    return { html, toolScripts };
}

/**
 * Build sidebar tools HTML
 */
function buildSidebarTools(articleData) {
    const { interactiveTools, metadata } = articleData;
    let html = '';
    let toolScripts = '';

    if (interactiveTools && interactiveTools.length > 0) {
        interactiveTools.forEach((tool, index) => {
            const toolId = `tool-${metadata.slug}-${index}`;
            html += generateInteractiveToolHtml({ ...tool, id: toolId, placement: 'sidebar' });
            toolScripts += generateToolScript(tool, toolId);
        });
    }

    return { html, toolScripts };
}

/**
 * Build engagement sections (sources, reading, searches)
 * Note: Interactive tools now go in sidebar
 */
function buildEngagementSections(articleData) {
    const { sources, recommendedReading, suggestedSearches } = articleData;
    let html = '';

    // Sources section
    if (sources) {
        html += generateSourcesHtml(sources);
    }

    // Recommended reading
    if (recommendedReading) {
        html += generateRecommendedReadingHtml(recommendedReading);
    }

    // Suggested searches
    if (suggestedSearches) {
        html += generateSuggestedSearchesHtml(suggestedSearches);
    }

    return html;
}

/**
 * Build complete HTML from article data
 */
async function buildHtml(articleData, template) {
    const { metadata, content, seo, relatedArticles } = articleData;

    const contentResult = buildContentHtml(articleData);
    const engagementHtml = buildEngagementSections(articleData);
    const sidebarResult = buildSidebarTools(articleData);
    const disclosureHtml = generateDisclosureHtml(metadata);

    // Generate OG image
    let ogImagePath = `/blog/images/og/${metadata.slug}.svg`;
    if (ogImageGenerator) {
        try {
            const ogResult = await ogImageGenerator.generateOgImage(articleData, { useGemini: false });
            if (ogResult.success) {
                ogImagePath = ogResult.relativePath;
            }
        } catch (err) {
            console.log(`    OG image generation skipped: ${err.message}`);
        }
    }

    // Add internal links to content
    const contentWithLinks = addInternalLinks(contentResult.html);

    // Generate NewsArticle schema
    const newsArticleSchema = generateNewsArticleSchema(articleData);

    // Calculate word count
    const wordCount = calculateWordCount(content.sections);

    // Author info
    const authorName = metadata.author || 'FinCalc Editorial Team';
    const authorTitle = metadata.authorTitle || 'Editorial Desk';
    const authorAvatar = getAuthorAvatar(authorName);

    // Modified date display
    const modifiedDateDisplay = metadata.modifiedDate && metadata.modifiedDate !== metadata.publishDate
        ? `<span class="update-date">Updated: ${formatDateShort(metadata.modifiedDate)}</span>`
        : '';

    const replacements = {
        'TITLE': metadata.title || content.headline,
        'META_DESCRIPTION': metadata.metaDescription,
        'KEYWORDS': metadata.secondaryKeywords ? metadata.secondaryKeywords.join(', ') : '',
        'SLUG': metadata.slug,
        'PUBLISH_DATE': metadata.publishDate,
        'MODIFIED_DATE': metadata.modifiedDate || metadata.publishDate,
        'PUBLISH_DATE_DISPLAY': formatDateDisplay(metadata.publishDate),
        'PUBLISH_DATE_SHORT': formatDateShort(metadata.publishDate),
        'MODIFIED_DATE_DISPLAY': modifiedDateDisplay,
        'CATEGORY': metadata.category,
        'CATEGORY_SLUG': generateCategorySlug(metadata.category),
        'READING_TIME': metadata.readingTime,
        'WORD_COUNT': formatWordCount(wordCount),
        'WORD_COUNT_RAW': wordCount.toString(),
        'HEADLINE': content.headline,
        'BREADCRUMB_TITLE': metadata.title.substring(0, 30) + (metadata.title.length > 30 ? '...' : ''),
        'INTRO': content.intro ? content.intro.replace(/<\/?p>/g, '') : '',
        'CONTENT': contentWithLinks,
        'AUTHOR_NAME': authorName,
        'AUTHOR_TITLE': authorTitle,
        'AUTHOR_AVATAR': authorAvatar,
        'DISCLOSURE': disclosureHtml,
        'FAQ_SCHEMA': seo && seo.faqSchema ? generateFaqSchema(seo.faqSchema) : '',
        'NEWS_ARTICLE_SCHEMA': `<script type="application/ld+json">${JSON.stringify(newsArticleSchema)}</script>`,
        'ENGAGEMENT_SECTIONS': engagementHtml,
        'RELATED_ARTICLES': generateRelatedArticlesHtml(relatedArticles),
        'SIDEBAR_TOOLS': sidebarResult.html,
        'TOOL_SCRIPTS': contentResult.toolScripts + sidebarResult.toolScripts,
        'OG_IMAGE': `https://financecalc.cc${ogImagePath}`,
        'OG_IMAGE_PATH': ogImagePath
    };

    let html = template;
    Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value || '');
    });

    return html;
}

/**
 * Process a single article JSON file
 */
async function processArticleFile(filePath, template, outputDir) {
    console.log(`Processing: ${path.basename(filePath)}`);

    try {
        const articleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const html = await buildHtml(articleData, template);

        const outputPath = path.join(outputDir, `${articleData.metadata.slug}.html`);
        fs.writeFileSync(outputPath, html);

        console.log(`  ✓ Created: ${path.basename(outputPath)}`);

        // Log engagement features
        const features = [];
        if (articleData.sources?.length) features.push(`${articleData.sources.length} sources`);
        if (articleData.interactiveTools?.length) features.push(`${articleData.interactiveTools.length} tools`);
        if (articleData.suggestedSearches?.length) features.push(`${articleData.suggestedSearches.length} searches`);
        if (features.length) console.log(`    Features: ${features.join(', ')}`);

        return { success: true, slug: articleData.metadata.slug, title: articleData.metadata.title, outputPath };
    } catch (err) {
        console.error(`  ✗ Error: ${err.message}`);
        return { success: false, error: err.message };
    }
}

/**
 * Main function
 */
async function main() {
    console.log('═'.repeat(60));
    console.log('HTML Builder (Enhanced with Engagement Features)');
    console.log('═'.repeat(60));
    console.log(`Started at: ${new Date().toISOString()}\n`);

    const template = loadTemplate();
    console.log('✓ Template loaded');

    if (!fs.existsSync(OUTPUT_DIR)) {
        console.error('No articles directory found.');
        process.exit(1);
    }

    const jsonFiles = [];
    function findJsonFiles(dir) {
        fs.readdirSync(dir).forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) findJsonFiles(fullPath);
            else if (item.endsWith('.json') && item.startsWith('final-')) jsonFiles.push(fullPath);
        });
    }
    findJsonFiles(OUTPUT_DIR);

    console.log(`✓ Found ${jsonFiles.length} article files\n`);

    if (jsonFiles.length === 0) {
        console.log('No articles to process.');
        return;
    }

    // Process articles sequentially to avoid OG image generation conflicts
    const results = [];
    for (const file of jsonFiles) {
        const result = await processArticleFile(file, template, BLOG_DIR);
        results.push(result);
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log('\n' + '═'.repeat(60));
    console.log(`Summary: ${successful.length} succeeded, ${failed.length} failed`);
    console.log('═'.repeat(60));

    if (successful.length > 0) {
        console.log('\nCreated:');
        successful.forEach(r => console.log(`  ✓ ${r.slug}.html`));
    }

    console.log('\nNext: node scripts/sitemap-updater.js');
    return results;
}

module.exports = {
    main, buildHtml, processArticleFile, loadTemplate,
    generateFaqSchema, generateRelatedArticlesHtml,
    generateSourcesHtml, generateRecommendedReadingHtml,
    generateSuggestedSearchesHtml, generateInteractiveToolHtml,
    addInternalLinks, generateNewsArticleSchema, KEYWORD_LINKS,
    calculateWordCount, formatWordCount, formatDateShort,
    generateCategorySlug, getAuthorAvatar
};

if (require.main === module) {
    main().catch(err => { console.error('Error:', err); process.exit(1); });
}
