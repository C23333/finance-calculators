#!/usr/bin/env node
/**
 * HTML Builder Module
 * Converts AI-generated JSON articles into HTML pages
 * Uses existing blog template format
 */

const fs = require('fs');
const path = require('path');

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const TEMPLATE_PATH = path.join(PROJECT_ROOT, 'templates', 'blog-article.html');
const BLOG_DIR = path.join(PROJECT_ROOT, 'blog');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output', 'articles');
const CONFIG_DIR = path.join(PROJECT_ROOT, 'config');

/**
 * Load HTML template
 */
function loadTemplate() {
    if (fs.existsSync(TEMPLATE_PATH)) {
        return fs.readFileSync(TEMPLATE_PATH, 'utf8');
    }

    // Return default template based on existing blog structure
    return getDefaultTemplate();
}

/**
 * Get default template based on existing blog structure
 */
function getDefaultTemplate() {
    return `<!DOCTYPE html>
<html lang="en" data-theme="auto">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Theme color for mobile browsers -->
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)">

    <!-- Prevent flash of wrong theme -->
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

    <!-- Force HTTPS -->
    <script>if(location.protocol !== 'https:' && location.hostname !== 'localhost'){location.replace('https:' + location.href.substring(location.protocol.length));}</script>

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

    <!-- Open Graph -->
    <meta property="og:title" content="{{TITLE}}">
    <meta property="og:description" content="{{META_DESCRIPTION}}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://financecalc.cc/blog/{{SLUG}}.html">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9483557811977052" crossorigin="anonymous"></script>

    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-QFTQMV9QP7"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-QFTQMV9QP7');
    </script>

    <!-- Structured Data - Article -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "{{TITLE}}",
        "description": "{{META_DESCRIPTION}}",
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
        "datePublished": "{{PUBLISH_DATE}}",
        "dateModified": "{{MODIFIED_DATE}}",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://financecalc.cc/blog/{{SLUG}}.html"
        }
    }
    </script>

    {{FAQ_SCHEMA}}

    <!-- SEO Enhancement Script -->
    <script src="/js/seo.js" defer></script>

    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/blog.css">
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <header>
        <nav class="container">
            <a href="/" class="logo">FinCalc</a>
            <button class="mobile-menu-toggle" aria-label="Toggle menu" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-links">
                <li><a href="/#calculators">Calculators</a></li>
                <li><a href="/blog/" class="active">Blog</a></li>
                <li><a href="/#about">About</a></li>
            </ul>
            <div class="nav-controls">
                <!-- Language selector and theme toggle will be injected by JS -->
            </div>
        </nav>
    </header>

    <main id="main-content" class="article-page">
        <div class="article-container">
            <nav class="breadcrumb">
                <a href="/">Home</a> <span>/</span> <a href="/blog/">Blog</a> <span>/</span> <span>{{BREADCRUMB_TITLE}}</span>
            </nav>

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

            {{RELATED_ARTICLES}}
        </div>
    </main>

    <footer>
        <div class="container">
            <p>© 2026 FinCalc. All rights reserved.</p>
            <p class="footer-links">
                <a href="/privacy.html">Privacy Policy</a>
                <a href="/terms.html">Terms of Service</a>
            </p>
            <p class="disclaimer">Disclaimer: This content is for informational purposes only. Consult a qualified financial advisor for personalized advice.</p>
            <div class="friend-links">
                <span data-i18n="footer.friendLinks">Friend Links:</span>
                <a href="https://qrmaker.life/" target="_blank" rel="noopener" data-i18n="footer.qrmaker">QR Code Generator</a>
            </div>
        </div>
    </footer>

    <!-- Theme Manager -->
    <script src="../js/theme.js"></script>
    <!-- Internationalization -->
    <script src="../js/i18n.js"></script>
    <!-- Mobile menu toggle -->
    <script>
        document.querySelector('.mobile-menu-toggle')?.addEventListener('click', function() {
            this.classList.toggle('active');
            this.setAttribute('aria-expanded', this.classList.contains('active'));
            document.querySelector('.nav-links')?.classList.toggle('open');
        });
    </script>
</body>
</html>`;
}

/**
 * Generate FAQ Schema JSON-LD
 */
function generateFaqSchema(faqs) {
    if (!faqs || faqs.length === 0) {
        return '';
    }

    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return `
    <!-- Structured Data - FAQ -->
    <script type="application/ld+json">
    ${JSON.stringify(schema, null, 4)}
    </script>`;
}

/**
 * Generate related articles HTML
 */
function generateRelatedArticlesHtml(relatedArticles) {
    if (!relatedArticles || relatedArticles.length === 0) {
        return '';
    }

    const articlesHtml = relatedArticles.map(article => `
                    <a href="${article.path}" class="related-card">
                        <h4>${escapeHtml(article.title)}</h4>
                        <p>${escapeHtml(article.description)}</p>
                    </a>`).join('\n');

    return `
            <div class="related-articles">
                <h3>Related Articles</h3>
                <div class="related-grid">
${articlesHtml}
                </div>
            </div>`;
}

/**
 * Generate calculator CTA HTML
 */
