/**
 * Article Table of Contents Module
 * Auto-generates TOC from headings, highlights current section, shows reading progress
 */

(function() {
    'use strict';

    // Configuration
    const HEADING_SELECTOR = '.article-content h2, .article-content h3';
    const SCROLL_OFFSET = 100;
    const HIGHLIGHT_THRESHOLD = 0.3;

    // State
    let headings = [];
    let tocContainer = null;
    let progressBar = null;
    let observer = null;
    let activeId = null;

    /**
     * Initialize the TOC
     */
    function init() {
        const articleContent = document.querySelector('.article-content');
        tocContainer = document.querySelector('.table-of-contents');

        if (!articleContent) return;

        // Collect headings
        collectHeadings(articleContent);

        if (headings.length < 2) {
            // Not enough headings for TOC
            if (tocContainer) tocContainer.style.display = 'none';
            return;
        }

        // Generate TOC if container exists
        if (tocContainer) {
            renderToc();
            setupIntersectionObserver();
            setupProgressBar();
        }

        // Setup smooth scroll for anchor links
        setupSmoothScroll();
    }

    /**
     * Collect headings from article content
     */
    function collectHeadings(container) {
        const elements = container.querySelectorAll(HEADING_SELECTOR);

        headings = Array.from(elements).map((el, index) => {
            // Ensure heading has an ID
            if (!el.id) {
                el.id = generateId(el.textContent, index);
            }

            return {
                id: el.id,
                text: el.textContent.trim(),
                level: parseInt(el.tagName.charAt(1)),
                element: el
            };
        });
    }

    /**
     * Generate a URL-friendly ID from text
     */
    function generateId(text, index) {
        const base = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
        return `section-${base || index}`;
    }

    /**
     * Render the TOC HTML
     */
    function renderToc() {
        if (!tocContainer) return;

        const tocList = document.createElement('nav');
        tocList.className = 'toc-nav';
        tocList.setAttribute('aria-label', 'Table of contents');

        // Header
        const header = document.createElement('div');
        header.className = 'toc-header';
        header.innerHTML = `
            <span class="toc-title">Contents</span>
            <button class="toc-toggle" aria-label="Toggle table of contents">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
        `;

        // List
        const list = document.createElement('ol');
        list.className = 'toc-list';

        headings.forEach((heading, index) => {
            const item = document.createElement('li');
            item.className = `toc-item toc-level-${heading.level}`;

            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.className = 'toc-link';
            link.dataset.target = heading.id;

            // Add number
            const number = document.createElement('span');
            number.className = 'toc-number';
            number.textContent = `${index + 1}`;

            const text = document.createElement('span');
            text.className = 'toc-text';
            text.textContent = heading.text;

            link.appendChild(number);
            link.appendChild(text);
            item.appendChild(link);
            list.appendChild(item);
        });

        // Progress bar
        const progress = document.createElement('div');
        progress.className = 'toc-progress';
        progress.innerHTML = `
            <div class="toc-progress-bar"></div>
            <span class="toc-progress-text">0%</span>
        `;
        progressBar = progress.querySelector('.toc-progress-bar');

        tocList.appendChild(header);
        tocList.appendChild(list);
        tocList.appendChild(progress);

        // Clear and append
        tocContainer.innerHTML = '';
        tocContainer.appendChild(tocList);

        // Toggle functionality
        const toggleBtn = header.querySelector('.toc-toggle');
        toggleBtn?.addEventListener('click', () => {
            tocContainer.classList.toggle('collapsed');
        });
    }

    /**
     * Setup IntersectionObserver for highlighting current section
     */
    function setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const options = {
            rootMargin: `-${SCROLL_OFFSET}px 0px -50% 0px`,
            threshold: [0, HIGHLIGHT_THRESHOLD, 1]
        };

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= HIGHLIGHT_THRESHOLD) {
                    setActiveSection(entry.target.id);
                }
            });
        }, options);

        headings.forEach(heading => {
            observer.observe(heading.element);
        });

        // Also track scroll for more accurate highlighting
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateActiveOnScroll();
                    updateProgress();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /**
     * Update active section based on scroll position
     */
    function updateActiveOnScroll() {
        const scrollPos = window.scrollY + SCROLL_OFFSET + 50;

        let current = null;
        for (let i = headings.length - 1; i >= 0; i--) {
            const heading = headings[i];
            const rect = heading.element.getBoundingClientRect();
            const top = rect.top + window.scrollY;

            if (scrollPos >= top) {
                current = heading.id;
                break;
            }
        }

        if (current && current !== activeId) {
            setActiveSection(current);
        }
    }

    /**
     * Set the active section in TOC
     */
    function setActiveSection(id) {
        if (!tocContainer || id === activeId) return;

        activeId = id;

        // Remove active class from all
        tocContainer.querySelectorAll('.toc-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current
        const activeLink = tocContainer.querySelector(`[data-target="${id}"]`);
        if (activeLink) {
            activeLink.classList.add('active');

            // Scroll TOC to show active item if needed
            const tocList = tocContainer.querySelector('.toc-list');
            if (tocList && tocList.scrollHeight > tocList.clientHeight) {
                const linkRect = activeLink.getBoundingClientRect();
                const listRect = tocList.getBoundingClientRect();

                if (linkRect.top < listRect.top || linkRect.bottom > listRect.bottom) {
                    activeLink.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            }
        }
    }

    /**
     * Setup progress bar
     */
    function setupProgressBar() {
        updateProgress();
    }

    /**
     * Update reading progress
     */
    function updateProgress() {
        const article = document.querySelector('.article-content');
        if (!article || !progressBar) return;

        const articleRect = article.getBoundingClientRect();
        const articleTop = articleRect.top + window.scrollY;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrolled = window.scrollY;

        const start = articleTop - windowHeight;
        const end = articleTop + articleHeight - windowHeight;
        const progress = Math.min(100, Math.max(0, ((scrolled - start) / (end - start)) * 100));

        progressBar.style.width = `${progress}%`;

        const progressText = tocContainer?.querySelector('.toc-progress-text');
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}%`;
        }
    }

    /**
     * Setup smooth scroll for anchor links
     */
    function setupSmoothScroll() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const targetId = link.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);

            if (target) {
                e.preventDefault();

                const targetPosition = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without scrolling
                history.pushState(null, '', `#${targetId}`);

                // Set focus for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    }

    /**
     * Scroll to a specific section
     */
    function scrollToSection(id) {
        const target = document.getElementById(id);
        if (target) {
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Get all headings
     */
    function getHeadings() {
        return headings;
    }

    /**
     * Cleanup
     */
    function destroy() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        headings = [];
        activeId = null;
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose public API
    window.ArticleToc = {
        init,
        destroy,
        getHeadings,
        scrollToSection
    };
})();
