/**
 * FinCalc Monetization System
 * Enhanced advertising and affiliate marketing management module
 *
 * Features:
 * - Multiple ad slot configurations
 * - Region/language-based affiliate links
 * - Ad loading performance optimization
 * - A/B testing support
 * - Click tracking and analytics
 */

const MonetizationConfig = {
    // Google AdSense configuration
    adsense: {
        enabled: true,
        publisherId: 'ca-pub-9483557811977052',

        // Ad slot configurations
        slots: {
            // Ad below calculation results
            resultBottom: {
                slot: 'XXXXXXXXXX',
                format: 'auto',
                fullWidth: true,
                lazyLoad: true,
                priority: 'high'
            },
            // Sidebar ad
            sidebar: {
                slot: 'XXXXXXXXXX',
                format: 'rectangle',
                fullWidth: false,
                lazyLoad: true,
                priority: 'medium'
            },
            // Footer ad
            footer: {
                slot: 'XXXXXXXXXX',
                format: 'horizontal',
                fullWidth: true,
                lazyLoad: true,
                priority: 'low'
            },
            // In-content ad (between sections)
            inContent: {
                slot: 'XXXXXXXXXX',
                format: 'fluid',
                fullWidth: true,
                lazyLoad: true,
                priority: 'medium'
            },
            // Header banner ad
            headerBanner: {
                slot: 'XXXXXXXXXX',
                format: 'horizontal',
                fullWidth: true,
                lazyLoad: false,
                priority: 'high'
            },
            // Mobile sticky ad
            mobileSticky: {
                slot: 'XXXXXXXXXX',
                format: 'horizontal',
                fullWidth: true,
                lazyLoad: false,
                priority: 'high',
                mobileOnly: true
            }
        },

        // Performance optimization settings
        performance: {
            lazyLoadThreshold: 200, // pixels before viewport
            preconnect: true,
            deferNonCritical: true,
            maxAdsPerPage: 5
        }
    },

    // A/B Testing configuration
    abTesting: {
        enabled: true,
        experiments: {
            affiliateLayout: {
                name: 'affiliate_layout',
                variants: ['grid', 'list', 'carousel'],
                weights: [0.4, 0.3, 0.3],
                active: true
            },
            ctaColor: {
                name: 'cta_color',
                variants: ['primary', 'secondary', 'accent'],
                weights: [0.34, 0.33, 0.33],
                active: true
            },
            adPlacement: {
                name: 'ad_placement',
                variants: ['after_result', 'sidebar', 'both'],
                weights: [0.4, 0.3, 0.3],
                active: true
            }
        }
    },

    // Analytics and tracking
    tracking: {
        enabled: true,
        events: {
            adImpression: 'ad_impression',
            adClick: 'ad_click',
            affiliateImpression: 'affiliate_impression',
            affiliateClick: 'affiliate_click',
            abTestAssignment: 'ab_test_assignment'
        }
    },

    // Calculator to affiliate type mapping
    calculatorAffiliateMap: {
        'mortgage': ['mortgage'],
        'refinance': ['mortgage'],
        'home-affordability': ['mortgage', 'savings'],
        'rent-vs-buy': ['mortgage', 'savings'],
        'compound-interest': ['investment', 'savings'],
        'investment-return': ['investment'],
        'retirement': ['retirement', 'investment'],
        '401k': ['retirement', 'investment'],
        'roth-vs-traditional': ['retirement'],
        'savings-goal': ['savings'],
        'emergency-fund': ['savings'],
        'student-loan': ['studentLoan'],
        'auto-loan': ['autoLoan'],
        'loan-payoff': ['savings'],
        'debt-payoff': ['creditCard', 'savings'],
        'salary': ['savings', 'investment'],
        'take-home-pay': ['savings'],
        'self-employment-tax': ['savings', 'retirement'],
        'inflation': ['investment'],
        'social-security': ['retirement']
    }
};

/**
 * A/B Testing Manager
 */
