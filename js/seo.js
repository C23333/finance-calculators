/**
 * SEO Enhancement Script for FinanceCalc.cc
 * Handles dynamic schema injection, performance optimization, and analytics
 */

(function() {
    'use strict';

    // Organization Schema - Site-wide
    const organizationSchema = {
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

    // Inject Organization Schema on all pages
    function injectOrganizationSchema() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(organizationSchema);
        document.head.appendChild(script);
    }

    // Generate Breadcrumb Schema based on current URL
    function generateBreadcrumbSchema() {
        const path = window.location.pathname;
        const breadcrumbs = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": []
        };

        // Home is always first
        breadcrumbs.itemListElement.push({
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://financecalc.cc/"
        });

        if (path.includes('/calculators/')) {
            breadcrumbs.itemListElement.push({
                "@type": "ListItem",
                "position": 2,
                "name": "Calculators",
                "item": "https://financecalc.cc/#calculators"
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
            breadcrumbs.itemListElement.push({
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://financecalc.cc/blog/"
            });

            if (path !== '/blog/' && path !== '/blog/index.html') {
                const title = document.title.split(' | ')[0] || 'Article';
                breadcrumbs.itemListElement.push({
                    "@type": "ListItem",
                    "position": 3,
                    "name": title,
                    "item": "https://financecalc.cc" + path
                });
            }
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
        generateBreadcrumbSchema();
        setupLazyLoading();
        preloadCriticalResources();
        trackScrollDepth();
        trackCalculatorUsage();
        trackOutboundLinks();
        generateTableOfContents();
        setupSmoothScroll();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
