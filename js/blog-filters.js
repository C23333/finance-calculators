/**
 * Blog Filters Module
 * Handles category filtering, sorting, search, and pagination
 */

(function() {
    'use strict';

    // Configuration
    const ITEMS_PER_PAGE = 12;
    const SEARCH_DEBOUNCE_MS = 300;

    // State
    let allArticles = [];
    let filteredArticles = [];
    let currentCategory = 'all';
    let currentSort = 'newest';
    let currentView = 'grid';
    let currentPage = 1;
    let searchQuery = '';

    // DOM Elements
    let searchInput, categoryNav, sortSelect, viewToggle, articlesContainer, paginationContainer, articleCountEl;

    /**
     * Initialize the blog filters
     */
    function init() {
        // Get DOM elements
        searchInput = document.getElementById('blog-search');
        categoryNav = document.querySelector('.category-nav');
        sortSelect = document.getElementById('sort-select');
        viewToggle = document.querySelector('.view-toggle');
        articlesContainer = document.querySelector('.blog-posts');
        paginationContainer = document.querySelector('.pagination');
        articleCountEl = document.querySelector('.article-count');

        if (!articlesContainer) return;

        // Collect all articles
        collectArticles();

        // Parse URL parameters
        parseUrlParams();

        // Setup event listeners
        setupEventListeners();

        // Initial render
        applyFilters();
        updateCategoryCounts();
    }

    /**
     * Collect all articles from the DOM
     */
    function collectArticles() {
        const cards = articlesContainer.querySelectorAll('.blog-card');
        allArticles = Array.from(cards).map((card, index) => {
            const categoryEl = card.querySelector('.blog-card-category');
            const titleEl = card.querySelector('h2');
            const descEl = card.querySelector('p');
            const readTimeEl = card.querySelector('.blog-card-meta span:last-child');
            const dateEl = card.querySelector('.blog-card-date');
            const wordCountEl = card.querySelector('.blog-card-words');

            return {
                element: card,
                index: index,
                category: categoryEl ? categoryEl.textContent.trim().toLowerCase() : 'general',
                categoryDisplay: categoryEl ? categoryEl.textContent.trim() : 'General',
                title: titleEl ? titleEl.textContent.trim() : '',
                description: descEl ? descEl.textContent.trim() : '',
                readTime: readTimeEl ? parseInt(readTimeEl.textContent) || 5 : 5,
                date: dateEl ? dateEl.dataset.date || '' : '',
                wordCount: wordCountEl ? parseInt(wordCountEl.dataset.words) || 0 : 0,
                href: card.href || ''
            };
        });

        filteredArticles = [...allArticles];
    }

    /**
     * Parse URL parameters for initial state
     */
    function parseUrlParams() {
        const params = new URLSearchParams(window.location.search);

        if (params.has('category')) {
            currentCategory = params.get('category').toLowerCase();
        }
        if (params.has('sort')) {
            currentSort = params.get('sort');
        }
        if (params.has('q')) {
            searchQuery = params.get('q');
            if (searchInput) searchInput.value = searchQuery;
        }
        if (params.has('page')) {
            currentPage = parseInt(params.get('page')) || 1;
        }
    }

    /**
     * Update URL parameters
     */
    function updateUrlParams() {
        const params = new URLSearchParams();

        if (currentCategory !== 'all') {
            params.set('category', currentCategory);
        }
        if (currentSort !== 'newest') {
            params.set('sort', currentSort);
        }
        if (searchQuery) {
            params.set('q', searchQuery);
        }
        if (currentPage > 1) {
            params.set('page', currentPage);
        }

        const newUrl = params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;

        window.history.replaceState({}, '', newUrl);
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Search input
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    searchQuery = e.target.value.trim().toLowerCase();
                    currentPage = 1;
                    applyFilters();
                }, SEARCH_DEBOUNCE_MS);
            });
        }

        // Category pills
        if (categoryNav) {
            categoryNav.addEventListener('click', (e) => {
                const pill = e.target.closest('.category-pill');
                if (pill) {
                    currentCategory = pill.dataset.category || 'all';
                    currentPage = 1;

                    // Update active state
                    categoryNav.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');

                    applyFilters();
                }
            });
        }

        // Sort select
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                currentPage = 1;
                applyFilters();
            });
        }

        // View toggle
        if (viewToggle) {
            viewToggle.addEventListener('click', (e) => {
                const btn = e.target.closest('.view-btn');
                if (btn) {
                    currentView = btn.dataset.view || 'grid';
                    viewToggle.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    articlesContainer.classList.remove('grid-view', 'list-view');
                    articlesContainer.classList.add(`${currentView}-view`);
                }
            });
        }

        // Pagination
        if (paginationContainer) {
            paginationContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.page-btn');
                if (btn && !btn.disabled) {
                    const page = btn.dataset.page;
                    if (page === 'prev') {
                        currentPage = Math.max(1, currentPage - 1);
                    } else if (page === 'next') {
                        currentPage = currentPage + 1;
                    } else {
                        currentPage = parseInt(page);
                    }
                    applyFilters();
                    scrollToTop();
                }
            });
        }
    }

    /**
     * Apply all filters and render
     */
    function applyFilters() {
        // Filter by category
        filteredArticles = allArticles.filter(article => {
            if (currentCategory !== 'all' && article.category !== currentCategory) {
                return false;
            }
            return true;
        });

        // Filter by search
        if (searchQuery) {
            filteredArticles = filteredArticles.filter(article => {
                return article.title.toLowerCase().includes(searchQuery) ||
                       article.description.toLowerCase().includes(searchQuery);
            });
        }

        // Sort
        sortArticles();

        // Update URL
        updateUrlParams();

        // Render
        renderArticles();
        renderPagination();
        updateArticleCount();
    }

    /**
     * Sort articles based on current sort option
     */
    function sortArticles() {
        switch (currentSort) {
            case 'newest':
                filteredArticles.sort((a, b) => {
                    if (a.date && b.date) return new Date(b.date) - new Date(a.date);
                    return a.index - b.index;
                });
                break;
            case 'oldest':
                filteredArticles.sort((a, b) => {
                    if (a.date && b.date) return new Date(a.date) - new Date(b.date);
                    return b.index - a.index;
                });
                break;
            case 'reading-time':
                filteredArticles.sort((a, b) => a.readTime - b.readTime);
                break;
            case 'reading-time-desc':
                filteredArticles.sort((a, b) => b.readTime - a.readTime);
                break;
            default:
                // Keep original order
                filteredArticles.sort((a, b) => a.index - b.index);
        }
    }

    /**
     * Render articles for current page
     */
    function renderArticles() {
        const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
        currentPage = Math.min(currentPage, Math.max(1, totalPages));

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageArticles = filteredArticles.slice(startIndex, endIndex);

        // Hide all articles first
        allArticles.forEach(article => {
            article.element.style.display = 'none';
            article.element.classList.remove('fade-in');
        });

        // Show filtered articles for current page
        pageArticles.forEach((article, index) => {
            article.element.style.display = '';
            // Stagger animation
            setTimeout(() => {
                article.element.classList.add('fade-in');
            }, index * 50);
        });

        // Show empty state if no results
        let emptyState = articlesContainer.querySelector('.empty-state');
        if (filteredArticles.length === 0) {
            if (!emptyState) {
                emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.innerHTML = `
                    <div class="empty-icon">🔍</div>
                    <h3>No articles found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                    <button class="reset-filters-btn" onclick="window.BlogFilters.resetFilters()">Reset Filters</button>
                `;
                articlesContainer.appendChild(emptyState);
            }
            emptyState.style.display = 'block';
        } else if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    /**
     * Render pagination controls
     */
    function renderPagination() {
        if (!paginationContainer) return;

        const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);

        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';

        let html = '';

        // Previous button
        html += `<button class="page-btn prev-btn" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>Previous</span>
        </button>`;

        // Page numbers
        html += '<div class="page-numbers">';

        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            html += `<button class="page-btn page-number" data-page="1">1</button>`;
            if (startPage > 2) {
                html += `<span class="page-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="page-btn page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="page-ellipsis">...</span>`;
            }
            html += `<button class="page-btn page-number" data-page="${totalPages}">${totalPages}</button>`;
        }

        html += '</div>';

        // Next button
        html += `<button class="page-btn next-btn" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>
            <span>Next</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>`;

        paginationContainer.innerHTML = html;
    }

    /**
     * Update category counts
     */
    function updateCategoryCounts() {
        if (!categoryNav) return;

        const counts = { all: allArticles.length };

        allArticles.forEach(article => {
            const cat = article.category;
            counts[cat] = (counts[cat] || 0) + 1;
        });

        categoryNav.querySelectorAll('.category-pill').forEach(pill => {
            const category = pill.dataset.category || 'all';
            const countEl = pill.querySelector('.category-count');
            if (countEl && counts[category] !== undefined) {
                countEl.textContent = counts[category];
            }

            // Set active state based on current category
            if (category === currentCategory) {
                pill.classList.add('active');
            }
        });
    }

    /**
     * Update article count display
     */
    function updateArticleCount() {
        if (!articleCountEl) return;

        const count = filteredArticles.length;
        const text = count === 1 ? '1 article' : `${count} articles`;
        articleCountEl.textContent = text;
    }

    /**
     * Reset all filters
     */
    function resetFilters() {
        currentCategory = 'all';
        currentSort = 'newest';
        searchQuery = '';
        currentPage = 1;

        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'newest';
        if (categoryNav) {
            categoryNav.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            const allPill = categoryNav.querySelector('[data-category="all"]');
            if (allPill) allPill.classList.add('active');
        }

        applyFilters();
    }

    /**
     * Scroll to top of articles
     */
    function scrollToTop() {
        const target = document.querySelector('.blog-grid') || articlesContainer;
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Get unique categories from articles
     */
    function getCategories() {
        const categories = new Map();
        categories.set('all', { name: 'All', count: allArticles.length });

        allArticles.forEach(article => {
            if (!categories.has(article.category)) {
                categories.set(article.category, {
                    name: article.categoryDisplay,
                    count: 0
                });
            }
            categories.get(article.category).count++;
        });

        return categories;
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose public API
    window.BlogFilters = {
        init,
        resetFilters,
        getCategories,
        setCategory: (cat) => {
            currentCategory = cat;
            currentPage = 1;
            applyFilters();
        },
        setSort: (sort) => {
            currentSort = sort;
            currentPage = 1;
            applyFilters();
        },
        search: (query) => {
            searchQuery = query.toLowerCase();
            currentPage = 1;
            applyFilters();
        }
    };
})();
