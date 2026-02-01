/**
 * SEO Enhancement Script for FinanceCalc.cc
 * Handles dynamic schema injection, performance optimization, and analytics
 * Enhanced with multilingual SEO support
 */

(function() {
    'use strict';

    // Supported languages configuration
        const SUPPORTED_LANGUAGES = {
        en: { locale: 'en_US', name: 'English' },
        es: { locale: 'es_ES', name: 'Español' },
        zh: { locale: 'zh_CN', name: '中文' },
        de: { locale: 'de_DE', name: 'Deutsch' },
        fr: { locale: 'fr_FR', name: 'Français' },
        pt: { locale: 'pt_BR', name: 'Português' },
        ja: { locale: 'ja_JP', name: '日本語' },
        ko: { locale: 'ko_KR', name: '한국어' },
        ar: { locale: 'ar_SA', name: 'العربية' },
        hi: { locale: 'hi_IN', name: 'हिन्दी' },
        ru: { locale: 'ru_RU', name: 'Русский' }
    };

    const BASE_URL = 'https://financecalc.cc';
    const DEFAULT_LANG = 'en';

    /**
     * Get current language from I18n system or URL
     */
    function getCurrentLanguage() {
        const path = window.location.pathname;
        const blogMatch = path.match(/^\/blog\/([a-z]{2})\//);
        if (blogMatch && SUPPORTED_LANGUAGES[blogMatch[1]]) {
            return blogMatch[1];
        }

        const pathMatch = path.match(/^\/([a-z]{2})\//);
        if (pathMatch && SUPPORTED_LANGUAGES[pathMatch[1]]) {
            return pathMatch[1];
        }

        if (typeof I18n !== 'undefined' && I18n.currentLang && SUPPORTED_LANGUAGES[I18n.currentLang]) {
            return I18n.currentLang;
        }

        return DEFAULT_LANG;
    }

    /**
     * Inject hreflang tags for supported blog translations only
     */
    function injectHreflangTags() {
        const existing = document.querySelectorAll('link[rel="alternate"][hreflang]');
        if (existing.length > 0) {
            return;
        }

        const currentPath = window.location.pathname;
        const blogIndexMatch = currentPath.match(/^\/blog\/(?:([a-z]{2})\/)?(?:index\.html)?$/);
        if (!blogIndexMatch) {
            return;
        }

        Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = lang;
            link.href = lang === DEFAULT_LANG
                ? `${BASE_URL}/blog/`
                : `${BASE_URL}/blog/${lang}/`;
            document.head.appendChild(link);
        });

        const xDefault = document.createElement('link');
        xDefault.rel = 'alternate';
        xDefault.hreflang = 'x-default';
        xDefault.href = `${BASE_URL}/blog/`;
        document.head.appendChild(xDefault);
    }

    /**
     * Update canonical URL based on current language
     * Requirements: 6.1, 6.4
     */
    function updateCanonicalUrl() {
        const currentPath = window.location.pathname;
        const canonicalUrl = BASE_URL + currentPath;

        // Update or create canonical link
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = canonicalUrl;
    }

    /**
     * Update Open Graph tags for current language
     * Requirements: 3.1, 3.3
     */
    function updateOpenGraphForLanguage() {
        const currentLang = getCurrentLanguage();
        const langConfig = SUPPORTED_LANGUAGES[currentLang] || SUPPORTED_LANGUAGES[DEFAULT_LANG];

        // Update og:locale
        updateMetaTag('og:locale', langConfig.locale);

        // Try to get localized title and description from I18n
        if (typeof I18n !== 'undefined' && I18n.isLoaded && I18n.t) {
            const seoTitle = I18n.t('seo.home.title');
            const seoDesc = I18n.t('seo.home.description');

            if (seoTitle && seoTitle !== 'seo.home.title') {
                updateMetaTag('og:title', seoTitle);
                updateMetaTag('twitter:title', seoTitle);
            }

            if (seoDesc && seoDesc !== 'seo.home.description') {
                updateMetaTag('og:description', seoDesc);
                updateMetaTag('twitter:description', seoDesc);
            }
        }
    }

    /**
     * Helper to update or create meta tags
     */
    function updateMetaTag(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.querySelector(`meta[name="${property}"]`);
        }
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }

    // Organization Schema - Site-wide (with language support)
    function getOrganizationSchema() {
        const currentLang = getCurrentLanguage();
        const schema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "FinCalc",
            "url": "https://financecalc.cc",
            "logo": "https://financecalc.cc/favicon.svg",
            "description": "Free online financial calculators for mortgage, loan, investment, and retirement planning.",
            "sameAs": [],
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://financecalc.cc"
            }
        };

        // Add inLanguage for non-English pages
        if (currentLang !== DEFAULT_LANG) {
            schema.inLanguage = currentLang;
        }

        return schema;
    }

    // Inject Organization Schema on all pages
    function injectOrganizationSchema() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(getOrganizationSchema());
        document.head.appendChild(script);
    }

    function getWebSiteSchema() {
        const currentLang = getCurrentLanguage();
        const schema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "FinCalc",
            "url": BASE_URL + '/'
        };

        if (currentLang !== DEFAULT_LANG) {
            schema.inLanguage = currentLang;
        }

        return schema;
    }

    function injectWebSiteSchema() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(getWebSiteSchema());
        document.head.appendChild(script);
    }

    // Generate Breadcrumb Schema based on current URL (with language support)
    function generateBreadcrumbSchema() {
        const path = window.location.pathname;
        const currentLang = getCurrentLanguage();
        const rootLangMatch = path.match(/^\/([a-z]{2})\//);
        const rootLang = rootLangMatch && SUPPORTED_LANGUAGES[rootLangMatch[1]] ? rootLangMatch[1] : null;

        // Get localized names
        let homeName = 'Home';
        let calculatorsName = 'Calculators';
        let blogName = 'Blog';
        let guidesName = 'Guides';

        if (typeof I18n !== 'undefined' && I18n.isLoaded && I18n.t) {
            const homeTranslation = I18n.t('nav.home');
            const calcTranslation = I18n.t('nav.calculators');
            const blogTranslation = I18n.t('nav.blog');
            const guidesTranslation = I18n.t('nav.guides');

            if (homeTranslation && homeTranslation !== 'nav.home') homeName = homeTranslation;
            if (calcTranslation && calcTranslation !== 'nav.calculators') calculatorsName = calcTranslation;
            if (blogTranslation && blogTranslation !== 'nav.blog') blogName = blogTranslation;
            if (guidesTranslation && guidesTranslation !== 'nav.guides') guidesName = guidesTranslation;
        }

        const breadcrumbs = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": []
        };

        // Add inLanguage for non-English pages
        if (currentLang !== DEFAULT_LANG) {
            breadcrumbs.inLanguage = currentLang;
        }

        // Home is always first
        const homeUrl = rootLang
            ? `https://financecalc.cc/${rootLang}/`
            : "https://financecalc.cc/";

        breadcrumbs.itemListElement.push({
            "@type": "ListItem",
            "position": 1,
            "name": homeName,
            "item": homeUrl
        });

        if (path.includes('/calculators/')) {
            const calcUrl = rootLang
                ? `https://financecalc.cc/${rootLang}/#calculators`
                : "https://financecalc.cc/#calculators";

            breadcrumbs.itemListElement.push({
                "@type": "ListItem",
                "position": 2,
                "name": calculatorsName,
                "item": calcUrl
            });

            // Get calculator name from title
            const title = document.title.split(' - ')[0] || 'Calculator';
            breadcrumbs.itemListElement.push({
                "@type": "ListItem",
                "position": 3,
                "name": title,
                "item": "https://financecalc.cc" + path
            });
        } else if (path.includes('/blog/')) {
            const blogLangMatch = path.match(/^\/blog\/([a-z]{2})\//);
            const blogUrl = blogLangMatch
                ? `https://financecalc.cc/blog/${blogLangMatch[1]}/`
                : "https://financecalc.cc/blog/";

            breadcrumbs.itemListElement.push({
                "@type": "ListItem",
                "position": 2,
                "name": blogName,
                "item": blogUrl
            });

            if (path !== '/blog/' && path !== '/blog/index.html' && !path.match(/^\/blog\/[a-z]{2}\/$/)) {
                const title = document.title.split(' | ')[0] || 'Article';
                breadcrumbs.itemListElement.push({
                    "@type": "ListItem",
                    "position": 3,
                    "name": title,
                    "item": "https://financecalc.cc" + path
                });
            }
        } else if (path.startsWith('/guides/')) {
            const guidesUrl = "https://financecalc.cc/guides/";
            breadcrumbs.itemListElement.push({
                "@type": "ListItem",
                "position": 2,
                "name": guidesName,
                "item": guidesUrl
            });

            if (path !== '/guides/' && path !== '/guides/index.html') {
                const title = document.title.split(' | ')[0] || 'Guide';
                breadcrumbs.itemListElement.push({
                    "@type": "ListItem",
                    "position": 3,
                    "name": title,
                    "item": "https://financecalc.cc" + path
                });
            }
        } else if (['/editorial.html', '/methodology.html', '/privacy.html', '/terms.html'].includes(path)) {
            const title = document.title.split(' | ')[0] || 'Page';
            breadcrumbs.itemListElement.push({
                "@type": "ListItem",
                "position": 2,
                "name": title,
                "item": "https://financecalc.cc" + path
            });
        }

        if (breadcrumbs.itemListElement.length > 1) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(breadcrumbs);
            document.head.appendChild(script);
        }
    }

    // Lazy load images
    function setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    // Preload critical resources
    function preloadCriticalResources() {
        // Preload fonts
        const usesInter = document.querySelector('link[href*="fonts.googleapis.com"][href*="Inter"]');
        if (!usesInter) {
            return;
        }
        const fontPreload = document.createElement('link');
        fontPreload.rel = 'preload';
        fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
        fontPreload.as = 'style';
        document.head.appendChild(fontPreload);
    }

    // Track scroll depth for analytics
    function trackScrollDepth() {
        if (typeof gtag !== 'function') return;

        let maxScroll = 0;
        const milestones = [25, 50, 75, 100];
        const tracked = new Set();

        window.addEventListener('scroll', function() {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;

                milestones.forEach(milestone => {
                    if (maxScroll >= milestone && !tracked.has(milestone)) {
                        tracked.add(milestone);
                        gtag('event', 'scroll_depth', {
                            'event_category': 'engagement',
                            'event_label': milestone + '%',
                            'value': milestone
                        });
                    }
                });
            }
        }, { passive: true });
    }

    // Track calculator usage
    function trackCalculatorUsage() {
        if (typeof gtag !== 'function') return;

        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                const calculatorName = document.title.split(' - ')[0] || 'Calculator';
                gtag('event', 'calculator_use', {
                    'event_category': 'calculator',
                    'event_label': calculatorName
                });
            });
        });

        // Track calculate button clicks
        document.querySelectorAll('.btn, button[type="submit"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const calculatorName = document.title.split(' - ')[0] || 'Calculator';
                gtag('event', 'calculate_click', {
                    'event_category': 'calculator',
                    'event_label': calculatorName
                });
            });
        });
    }

    // Track outbound links (affiliate tracking)
    function trackOutboundLinks() {
        if (typeof gtag !== 'function') return;

        document.querySelectorAll('a[href^="http"]').forEach(link => {
            if (!link.href.includes('financecalc.cc')) {
                link.addEventListener('click', function() {
                    gtag('event', 'outbound_click', {
                        'event_category': 'outbound',
                        'event_label': link.href,
                        'transport_type': 'beacon'
                    });
                });
            }
        });
    }

    // Track internal link clicks (calculator/article CTAs)
    function trackInternalLinks() {
        if (typeof gtag !== 'function') return;

        document.querySelectorAll('a.internal-link, a[href*="/calculators/"], a[href*="/blog/"].related-card').forEach(link => {
            link.addEventListener('click', function() {
                const href = this.getAttribute('href') || '';
                const isCalculator = href.includes('/calculators/');
                gtag('event', 'internal_link_click', {
                    'event_category': isCalculator ? 'calculator_cta' : 'article_cta',
                    'event_label': href,
                    'value': 1
                });
            });
        });
    }

    // Add table of contents to long articles
    function generateTableOfContents() {
        const article = document.querySelector('.article-content');
        if (!article) return;

        const headings = article.querySelectorAll('h2');
        if (headings.length < 3) return;

        const toc = document.createElement('nav');
        toc.className = 'table-of-contents';
        toc.innerHTML = '<h4>Table of Contents</h4>';

        const list = document.createElement('ol');

        headings.forEach((heading, index) => {
            const id = 'section-' + (index + 1);
            heading.id = id;

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + id;
            a.textContent = heading.textContent;
            li.appendChild(a);
            list.appendChild(li);
        });

        toc.appendChild(list);

        // Insert after article intro
        const intro = article.querySelector('h2');
        if (intro) {
            intro.parentNode.insertBefore(toc, intro);
        }
    }

    // Smooth scroll for anchor links
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Initialize all SEO enhancements
    function init() {
        injectOrganizationSchema();
        injectWebSiteSchema();
        generateBreadcrumbSchema();
        injectHreflangTags();
        updateCanonicalUrl();
        updateOpenGraphForLanguage();
        setupLazyLoading();
        preloadCriticalResources();
        trackScrollDepth();
        trackCalculatorUsage();
        trackOutboundLinks();
        trackInternalLinks();
        generateTableOfContents();
        setupSmoothScroll();

        // Listen for language changes
        document.addEventListener('languageChange', function(e) {
            injectHreflangTags();
            updateCanonicalUrl();
            updateOpenGraphForLanguage();
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