function generateCalculatorCtaHtml(calculator, insertIndex = 0) {
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
    if (!tools || tools.length === 0) {
        return '';
    }

    const toolsHtml = tools.map(tool =>
        `                        <li><a href="${tool.path}">${escapeHtml(tool.name)}</a> - ${escapeHtml(tool.description)}</li>`
    ).join('\n');

    return `
                    <div class="related-tools">
                        <h3>📊 Related Calculators</h3>
                        <ul>
${toolsHtml}
                        </ul>
                    </div>
`;
}

/**
 * Generate key takeaways HTML
 */
function generateKeyTakeawaysHtml(takeaways) {
    if (!takeaways || takeaways.length === 0) {
        return '';
    }

    const items = takeaways.map(t => `                        <li>${escapeHtml(t)}</li>`).join('\n');

    return `
                    <div class="key-takeaways">
                        <h2>Key Takeaways</h2>
                        <ul>
${items}
                        </ul>
                    </div>
`;
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
 * Format date for display
 */
function formatDateDisplay(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Build article content HTML from sections
 */
function buildContentHtml(articleData) {
    const { content, cta } = articleData;
    let html = '';

    // Process sections
    if (content.sections && content.sections.length > 0) {
        content.sections.forEach((section, index) => {
            html += `
                    <h2>${escapeHtml(section.heading)}</h2>
                    ${section.content}
`;

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
        html += `
                    <h2>Conclusion</h2>
                    ${content.conclusion}
`;
    }

    return html;
}

/**
 * Build complete HTML from article data
 */
function buildHtml(articleData, template) {
    const { metadata, content, seo, cta, relatedArticles } = articleData;

    // Prepare replacements
    const replacements = {
        'TITLE': metadata.title || content.headline,
        'META_DESCRIPTION': metadata.metaDescription,
        'KEYWORDS': metadata.secondaryKeywords ? metadata.secondaryKeywords.join(', ') : '',
        'SLUG': metadata.slug,
        'PUBLISH_DATE': metadata.publishDate,
        'MODIFIED_DATE': metadata.modifiedDate || metadata.publishDate,
        'PUBLISH_DATE_DISPLAY': formatDateDisplay(metadata.publishDate),
        'CATEGORY': metadata.category,
        'READING_TIME': metadata.readingTime,
        'HEADLINE': content.headline,
        'BREADCRUMB_TITLE': metadata.title.substring(0, 30) + (metadata.title.length > 30 ? '...' : ''),
        'INTRO': content.intro ? content.intro.replace(/<\/?p>/g, '') : '',
        'CONTENT': buildContentHtml(articleData),
        'FAQ_SCHEMA': seo && seo.faqSchema ? generateFaqSchema(seo.faqSchema) : '',
        'RELATED_ARTICLES': generateRelatedArticlesHtml(relatedArticles)
    };

    // Apply replacements
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
function processArticleFile(filePath, template, outputDir) {
    console.log(`Processing: ${path.basename(filePath)}`);

    try {
        const articleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const html = buildHtml(articleData, template);

        const outputPath = path.join(outputDir, `${articleData.metadata.slug}.html`);
        fs.writeFileSync(outputPath, html);

        console.log(`  Created: ${path.basename(outputPath)}`);
        return {
            success: true,
            slug: articleData.metadata.slug,
            title: articleData.metadata.title,
            outputPath
        };
    } catch (err) {
        console.error(`  Error: ${err.message}`);
        return {
            success: false,
            error: err.message
        };
    }
}

/**
 * Main function
 */
async function main() {
    console.log('='.repeat(60));
    console.log('HTML Builder');
    console.log('='.repeat(60));
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log();

    // Load template
    const template = loadTemplate();
    console.log('Template loaded');

    // Find article JSON files
    const articlesDir = OUTPUT_DIR;
    if (!fs.existsSync(articlesDir)) {
        console.error('No articles directory found. Run the AI workflow first.');
        process.exit(1);
    }

    // Get all JSON files (recursively)
    const jsonFiles = [];
    function findJsonFiles(dir) {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                findJsonFiles(fullPath);
            } else if (item.endsWith('.json') && item.startsWith('final-')) {
                jsonFiles.push(fullPath);
            }
        });
    }
    findJsonFiles(articlesDir);

    console.log(`Found ${jsonFiles.length} article JSON files`);

    if (jsonFiles.length === 0) {
        console.log('No articles to process.');
        return;
    }

    // Process each article
    const results = [];
    jsonFiles.forEach(file => {
        const result = processArticleFile(file, template, BLOG_DIR);
        results.push(result);
    });

    // Summary
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log('\n' + '='.repeat(60));
    console.log('Summary');
    console.log('='.repeat(60));
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);

    if (successful.length > 0) {
        console.log('\nCreated files:');
        successful.forEach(r => {
            console.log(`  - ${r.slug}.html`);
        });
    }

    if (failed.length > 0) {
        console.log('\nFailed:');
        failed.forEach(r => {
            console.log(`  - ${r.error}`);
        });
    }

    console.log('\nNext steps:');
    console.log('  1. Run sitemap-updater.js to update sitemap');
    console.log('  2. Run publish.js to deploy changes');

    return results;
}

// Export for use as module
module.exports = {
    main,
    buildHtml,
    processArticleFile,
    loadTemplate,
    generateFaqSchema,
    generateRelatedArticlesHtml
};

// Run if called directly
if (require.main === module) {
    main().catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
}
