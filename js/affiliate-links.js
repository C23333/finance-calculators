/**
 * FinCalc Affiliate Marketing System
 * Contextual product recommendations and affiliate link management
 */

const AffiliateLinks = {
    // Configuration
    config: {
        storageKey: 'fincalc-affiliate-clicks',
        trackingEnabled: true,
        // Affiliate program IDs (replace with actual IDs)
        affiliates: {
            amazon: 'human0f7-20',
            creditKarma: 'fincalc',
            nerdwallet: 'fincalc',
            bankrate: 'fincalc'
        }
    },

    // Product recommendations by calculator type
    recommendations: {
        mortgage: [
            {
                id: 'mortgage-book-1',
                title: 'The Total Money Makeover',
                description: 'Dave Ramsey\'s proven plan for financial fitness',
                category: 'book',
                affiliate: 'amazon',
                url: 'https://www.amazon.com/dp/1595555277',
                image: 'https://m.media-amazon.com/images/I/71aG0m9XRcL._SL200_.jpg',
                price: '$17.99'
            },
            {
                id: 'mortgage-service-1',
                title: 'Compare Mortgage Rates',
                description: 'Find the best mortgage rates from top lenders',
                category: 'service',
                affiliate: 'bankrate',
                url: 'https://www.bankrate.com/mortgages/',
                cta: 'Compare Rates'
            }
        ],
        'compound-interest': [
            {
                id: 'invest-book-1',
                title: 'The Intelligent Investor',
                description: 'The definitive book on value investing by Benjamin Graham',
                category: 'book',
                affiliate: 'amazon',
                url: 'https://www.amazon.com/dp/0060555661',
                image: 'https://m.media-amazon.com/images/I/91+t0Di07FL._SL200_.jpg',
                price: '$14.99'
            },
            {
                id: 'invest-book-2',
                title: 'A Random Walk Down Wall Street',
                description: 'Time-tested strategy for successful investing',
                category: 'book',
                affiliate: 'amazon',
                url: 'https://www.amazon.com/dp/1324002182',
                image: 'https://m.media-amazon.com/images/I/71Xq5E0pHdL._SL200_.jpg',
                price: '$18.99'
            }
        ],
        retirement: [
            {
                id: 'retire-book-1',
                title: 'The Simple Path to Wealth',
                description: 'JL Collins\' guide to financial independence',
                category: 'book',
                affiliate: 'amazon',
                url: 'https://www.amazon.com/dp/1533667926',
                image: 'https://m.media-amazon.com/images/I/71cWwgccPBL._SL200_.jpg',
                price: '$14.95'
            },
            {
                id: 'retire-service-1',
                title: 'Free Credit Score',
                description: 'Check your credit score for free',
                category: 'service',
                affiliate: 'creditKarma',
                url: 'https://www.creditkarma.com/',
                cta: 'Check Score'
            }
        ],
        'debt-payoff': [
            {
                id: 'debt-book-1',
                title: 'Debt Free Forever',
                description: 'Take control of your money and your life',
                category: 'book',
                affiliate: 'amazon',
                url: 'https://www.amazon.com/dp/1594630410',
                image: 'https://m.media-amazon.com/images/I/71Ld6UxYBWL._SL200_.jpg',
                price: '$16.99'
            },
            {
                id: 'debt-service-1',
                title: 'Balance Transfer Cards',
                description: 'Find 0% APR balance transfer credit cards',
                category: 'service',
                affiliate: 'nerdwallet',
                url: 'https://www.nerdwallet.com/best/credit-cards/balance-transfer',
                cta: 'Compare Cards'
            }
        ],
        'savings-goal': [
            {
                id: 'save-book-1',
                title: 'I Will Teach You to Be Rich',
                description: 'Ramit Sethi\'s 6-week program for financial success',
                category: 'book',
                affiliate: 'amazon',
                url: 'https://www.amazon.com/dp/1523505745',
                image: 'https://m.media-amazon.com/images/I/71aG0m9XRcL._SL200_.jpg',
                price: '$16.99'
            },
            {
                id: 'save-service-1',
                title: 'High-Yield Savings Accounts',
                description: 'Find the best savings account rates',
                category: 'service',
                affiliate: 'bankrate',
                url: 'https://www.bankrate.com/banking/savings/best-high-yield-interests-savings-accounts/',
                cta: 'Compare Rates'
            }
        ],
        'emergency-fund': [
            {
                id: 'emergency-book-1',
                title: 'Your Money or Your Life',
                description: 'Transform your relationship with money',
                category: 'book',
                affiliate: 'amazon',
                url: 'https://www.amazon.com/dp/0143115766',
                image: 'https://m.media-amazon.com/images/I/71vK0WVQ4rL._SL200_.jpg',
                price: '$17.00'
            }
        ],
        'auto-loan': [
            {
                id: 'auto-service-1',
                title: 'Compare Auto Loan Rates',
                description: 'Find the best auto loan rates',
                category: 'service',
                affiliate: 'bankrate',
                url: 'https://www.bankrate.com/loans/auto-loans/',
                cta: 'Compare Rates'
            }
        ],
        'student-loan': [
            {
                id: 'student-service-1',
                title: 'Student Loan Refinancing',
                description: 'Compare student loan refinance rates',
                category: 'service',
                affiliate: 'nerdwallet',
                url: 'https://www.nerdwallet.com/refinancing-student-loans',
                cta: 'Compare Rates'
            }
        ],
        default: [
            {
                id: 'default-book-1',
                title: 'Rich Dad Poor Dad',
                description: 'What the rich teach their kids about money',
                category: 'book',
                affiliate: 'amazon',
                url: 'https://www.amazon.com/dp/1612680194',
                image: 'https://m.media-amazon.com/images/I/81bsw6fnUiL._SL200_.jpg',
                price: '$8.99'
            }
        ]
    },

    // State
    state: {
        initialized: false,
        clicks: {}
    },

    /**
     * Initialize affiliate system
     * DISABLED - Amazon Associates doesn't support China payment
     */
    init() {
        // Disabled - only using Google Ads for now
        console.log('[Affiliate] Disabled');
        return;
        
        /* Original code disabled:
        if (this.state.initialized) return;

        this.loadClickHistory();
        this.injectRecommendations();
        this.setupEventListeners();

        this.state.initialized = true;
        console.log('[Affiliate] Initialized');
        */
    },

    /**
     * Load click history from storage
     */
    loadClickHistory() {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            if (stored) {
                this.state.clicks = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('[Affiliate] Failed to load click history:', e);
        }
    },

    /**
     * Save click to storage
     */
    saveClick(productId) {
        this.state.clicks[productId] = (this.state.clicks[productId] || 0) + 1;
        try {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.state.clicks));
        } catch (e) {
            console.warn('[Affiliate] Failed to save click:', e);
        }
    },

    /**
     * Get translation
     */
    t(key, fallback = '') {
        if (window.I18n && typeof window.I18n.t === 'function') {
            const translated = window.I18n.t(key);
            return translated !== key ? translated : fallback;
        }
        return fallback;
    },

    /**
     * Get calculator type from URL
     */
    getCalculatorType() {
        const path = window.location.pathname;
        const match = path.match(/calculators\/([^.]+)\.html/);
        return match ? match[1] : 'default';
    },

    /**
     * Get recommendations for current calculator
     */
    getRecommendations() {
        const type = this.getCalculatorType();
        return this.recommendations[type] || this.recommendations.default;
    },

    /**
     * Build affiliate URL with tracking
     */
    buildAffiliateUrl(product) {
        let url = product.url;
        const affiliateId = this.config.affiliates[product.affiliate];

        if (product.affiliate === 'amazon' && affiliateId) {
            // Amazon affiliate link format
            const separator = url.includes('?') ? '&' : '?';
            url = `${url}${separator}tag=${affiliateId}`;
        }

        return url;
    },

    /**
     * Inject recommendations into page
     */
    injectRecommendations() {
        // Find insertion point
        const resultsSection = document.querySelector('.results');
        const sidebar = document.querySelector('.sidebar');
        const insertPoint = sidebar || resultsSection;

        if (!insertPoint) return;

        // Check if already injected
        if (document.querySelector('.affiliate-recommendations')) return;

        const recommendations = this.getRecommendations();
        if (!recommendations || recommendations.length === 0) return;

        const container = document.createElement('div');
        container.className = 'affiliate-recommendations';
        container.innerHTML = `
            <h3 class="affiliate-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <span data-i18n="affiliate.recommended">${this.t('affiliate.recommended', 'Recommended Resources')}</span>
            </h3>
            <div class="affiliate-list">
                ${recommendations.map(product => this.renderProduct(product)).join('')}
            </div>
            <p class="affiliate-disclosure" data-i18n="affiliate.disclosure">
                ${this.t('affiliate.disclosure', 'We may earn a commission from purchases made through these links.')}
            </p>
        `;

        // Insert after results or in sidebar
        if (sidebar) {
            sidebar.appendChild(container);
        } else if (resultsSection) {
            resultsSection.after(container);
        }

        // Add styles if not already present
        this.injectStyles();
    },

    /**
     * Render a product card
     */
    renderProduct(product) {
        const url = this.buildAffiliateUrl(product);
        const isBook = product.category === 'book';

        return `
            <a href="${url}"
               class="affiliate-product ${product.category}"
               target="_blank"
               rel="noopener sponsored"
               data-product-id="${product.id}"
               onclick="AffiliateLinks.trackClick('${product.id}')">
                ${isBook && product.image ? `
                    <img src="${product.image}" alt="${product.title}" class="affiliate-image" loading="lazy">
                ` : ''}
                <div class="affiliate-content">
                    <h4 class="affiliate-product-title">${product.title}</h4>
                    <p class="affiliate-product-desc">${product.description}</p>
                    ${product.price ? `<span class="affiliate-price">${product.price}</span>` : ''}
                    ${product.cta ? `<span class="affiliate-cta">${product.cta} →</span>` : ''}
                </div>
            </a>
        `;
    },

    /**
     * Track affiliate click
     */
    trackClick(productId) {
        this.saveClick(productId);

        // Track with analytics
        if (window.gtag) {
            gtag('event', 'affiliate_click', {
                product_id: productId,
                calculator: this.getCalculatorType()
            });
        }

        // Track with custom tracker
        if (window.ClickTracker) {
            window.ClickTracker.track('affiliate_click', {
                productId,
                calculator: this.getCalculatorType()
            });
        }

        console.log('[Affiliate] Click tracked:', productId);
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Re-inject on calculation complete
        document.addEventListener('calculationComplete', () => {
            this.injectRecommendations();
        });

        // Update translations on language change
        document.addEventListener('languageChange', () => {
            document.querySelectorAll('.affiliate-recommendations [data-i18n]').forEach(el => {
                const key = el.dataset.i18n;
                el.textContent = this.t(key, el.textContent);
            });
        });
    },

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.querySelector('#affiliate-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'affiliate-styles';
        styles.textContent = `
            .affiliate-recommendations {
                margin: 24px 0;
                padding: 20px;
                background: var(--bg-soft, #f8fafc);
                border-radius: var(--radius, 12px);
                border: 1px solid var(--border, #e2e8f0);
            }

            .affiliate-title {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 0 0 16px 0;
                font-size: 1rem;
                font-weight: 600;
                color: var(--text, #1e293b);
            }

            .affiliate-title svg {
                color: var(--accent, #f59e0b);
            }

            .affiliate-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .affiliate-product {
                display: flex;
                gap: 12px;
                padding: 12px;
                background: var(--bg, #ffffff);
                border: 1px solid var(--border, #e2e8f0);
                border-radius: var(--radius-sm, 8px);
                text-decoration: none;
                color: inherit;
                transition: all 0.2s ease;
            }

            .affiliate-product:hover {
                border-color: var(--primary, #4f46e5);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                transform: translateY(-1px);
            }

            .affiliate-image {
                width: 60px;
                height: 80px;
                object-fit: cover;
                border-radius: 4px;
                flex-shrink: 0;
            }

            .affiliate-content {
                flex: 1;
                min-width: 0;
            }

            .affiliate-product-title {
                margin: 0 0 4px 0;
                font-size: 0.95rem;
                font-weight: 600;
                color: var(--text, #1e293b);
                line-height: 1.3;
            }

            .affiliate-product-desc {
                margin: 0 0 8px 0;
                font-size: 0.85rem;
                color: var(--text-secondary, #64748b);
                line-height: 1.4;
            }

            .affiliate-price {
                display: inline-block;
                padding: 2px 8px;
                background: var(--secondary-bg, #dcfce7);
                color: var(--secondary, #16a34a);
                font-size: 0.8rem;
                font-weight: 600;
                border-radius: 4px;
            }

            .affiliate-cta {
                display: inline-block;
                color: var(--primary, #4f46e5);
                font-size: 0.85rem;
                font-weight: 600;
            }

            .affiliate-disclosure {
                margin: 16px 0 0 0;
                font-size: 0.75rem;
                color: var(--text-muted, #94a3b8);
                text-align: center;
            }

            /* Dark mode */
            [data-effective-theme="dark"] .affiliate-recommendations {
                background: var(--bg-elevated, #1e293b);
            }

            [data-effective-theme="dark"] .affiliate-product {
                background: var(--bg, #0f172a);
            }

            /* Responsive */
            @media (max-width: 600px) {
                .affiliate-product {
                    flex-direction: column;
                }

                .affiliate-image {
                    width: 100%;
                    height: 120px;
                }
            }

            /* Print - hide affiliate content */
            @media print {
                .affiliate-recommendations {
                    display: none !important;
                }
            }
        `;

        document.head.appendChild(styles);
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AffiliateLinks.init());
} else {
    AffiliateLinks.init();
}

// Export for external use
window.AffiliateLinks = AffiliateLinks;
