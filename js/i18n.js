/**
 * FinCalc Internationalization (i18n) System
 * Supports: English, Spanish, Chinese, German, French, Portuguese, Japanese, Korean, Arabic, Hindi
 * Features: Auto-detection, URL-based routing, localStorage persistence, currency localization
 */

const I18n = {
    // Supported languages with metadata
    LANGUAGES: {
        en: { name: 'English', nativeName: 'English', dir: 'ltr', currency: 'USD', locale: 'en-US' },
        es: { name: 'Spanish', nativeName: 'Español', dir: 'ltr', currency: 'USD', locale: 'es-ES' },
        zh: { name: 'Chinese', nativeName: '中文', dir: 'ltr', currency: 'CNY', locale: 'zh-CN' },
        de: { name: 'German', nativeName: 'Deutsch', dir: 'ltr', currency: 'EUR', locale: 'de-DE' },
        fr: { name: 'French', nativeName: 'Français', dir: 'ltr', currency: 'EUR', locale: 'fr-FR' },
        pt: { name: 'Portuguese', nativeName: 'Português', dir: 'ltr', currency: 'BRL', locale: 'pt-BR' },
        ja: { name: 'Japanese', nativeName: '日本語', dir: 'ltr', currency: 'JPY', locale: 'ja-JP' },
        ko: { name: 'Korean', nativeName: '한국어', dir: 'ltr', currency: 'KRW', locale: 'ko-KR' },
        ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl', currency: 'SAR', locale: 'ar-SA' },
        hi: { name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', currency: 'INR', locale: 'hi-IN' }
    },

    STORAGE_KEY: 'fincalc-lang',
    DEFAULT_LANG: 'en',
    currentLang: 'en',
    translations: {},
    isLoaded: false,

    /**
     * Initialize i18n system
     */
    async init() {
        // Detect language
        this.currentLang = this.detectLanguage();

        // Set HTML attributes
        this.setHtmlAttributes();

        // Load translations
        await this.loadTranslations(this.currentLang);

        // Apply translations to page
        this.applyTranslations();

        // Create language selector
        this.createLanguageSelector();

        // Mark as loaded
        this.isLoaded = true;

        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('i18nReady', {
            detail: { lang: this.currentLang }
        }));

        return this;
    },

    /**
     * Detect user's preferred language
     * Priority: URL path > localStorage > browser > default
     */
    detectLanguage() {
        // 1. Check URL path (e.g., /es/, /zh/)
        const pathMatch = window.location.pathname.match(/^\/([a-z]{2})\//);
        if (pathMatch && this.LANGUAGES[pathMatch[1]]) {
            return pathMatch[1];
        }

        // 2. Check localStorage
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored && this.LANGUAGES[stored]) {
            return stored;
        }

        // 3. Check browser language
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang && this.LANGUAGES[browserLang]) {
            return browserLang;
        }

        // 4. Default
        return this.DEFAULT_LANG;
    },

    /**
     * Set HTML element attributes
     */
    setHtmlAttributes() {
        const langData = this.LANGUAGES[this.currentLang];
        document.documentElement.lang = this.currentLang;
        document.documentElement.dir = langData.dir;
        document.documentElement.setAttribute('data-currency', langData.currency);
    },

    /**
     * Load translations for a language
     */
    async loadTranslations(lang) {
        try {
            // Try to load from embedded translations first
            if (window.TRANSLATIONS && window.TRANSLATIONS[lang]) {
                this.translations = window.TRANSLATIONS[lang];
                return;
            }

            // Otherwise load from JSON file
            const response = await fetch(`/js/i18n/${lang}.json`);
            if (response.ok) {
                this.translations = await response.json();
            } else {
                console.warn(`Translation file not found for ${lang}, falling back to English`);
                if (lang !== 'en') {
                    await this.loadTranslations('en');
                }
            }
        } catch (error) {
            console.error('Error loading translations:', error);
            // Use embedded fallback
            this.translations = this.getEmbeddedTranslations(lang);
        }
    },

    /**
     * Get embedded translations (fallback)
     */
    getEmbeddedTranslations(lang) {
        // Return English as fallback
        return window.TRANSLATIONS?.en || {};
    },

    /**
     * Translate a key
     * @param {string} key - Translation key (e.g., 'nav.home')
     * @param {object} params - Interpolation parameters
     * @returns {string} Translated string
     */
    t(key, params = {}) {
        // Get translation by dot notation
        let text = key.split('.').reduce((obj, k) => obj?.[k], this.translations);

        // Fallback to key if not found
        if (text === undefined) {
            console.warn(`Translation missing: ${key}`);
            return key;
        }

        // Interpolate parameters
        if (typeof text === 'string' && Object.keys(params).length > 0) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
            });
        }

        return text;
    },

    /**
     * Format currency based on current locale
     */
    formatCurrency(amount, options = {}) {
        const langData = this.LANGUAGES[this.currentLang];
        const currency = options.currency || langData.currency;
        const locale = options.locale || langData.locale;

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: options.decimals ?? 0,
            maximumFractionDigits: options.decimals ?? 0
        }).format(amount);
    },

    /**
     * Format number based on current locale
     */
    formatNumber(num, options = {}) {
        const langData = this.LANGUAGES[this.currentLang];
        return new Intl.NumberFormat(langData.locale, {
            minimumFractionDigits: options.decimals ?? 0,
            maximumFractionDigits: options.decimals ?? 0
        }).format(num);
    },

    /**
     * Format date based on current locale
     */
    formatDate(date, options = {}) {
        const langData = this.LANGUAGES[this.currentLang];
        const defaultOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat(langData.locale, { ...defaultOptions, ...options }).format(date);
    },

    /**
     * Format percentage
     */
    formatPercent(value, decimals = 1) {
        const langData = this.LANGUAGES[this.currentLang];
        return new Intl.NumberFormat(langData.locale, {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value / 100);
    },

    /**
     * Apply translations to DOM elements with data-i18n attribute
     */
    applyTranslations() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const params = el.getAttribute('data-i18n-params');
            const parsedParams = params ? JSON.parse(params) : {};

            const translation = this.t(key, parsedParams);

            // Handle different element types
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.placeholder !== undefined) {
                    el.placeholder = translation;
                }
            } else {
                el.textContent = translation;
            }
        });

        // Translate elements with data-i18n-html (allows HTML)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            el.innerHTML = this.t(key);
        });

        // Translate attributes
        document.querySelectorAll('[data-i18n-attr]').forEach(el => {
            const attrs = el.getAttribute('data-i18n-attr').split(',');
            attrs.forEach(attr => {
                const [attrName, key] = attr.split(':');
                el.setAttribute(attrName.trim(), this.t(key.trim()));
            });
        });

        // Update page title if translation exists
        const titleKey = document.querySelector('meta[name="i18n-title"]')?.content;
        if (titleKey) {
            document.title = this.t(titleKey);
        }
    },

    /**
     * Change language
     */
    async setLanguage(lang) {
        if (!this.LANGUAGES[lang]) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        // Save preference
        localStorage.setItem(this.STORAGE_KEY, lang);
        this.currentLang = lang;

        // Update HTML attributes
        this.setHtmlAttributes();

        // Load and apply translations
        await this.loadTranslations(lang);
        this.applyTranslations();

        // Update language selector
        this.updateLanguageSelector();

        // Dispatch event
        document.dispatchEvent(new CustomEvent('languageChange', {
            detail: { lang }
        }));
    },

    /**
     * Create language selector dropdown
     */
    createLanguageSelector() {
        // Check if selector already exists
        if (document.querySelector('.lang-selector')) return;

        // Try to find nav-controls first, then fall back to nav
        const navControls = document.querySelector('.nav-controls');
        const nav = document.querySelector('header nav');
        if (!navControls && !nav) return;

        const selector = document.createElement('div');
        selector.className = 'lang-selector';
        selector.innerHTML = `
            <button class="lang-toggle" aria-label="Select language" aria-expanded="false">
                <svg class="lang-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span class="lang-current">${this.LANGUAGES[this.currentLang].nativeName}</span>
                <svg class="lang-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div class="lang-dropdown" role="listbox">
                ${Object.entries(this.LANGUAGES).map(([code, data]) => `
                    <button class="lang-option ${code === this.currentLang ? 'active' : ''}"
                            role="option"
                            data-lang="${code}"
                            aria-selected="${code === this.currentLang}">
                        <span class="lang-native">${data.nativeName}</span>
                        <span class="lang-name">${data.name}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Insert into nav-controls if available, otherwise into nav
        if (navControls) {
            // Insert at the beginning of nav-controls (before theme toggle)
            navControls.insertBefore(selector, navControls.firstChild);
        } else if (nav) {
            // Fallback: insert before theme toggle or at end of nav
            const themeToggle = nav.querySelector('.theme-toggle');
            if (themeToggle) {
                nav.insertBefore(selector, themeToggle);
            } else {
                nav.appendChild(selector);
            }
        }

        // Add event listeners
        const toggle = selector.querySelector('.lang-toggle');
        const dropdown = selector.querySelector('.lang-dropdown');

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = selector.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen);
        });

        // Language option clicks
        selector.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.dataset.lang;
                this.setLanguage(lang);
                selector.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!selector.contains(e.target)) {
                selector.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                selector.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    },

    /**
     * Update language selector display
     */
    updateLanguageSelector() {
        const selector = document.querySelector('.lang-selector');
        if (!selector) return;

        // Update current language display
        const current = selector.querySelector('.lang-current');
        if (current) {
            current.textContent = this.LANGUAGES[this.currentLang].nativeName;
        }

        // Update active state
        selector.querySelectorAll('.lang-option').forEach(option => {
            const isActive = option.dataset.lang === this.currentLang;
            option.classList.toggle('active', isActive);
            option.setAttribute('aria-selected', isActive);
        });
    },

    /**
     * Get currency symbol for current language
     */
    getCurrencySymbol() {
        const currency = this.LANGUAGES[this.currentLang].currency;
        const symbols = {
            USD: '$', EUR: '€', GBP: '£', CNY: '¥', JPY: '¥',
            KRW: '₩', BRL: 'R$', SAR: 'ر.س', INR: '₹'
        };
        return symbols[currency] || currency;
    },

    /**
     * Get current language data
     */
    getCurrentLanguage() {
        return {
            code: this.currentLang,
            ...this.LANGUAGES[this.currentLang]
        };
    }
};

// Embedded translations (critical strings for immediate display)
window.TRANSLATIONS = {
    en: {
        site: {
            name: 'FinCalc',
            tagline: 'Free Financial Calculators',
            description: 'Make smarter financial decisions with our easy-to-use calculators.'
        },
        nav: {
            home: 'Home',
            calculators: 'Calculators',
            blog: 'Blog',
            about: 'About'
        },
        common: {
            calculate: 'Calculate',
            reset: 'Reset',
            results: 'Results',
            loading: 'Loading...',
            error: 'Error',
            years: 'years',
            months: 'months',
            perMonth: '/month',
            perYear: '/year'
        },
        footer: {
            copyright: '© 2026 FinCalc. All rights reserved.',
            privacy: 'Privacy Policy',
            terms: 'Terms of Service',
            disclaimer: 'Disclaimer: These calculators are for informational purposes only. Consult a qualified financial advisor for personalized advice.'
        },
        theme: {
            light: 'Light',
            dark: 'Dark',
            auto: 'Auto'
        }
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
} else {
    I18n.init();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}

window.I18n = I18n;