const ABTestManager = {
    assignments: {},
    storageKey: 'fincalc-ab-tests',

    /**
     * Initialize A/B testing
     */
    init() {
        if (!MonetizationConfig.abTesting.enabled) return;

        // Load existing assignments from storage
        this.loadAssignments();

        // Assign user to experiments
        Object.entries(MonetizationConfig.abTesting.experiments).forEach(([key, experiment]) => {
            if (experiment.active && !this.assignments[key]) {
                this.assignVariant(key, experiment);
            }
        });

        // Save assignments
        this.saveAssignments();
    },

    /**
     * Load assignments from localStorage
     */
    loadAssignments() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.assignments = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load A/B test assignments:', e);
        }
    },

    /**
     * Save assignments to localStorage
     */
    saveAssignments() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.assignments));
        } catch (e) {
            console.warn('Failed to save A/B test assignments:', e);
        }
    },

    /**
     * Assign user to a variant based on weights
     */
    assignVariant(experimentKey, experiment) {
        const random = Math.random();
        let cumulative = 0;
        let selectedVariant = experiment.variants[0];

        for (let i = 0; i < experiment.variants.length; i++) {
            cumulative += experiment.weights[i];
            if (random < cumulative) {
                selectedVariant = experiment.variants[i];
                break;
            }
        }

        this.assignments[experimentKey] = {
            variant: selectedVariant,
            assignedAt: Date.now()
        };

        // Track assignment
        ClickTracker.track('ab_test_assignment', {
            experiment: experiment.name,
            variant: selectedVariant
        });

        return selectedVariant;
    },

    /**
     * Get variant for an experiment
     */
    getVariant(experimentKey) {
        return this.assignments[experimentKey]?.variant || null;
    }
};

/**
 * Click and Event Tracker
 */
const ClickTracker = {
    queue: [],
    batchSize: 10,
    flushInterval: 5000,

    /**
     * Initialize tracker
     */
    init() {
        if (!MonetizationConfig.tracking.enabled) return;

        // Set up periodic flush
        setInterval(() => this.flush(), this.flushInterval);

        // Flush on page unload
        window.addEventListener('beforeunload', () => this.flush());
    },

    /**
     * Track an event
     */
    track(eventType, data = {}) {
        if (!MonetizationConfig.tracking.enabled) return;

        const event = {
            type: eventType,
            timestamp: Date.now(),
            page: window.location.pathname,
            calculator: AffiliateManager.getCurrentCalculatorType(),
            language: window.I18n?.currentLang || 'en',
            ...data
        };

        this.queue.push(event);

        // Send to Google Analytics if available
        if (typeof gtag === 'function') {
            gtag('event', eventType, {
                event_category: 'monetization',
                ...data
            });
        }

        // Batch flush if queue is full
        if (this.queue.length >= this.batchSize) {
            this.flush();
        }

        console.log(`[Tracker] ${eventType}:`, data);
    },

    /**
     * Flush event queue
     */
    flush() {
        if (this.queue.length === 0) return;

        // In production, send to analytics endpoint
        // For now, just clear the queue
        const events = [...this.queue];
        this.queue = [];

        // Could send to custom analytics endpoint:
        // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(events) });
    }
};

/**
 * Ad Manager with Performance Optimization
 */
const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);

