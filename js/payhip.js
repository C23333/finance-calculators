/**
 * Payhip Payment Integration for FinCalc
 * 
 * Setup Instructions:
 * 1. Create account at https://payhip.com
 * 2. Create a Product (Digital Download)
 * 3. Set price and upload files
 * 4. Get your product URL (e.g., https://payhip.com/b/XXXXX)
 * 5. Update the config below
 */

const Payhip = {
    // Configuration - UPDATE THESE VALUES
    config: {
        // Product configurations
        products: {
            desktopApp: {
                // Product ID from Payhip URL (the part after /b/)
                productId: 'XXXXX',  // Replace with actual ID, e.g., 'aB1cD'
                price: 9.99,
                name: 'FinCalc Desktop App'
            }
        },
        
        // Use Payhip embed/overlay (true) or redirect (false)
        useEmbed: true
    },

    /**
     * Initialize Payhip
     */
    init() {
        this.loadScript();
        this.setupDownloadSection();
        console.log('[Payhip] Initialized');
    },

    /**
     * Load Payhip embed script
     */
    loadScript() {
        if (document.querySelector('script[src*="payhip.com"]')) return;
        
        const script = document.createElement('script');
        script.src = 'https://payhip.com/embed-page.js';
        script.defer = true;
        document.head.appendChild(script);
    },

    /**
     * Open checkout for a product
     */
    checkout(productKey) {
        const product = this.config.products[productKey];
        if (!product) {
            console.error('[Payhip] Product not found:', productKey);
            return;
        }

        const checkoutUrl = `https://payhip.com/b/${product.productId}`;
        
        // Track checkout
        this.trackEvent('checkout_start', { product: productKey });

        // Payhip embed or redirect
        if (this.config.useEmbed && window.Payhip) {
            window.Payhip.Checkout.open({ product: product.productId });
        } else {
            window.open(checkoutUrl, '_blank');
        }
    },

    /**
     * Get direct product URL
     */
    getProductUrl(productKey) {
        const product = this.config.products[productKey];
        if (!product) return '#';
        return `https://payhip.com/b/${product.productId}`;
    },

    /**
     * Setup download section in the page
     */
    setupDownloadSection() {
        const existingSection = document.getElementById('download-app');
        if (existingSection) return;

        // Don't show in desktop app
        if (window.IS_DESKTOP_APP) return;

        this.injectDownloadSection();
    },

    /**
     * Inject download section into the page
     */
    injectDownloadSection() {
        const aboutSection = document.getElementById('about');
        if (!aboutSection) return;

        const downloadSection = document.createElement('section');
        downloadSection.id = 'download-app';
        downloadSection.className = 'download-section';
        downloadSection.innerHTML = `
            <div class="container">
                <div class="download-content">
                    <div class="download-info">
                        <h2 data-i18n="download.title">Get the Desktop App</h2>
                        <p data-i18n="download.description">Use FinCalc offline with our desktop application. All calculators, no internet required.</p>
                        
                        <ul class="download-features">
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span data-i18n="download.feature1">Works offline - no internet needed</span>
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span data-i18n="download.feature2">All 20+ calculators included</span>
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span data-i18n="download.feature3">No ads, no tracking</span>
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span data-i18n="download.feature4">Windows, Mac & Linux</span>
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span data-i18n="download.feature5">Lifetime updates included</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="download-cta">
                        <div class="download-price">
                            <span class="price-amount">$${this.config.products.desktopApp.price}</span>
                            <span class="price-type" data-i18n="download.oneTime">One-time purchase</span>
                        </div>
                        
                        <button class="download-btn" onclick="Payhip.checkout('desktopApp')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span data-i18n="download.buyNow">Buy & Download</span>
                        </button>
                        
                        <div class="download-platforms">
                            <span class="platform-icon" title="Windows">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                                </svg>
                            </span>
                            <span class="platform-icon" title="macOS">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                </svg>
                            </span>
                            <span class="platform-icon" title="Linux">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139z"/>
                                </svg>
                            </span>
                        </div>
                        
                        <p class="download-guarantee" data-i18n="download.guarantee">30-day money-back guarantee</p>
                        
                        <p class="download-powered">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            Secure checkout by Payhip
                        </p>
                    </div>
                </div>
            </div>
        `;

        aboutSection.parentNode.insertBefore(downloadSection, aboutSection);

        // Apply translations
        if (window.I18n && window.I18n.translateDynamicContent) {
            window.I18n.translateDynamicContent(downloadSection);
        }
    },

    /**
     * Track analytics event
     */
    trackEvent(event, data = {}) {
        if (window.gtag) {
            window.gtag('event', event, data);
        }
        console.log('[Payhip] Event:', event, data);
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Payhip.init());
} else {
    Payhip.init();
}

window.Payhip = Payhip;