const AdManager = {
    loadedAds: new Set(),
    observer: null,
    adCount: 0,

    /**
     * Initialize AdSense with performance optimizations
     */
    init() {
        if (isLocalhost) {
            return;
        }
        if (!MonetizationConfig.adsense.enabled) {
            console.log('AdSense is disabled.');
            return;
        }

        const config = MonetizationConfig.adsense;

        // Add preconnect hints for faster loading
        if (config.performance.preconnect) {
            this.addPreconnectHints();
        }

        // Load AdSense script
        this.loadAdSenseScript();

        // Set up lazy loading observer
        if (config.performance.lazyLoadThreshold > 0) {
            this.setupLazyLoading();
        }
    },

    /**
     * Add preconnect hints for ad resources
     */
    addPreconnectHints() {
        const hints = [
            'https://pagead2.googlesyndication.com',
            'https://googleads.g.doubleclick.net',
            'https://www.googletagservices.com'
        ];

        hints.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    },

    /**
     * Load AdSense script with defer
     */
    loadAdSenseScript() {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${MonetizationConfig.adsense.publisherId}`;
        script.crossOrigin = 'anonymous';

        if (MonetizationConfig.adsense.performance.deferNonCritical) {
            script.defer = true;
        }

        document.head.appendChild(script);
    },

    /**
     * Set up Intersection Observer for lazy loading
     */
    setupLazyLoading() {
        const threshold = MonetizationConfig.adsense.performance.lazyLoadThreshold;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const container = entry.target;
                    const slotType = container.dataset.adSlot;

                    if (slotType && !this.loadedAds.has(container.id)) {
                        this.loadAd(container, slotType);
                        this.observer.unobserve(container);
                    }
                }
            });
        }, {
            rootMargin: `${threshold}px`
        });
    },

    /**
     * Create ad container for lazy loading
     */
    createAdContainer(containerId, slotType) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const slotConfig = MonetizationConfig.adsense.slots[slotType];
        if (!slotConfig) return null;

        // Check mobile-only restriction
        if (slotConfig.mobileOnly && window.innerWidth > 768) {
            return null;
        }

        // Check max ads per page
        if (this.adCount >= MonetizationConfig.adsense.performance.maxAdsPerPage) {
            return null;
        }

        container.dataset.adSlot = slotType;
        container.classList.add('ad-container', `ad-${slotType}`);

        return container;
    },

    /**
     * Insert ad into container
     */
    insertAd(containerId, slotType) {
        if (!MonetizationConfig.adsense.enabled) return;

        const container = this.createAdContainer(containerId, slotType);
        if (!container) return;

        const slotConfig = MonetizationConfig.adsense.slots[slotType];

        // If lazy loading is enabled and this is a lazy-load slot
        if (slotConfig.lazyLoad && this.observer) {
            this.observer.observe(container);
        } else {
            this.loadAd(container, slotType);
        }
    },

    /**
     * Actually load the ad
     */
    loadAd(container, slotType) {
        if (this.loadedAds.has(container.id)) return;

        const slotConfig = MonetizationConfig.adsense.slots[slotType];
        if (!slotConfig) return;

        const adHtml = `
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="${MonetizationConfig.adsense.publisherId}"
                 data-ad-slot="${slotConfig.slot}"
                 data-ad-format="${slotConfig.format}"
                 ${slotConfig.fullWidth ? 'data-full-width-responsive="true"' : ''}></ins>
        `;

        container.innerHTML = adHtml;
        this.loadedAds.add(container.id);
        this.adCount++;

        // Trigger ad load
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});

            // Track impression
            ClickTracker.track('ad_impression', {
                slot_type: slotType,
                slot_id: slotConfig.slot
            });
        } catch (e) {
            console.log('AdSense not loaded yet');
        }
    },

    /**
     * Insert ad after calculation results
     */
    insertResultAd() {
        const resultsSection = document.querySelector('.results');
        if (!resultsSection) return;

        let adContainer = document.getElementById('result-ad-container');
        if (!adContainer) {
            adContainer = document.createElement('div');
            adContainer.id = 'result-ad-container';
            adContainer.style.marginTop = '24px';
            resultsSection.appendChild(adContainer);
        }

        this.insertAd('result-ad-container', 'resultBottom');
    }
};

/**
 * Affiliate Manager with Region/Language Support
 */
const AffiliateManager = {
    currentRegion: 'us',
    affiliateLinks: null,

    /**
     * Initialize affiliate manager
     */
    async init() {
        // Detect region from language
        this.currentRegion = this.detectRegion();

        // Load affiliate links
        await this.loadAffiliateLinks();
    },

    /**
     * Detect user region from language settings
     */
    detectRegion() {
        const lang = window.I18n?.currentLang || navigator.language?.split('-')[0] || 'en';

        const langToRegion = {
            'en': 'us',
            'es': 'latam',
            'zh': 'cn',
            'de': 'eu',
            'fr': 'eu',
            'pt': 'br',
            'ja': 'jp',
            'ko': 'kr',
            'ar': 'mena',
            'hi': 'in'
        };

        return langToRegion[lang] || 'us';
    },

    /**
     * Load affiliate links (from module or inline)
     */
    async loadAffiliateLinks() {
        // Try to load from AffiliateLinks module
        if (window.AffiliateLinks) {
            this.affiliateLinks = window.AffiliateLinks;
        } else {
            // Fallback to basic US links
            this.affiliateLinks = this.getDefaultLinks();
        }
    },

    /**
     * Get default US affiliate links
     */
    getDefaultLinks() {
        return {
            us: {
                mortgage: [
                    { name: 'Bankrate', url: 'https://www.bankrate.com/mortgages/', description: 'affiliate.mortgage.bankrate', cta: 'affiliate.cta.compareRates' },
                    { name: 'NerdWallet', url: 'https://www.nerdwallet.com/mortgages/', description: 'affiliate.mortgage.nerdwallet', cta: 'affiliate.cta.getStarted' },
                    { name: 'Rocket Mortgage', url: 'https://www.rocketmortgage.com/', description: 'affiliate.mortgage.rocket', cta: 'affiliate.cta.applyNow' }
                ],
                investment: [
                    { name: 'Betterment', url: 'https://www.betterment.com/', description: 'affiliate.investment.betterment', cta: 'affiliate.cta.startInvesting' },
                    { name: 'Wealthfront', url: 'https://www.wealthfront.com/', description: 'affiliate.investment.wealthfront', cta: 'affiliate.cta.getStarted' },
                    { name: 'Fidelity', url: 'https://www.fidelity.com/', description: 'affiliate.investment.fidelity', cta: 'affiliate.cta.openAccount' }
                ],
                savings: [
                    { name: 'Marcus', url: 'https://www.marcus.com/', description: 'affiliate.savings.marcus', cta: 'affiliate.cta.openAccount' },
                    { name: 'Ally Bank', url: 'https://www.ally.com/', description: 'affiliate.savings.ally', cta: 'affiliate.cta.learnMore' },
                    { name: 'SoFi', url: 'https://www.sofi.com/', description: 'affiliate.savings.sofi', cta: 'affiliate.cta.getStarted' }
                ],
                retirement: [
                    { name: 'Vanguard', url: 'https://investor.vanguard.com/', description: 'affiliate.retirement.vanguard', cta: 'affiliate.cta.openIRA' },
                    { name: 'Charles Schwab', url: 'https://www.schwab.com/', description: 'affiliate.retirement.schwab', cta: 'affiliate.cta.getStarted' }
                ],
                studentLoan: [
                    { name: 'SoFi Student Loans', url: 'https://www.sofi.com/refinance-student-loan/', description: 'affiliate.studentLoan.sofi', cta: 'affiliate.cta.checkRate' },
                    { name: 'Earnest', url: 'https://www.earnest.com/', description: 'affiliate.studentLoan.earnest', cta: 'affiliate.cta.getStarted' }
                ],
                autoLoan: [
                    { name: 'Capital One Auto', url: 'https://www.capitalone.com/cars/', description: 'affiliate.autoLoan.capitalOne', cta: 'affiliate.cta.preQualify' },
                    { name: 'LightStream', url: 'https://www.lightstream.com/', description: 'affiliate.autoLoan.lightstream', cta: 'affiliate.cta.checkRate' }
                ],
                creditCard: [
                    { name: 'NerdWallet Credit Cards', url: 'https://www.nerdwallet.com/credit-cards/', description: 'affiliate.creditCard.nerdwallet', cta: 'affiliate.cta.compareCards' }
                ]
            }
        };
    },

    /**
     * Get current calculator type from URL
     */
    getCurrentCalculatorType() {
        const path = window.location.pathname;
        const match = path.match(/calculators\/([^.]+)\.html/);
        return match ? match[1] : null;
    },

    /**
     * Get relevant affiliates for current calculator and region
     */
    getRelevantAffiliates(calculatorType) {
        const affiliateTypes = MonetizationConfig.calculatorAffiliateMap[calculatorType] || [];
        const affiliates = [];
        const region = this.currentRegion;

        // Get links for current region, fallback to US
        const regionLinks = this.affiliateLinks?.[region] || this.affiliateLinks?.us || {};

        affiliateTypes.forEach(type => {
            const typeAffiliates = regionLinks[type];
            if (typeAffiliates) {
                typeAffiliates.forEach(affiliate => {
                    affiliates.push({
                        ...affiliate,
                        category: type,
                        region: region
                    });
                });
            }
        });

        return affiliates;
    },

    /**
     * Get translated text
     */
    t(key, fallback = '') {
        if (window.I18n && typeof window.I18n.t === 'function') {
            const translated = window.I18n.t(key);
            return translated !== key ? translated : fallback;
        }
        return fallback;
    },

    /**
     * Generate affiliate card HTML
     */
    generateAffiliateCard(affiliate, variant = 'default') {
        const description = this.t(affiliate.description, affiliate.description);
        const cta = this.t(affiliate.cta, affiliate.cta);

        const cardClass = variant === 'list' ? 'affiliate-card affiliate-card-list' : 'affiliate-card';

        return `
            <a href="${affiliate.url}"
               target="_blank"
               rel="noopener sponsored"
               class="${cardClass}"
               data-affiliate="${affiliate.name}"
               data-category="${affiliate.category}"
               data-region="${affiliate.region}">
                <div class="affiliate-content">
                    <h4>${affiliate.name}</h4>
                    <p>${description}</p>
                </div>
                <span class="affiliate-cta">${cta} &rarr;</span>
            </a>
        `;
    },

    /**
     * Insert affiliate section into page
     */
    insertAffiliateSection() {
        const calculatorType = this.getCurrentCalculatorType();
        if (!calculatorType) return;

        const affiliates = this.getRelevantAffiliates(calculatorType);
        if (affiliates.length === 0) return;

        // Get A/B test variant for layout
        const layoutVariant = ABTestManager.getVariant('affiliateLayout') || 'grid';

        // Limit to 3 affiliates
        const displayAffiliates = affiliates.slice(0, 3);

        // Get translated strings
        const sectionTitle = this.t('affiliate.sectionTitle', 'Recommended Services');
        const disclaimer = this.t('affiliate.disclaimer', 'We may earn a commission when you use these links. This helps keep our calculators free.');

        const gridClass = layoutVariant === 'list' ? 'affiliate-list' : 'affiliate-grid';

        const sectionHtml = `
            <div class="affiliate-section" data-layout="${layoutVariant}">
                <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                    ${sectionTitle}
                </h3>
                <p class="affiliate-disclaimer">${disclaimer}</p>
                <div class="${gridClass}">
                    ${displayAffiliates.map(a => this.generateAffiliateCard(a, layoutVariant)).join('')}
                </div>
            </div>
        `;

        // Insert after results section
        const resultsSection = document.querySelector('.results');
        if (resultsSection && !document.querySelector('.affiliate-section')) {
            resultsSection.insertAdjacentHTML('afterend', sectionHtml);

            // Track impressions
            displayAffiliates.forEach(affiliate => {
                ClickTracker.track('affiliate_impression', {
                    affiliate_name: affiliate.name,
                    category: affiliate.category,
                    region: affiliate.region
                });
            });
        }

        // Set up click tracking
        this.setupClickTracking();
    },

    /**
     * Set up click tracking for affiliate links
     */
    setupClickTracking() {
        document.querySelectorAll('.affiliate-card').forEach(card => {
            if (card.dataset.tracked) return;
            card.dataset.tracked = 'true';

            card.addEventListener('click', function(e) {
                const affiliateName = this.dataset.affiliate;
                const category = this.dataset.category;
                const region = this.dataset.region;

                ClickTracker.track('affiliate_click', {
                    affiliate_name: affiliateName,
                    category: category,
                    region: region,
                    calculator: AffiliateManager.getCurrentCalculatorType()
                });
            });
        });
    },

    /**
     * Show affiliates after calculation
     */
    showAfterCalculation() {
        setTimeout(() => {
            this.insertAffiliateSection();
        }, 500);
    }
};

/**
 * Link Rotator for A/B testing affiliate links
 */
const LinkRotator = {
    /**
     * Rotate links based on weights
     */
    rotateLinks(links, count = 3) {
        if (!links || links.length <= count) return links;

        // Shuffle and take first N
        const shuffled = [...links].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
};

/**
 * Initialize monetization system
 */
async function initMonetization() {
    // Initialize tracking first
    ClickTracker.init();

    // Initialize A/B testing
    ABTestManager.init();

    // Initialize ads
    AdManager.init();

    // Initialize affiliate manager
    await AffiliateManager.init();

    // Listen for calculation complete events
    document.addEventListener('calculationComplete', () => {
        AdManager.insertResultAd();
        AffiliateManager.showAfterCalculation();
    });

    // If results are already showing, insert affiliates
    const resultsSection = document.querySelector('.results.show');
    if (resultsSection) {
        AffiliateManager.insertAffiliateSection();
    }

    // Listen for language changes
    document.addEventListener('languageChange', async (e) => {
        // Update region based on new language
        AffiliateManager.currentRegion = AffiliateManager.detectRegion();

        // Reload affiliate links
        await AffiliateManager.loadAffiliateLinks();

        // Re-render affiliate section if visible
        const existingSection = document.querySelector('.affiliate-section');
        if (existingSection) {
            existingSection.remove();
            AffiliateManager.insertAffiliateSection();
        }
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMonetization);
} else {
    initMonetization();
}

// Export for external use
window.MonetizationConfig = MonetizationConfig;
window.AdManager = AdManager;
window.AffiliateManager = AffiliateManager;
window.ABTestManager = ABTestManager;
window.ClickTracker = ClickTracker;
window.LinkRotator = LinkRotator;
