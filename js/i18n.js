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

        // Update page meta (title, description)
        this.updatePageMeta();

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
     * Enhanced to handle all language currency formats correctly
     * @param {number} amount - The amount to format
     * @param {object} options - Formatting options
     * @param {string} options.currency - Override currency code (e.g., 'USD', 'EUR')
     * @param {string} options.locale - Override locale (e.g., 'en-US', 'de-DE')
     * @param {number} options.decimals - Number of decimal places (default: auto based on currency)
     * @param {string} options.display - Currency display style: 'symbol', 'code', 'name', 'narrowSymbol'
     * @param {boolean} options.useGrouping - Whether to use grouping separators (default: true)
     * @param {string} options.notation - Notation style: 'standard', 'scientific', 'engineering', 'compact'
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, options = {}) {
        const langData = this.LANGUAGES[this.currentLang];
        const currency = options.currency || langData.currency;
        const locale = options.locale || langData.locale;

        // Determine default decimal places based on currency
        // JPY, KRW typically don't use decimal places
        const currencyDecimals = {
            JPY: 0, KRW: 0, VND: 0, CLP: 0, ISK: 0,
            BHD: 3, KWD: 3, OMR: 3 // These use 3 decimal places
        };
        const defaultDecimals = currencyDecimals[currency] ?? 2;
        const decimals = options.decimals ?? defaultDecimals;

        const formatOptions = {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: options.useGrouping ?? true
        };

        // Add optional display style
        if (options.display) {
            formatOptions.currencyDisplay = options.display;
        }

        // Add optional notation
        if (options.notation) {
            formatOptions.notation = options.notation;
        }

        try {
            return new Intl.NumberFormat(locale, formatOptions).format(amount);
        } catch (error) {
            // Fallback for unsupported options
            console.warn('Currency format error, using fallback:', error);
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(amount);
        }
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
     * Enhanced with more date format options
     * @param {Date|number|string} date - The date to format
     * @param {object|string} options - Formatting options or preset name
     * @param {string} options.preset - Preset format: 'short', 'medium', 'long', 'full', 'relative', 'time', 'datetime'
     * @param {string} options.year - Year format: 'numeric', '2-digit'
     * @param {string} options.month - Month format: 'numeric', '2-digit', 'narrow', 'short', 'long'
     * @param {string} options.day - Day format: 'numeric', '2-digit'
     * @param {string} options.weekday - Weekday format: 'narrow', 'short', 'long'
     * @param {string} options.hour - Hour format: 'numeric', '2-digit'
     * @param {string} options.minute - Minute format: 'numeric', '2-digit'
     * @param {string} options.second - Second format: 'numeric', '2-digit'
     * @param {boolean} options.hour12 - Use 12-hour format (default: locale-dependent)
     * @param {string} options.timeZone - Time zone (e.g., 'UTC', 'America/New_York')
     * @param {string} options.timeZoneName - Time zone name format: 'short', 'long'
     * @returns {string} Formatted date string
     */
    formatDate(date, options = {}) {
        const langData = this.LANGUAGES[this.currentLang];
        const locale = options.locale || langData.locale;

        // Convert to Date object if needed
        const dateObj = date instanceof Date ? date : new Date(date);

        // Handle invalid dates
        if (isNaN(dateObj.getTime())) {
            console.warn('Invalid date provided to formatDate:', date);
            return String(date);
        }

        // Handle string preset
        if (typeof options === 'string') {
            options = { preset: options };
        }

        // Preset formats
        const presets = {
            short: { year: 'numeric', month: 'numeric', day: 'numeric' },
            medium: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric' },
            full: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
            time: { hour: 'numeric', minute: '2-digit' },
            timeWithSeconds: { hour: 'numeric', minute: '2-digit', second: '2-digit' },
            datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
            datetimeFull: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: 'numeric', minute: '2-digit' },
            monthYear: { year: 'numeric', month: 'long' },
            monthDay: { month: 'long', day: 'numeric' },
            yearOnly: { year: 'numeric' },
            iso: null // Special case for ISO format
        };

        // Handle relative time format
        if (options.preset === 'relative') {
            return this.formatRelativeTime(dateObj);
        }

        // Handle ISO format
        if (options.preset === 'iso') {
            return dateObj.toISOString();
        }

        // Get format options from preset or use provided options
        let formatOptions;
        if (options.preset && presets[options.preset]) {
            formatOptions = { ...presets[options.preset] };
        } else if (options.preset) {
            console.warn(`Unknown date preset: ${options.preset}, using default`);
            formatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        } else {
            // Use provided options, with defaults
            const { preset, locale: _, ...restOptions } = options;
            formatOptions = Object.keys(restOptions).length > 0
                ? restOptions
                : { year: 'numeric', month: 'long', day: 'numeric' };
        }

        // Add optional properties
        if (options.hour12 !== undefined) formatOptions.hour12 = options.hour12;
        if (options.timeZone) formatOptions.timeZone = options.timeZone;
        if (options.timeZoneName) formatOptions.timeZoneName = options.timeZoneName;

        try {
            return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
        } catch (error) {
            console.warn('Date format error, using fallback:', error);
            return dateObj.toLocaleDateString(locale);
        }
    },

    /**
     * Format relative time (e.g., "2 days ago", "in 3 hours")
     * @param {Date|number|string} date - The date to format
     * @param {Date} baseDate - The base date to compare against (default: now)
     * @returns {string} Relative time string
     */
    formatRelativeTime(date, baseDate = new Date()) {
        const langData = this.LANGUAGES[this.currentLang];
        const dateObj = date instanceof Date ? date : new Date(date);
        const baseObj = baseDate instanceof Date ? baseDate : new Date(baseDate);

        const diffMs = dateObj.getTime() - baseObj.getTime();
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHour = Math.round(diffMin / 60);
        const diffDay = Math.round(diffHour / 24);
        const diffWeek = Math.round(diffDay / 7);
        const diffMonth = Math.round(diffDay / 30);
        const diffYear = Math.round(diffDay / 365);

        try {
            const rtf = new Intl.RelativeTimeFormat(langData.locale, { numeric: 'auto' });

            if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
            if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
            if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
            if (Math.abs(diffDay) < 7) return rtf.format(diffDay, 'day');
            if (Math.abs(diffWeek) < 4) return rtf.format(diffWeek, 'week');
            if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, 'month');
            return rtf.format(diffYear, 'year');
        } catch (error) {
            // Fallback for browsers without RelativeTimeFormat
            console.warn('RelativeTimeFormat not supported, using fallback');
            return this.formatDate(dateObj, 'medium');
        }
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

        // Update page meta (title, description)
        this.updatePageMeta();

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
     * Update page meta information based on current language
     * Updates document title and meta description
     * @param {object} options - Options for meta update
     * @param {string} options.titleKey - Translation key for page title
     * @param {string} options.descriptionKey - Translation key for meta description
     * @param {object} options.titleParams - Parameters for title interpolation
     * @param {object} options.descriptionParams - Parameters for description interpolation
     * @param {string} options.titleSuffix - Suffix to append to title (e.g., site name)
     * @param {boolean} options.updateOG - Whether to update Open Graph tags (default: true)
     */
    updatePageMeta(options = {}) {
        const {
            titleKey,
            descriptionKey,
            titleParams = {},
            descriptionParams = {},
            titleSuffix,
            updateOG = true
        } = options;

        // Update document title
        if (titleKey) {
            let title = this.t(titleKey, titleParams);
            if (titleSuffix) {
                title = `${title} | ${titleSuffix}`;
            } else {
                // Default suffix from site name
                const siteName = this.t('site.name');
                if (siteName && siteName !== 'site.name') {
                    title = `${title} | ${siteName}`;
                }
            }
            document.title = title;

            // Update OG title
            if (updateOG) {
                this._updateMetaTag('og:title', title);
                this._updateMetaTag('twitter:title', title);
            }
        } else {
            // Try to get title from meta tag
            const titleMeta = document.querySelector('meta[name="i18n-title"]')?.content;
            if (titleMeta) {
                const title = this.t(titleMeta, titleParams);
                document.title = title;
                if (updateOG) {
                    this._updateMetaTag('og:title', title);
                    this._updateMetaTag('twitter:title', title);
                }
            }
        }

        // Update meta description
        if (descriptionKey) {
            const description = this.t(descriptionKey, descriptionParams);
            this._updateMetaTag('description', description, 'name');

            // Update OG description
            if (updateOG) {
                this._updateMetaTag('og:description', description);
                this._updateMetaTag('twitter:description', description);
            }
        } else {
            // Try to get description from meta tag
            const descMeta = document.querySelector('meta[name="i18n-description"]')?.content;
            if (descMeta) {
                const description = this.t(descMeta, descriptionParams);
                this._updateMetaTag('description', description, 'name');
                if (updateOG) {
                    this._updateMetaTag('og:description', description);
                    this._updateMetaTag('twitter:description', description);
                }
            }
        }

        // Update html lang attribute
        document.documentElement.lang = this.currentLang;

        // Update OG locale
        if (updateOG) {
            const langData = this.LANGUAGES[this.currentLang];
            this._updateMetaTag('og:locale', langData.locale.replace('-', '_'));
        }

        // Dispatch event
        document.dispatchEvent(new CustomEvent('pageMetaUpdated', {
            detail: { lang: this.currentLang }
        }));
    },

    /**
     * Helper method to update or create meta tags
     * @private
     */
    _updateMetaTag(name, content, attribute = 'property') {
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    },

    /**
     * Translate dynamically generated content
     * Applies translations to an element and its children
     * @param {HTMLElement|string} element - Element or selector to translate
     * @param {object} options - Translation options
     * @param {boolean} options.deep - Whether to translate nested elements (default: true)
     * @param {object} options.params - Global parameters for all translations
     * @returns {HTMLElement} The translated element
     */
    translateDynamicContent(element, options = {}) {
        const { deep = true, params = {} } = options;

        // Get element if selector provided
        const el = typeof element === 'string'
            ? document.querySelector(element)
            : element;

        if (!el) {
            console.warn('translateDynamicContent: Element not found');
            return null;
        }

        // Translate the element itself if it has data-i18n
        this._translateElement(el, params);

        // Translate children if deep mode
        if (deep) {
            // Translate elements with data-i18n attribute
            el.querySelectorAll('[data-i18n]').forEach(child => {
                this._translateElement(child, params);
            });

            // Translate elements with data-i18n-html (allows HTML)
            el.querySelectorAll('[data-i18n-html]').forEach(child => {
                const key = child.getAttribute('data-i18n-html');
                child.innerHTML = this.t(key, params);
            });

            // Translate attributes
            el.querySelectorAll('[data-i18n-attr]').forEach(child => {
                const attrs = child.getAttribute('data-i18n-attr').split(',');
                attrs.forEach(attr => {
                    const [attrName, key] = attr.split(':');
                    child.setAttribute(attrName.trim(), this.t(key.trim(), params));
                });
            });

            // Translate placeholders
            el.querySelectorAll('[data-i18n-placeholder]').forEach(child => {
                const key = child.getAttribute('data-i18n-placeholder');
                child.placeholder = this.t(key, params);
            });

            // Translate aria-labels
            el.querySelectorAll('[data-i18n-aria]').forEach(child => {
                const key = child.getAttribute('data-i18n-aria');
                child.setAttribute('aria-label', this.t(key, params));
            });

            // Translate title attributes
            el.querySelectorAll('[data-i18n-title]').forEach(child => {
                const key = child.getAttribute('data-i18n-title');
                child.setAttribute('title', this.t(key, params));
            });
        }

        // Dispatch event
        el.dispatchEvent(new CustomEvent('translated', {
            detail: { lang: this.currentLang },
            bubbles: true
        }));

        return el;
    },

    /**
     * Helper method to translate a single element
     * @private
     */
    _translateElement(el, globalParams = {}) {
        const key = el.getAttribute('data-i18n');
        if (!key) return;

        const localParams = el.getAttribute('data-i18n-params');
        const parsedParams = localParams ? JSON.parse(localParams) : {};
        const mergedParams = { ...globalParams, ...parsedParams };

        const translation = this.t(key, mergedParams);

        // Handle different element types
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            if (el.placeholder !== undefined && el.getAttribute('data-i18n-target') !== 'value') {
                el.placeholder = translation;
            } else if (el.getAttribute('data-i18n-target') === 'value') {
                el.value = translation;
            }
        } else if (el.tagName === 'IMG') {
            el.alt = translation;
        } else if (el.tagName === 'OPTION') {
            el.textContent = translation;
        } else {
            el.textContent = translation;
        }
    },

    /**
     * Get all translations for a specific calculator
     * @param {string} calculatorName - The calculator name (e.g., 'mortgage', 'retirement')
     * @param {string} lang - Language code (default: current language)
     * @returns {object} Object containing all translations for the calculator
     */
    getCalculatorTranslations(calculatorName, lang = null) {
        const targetLang = lang || this.currentLang;
        const translations = window.TRANSLATIONS?.[targetLang] || this.translations;

        // Get calculator-specific translations
        const calculatorTrans = translations.calculators?.[calculatorName] || {};

        // Get common translations
        const commonTrans = translations.common || {};

        // Get category translations
        const categoryTrans = translations.categories || {};

        // Build comprehensive translation object
        const result = {
            // Calculator-specific
            title: calculatorTrans.title || calculatorName,
            description: calculatorTrans.desc || '',
            ...calculatorTrans,

            // Common UI elements
            common: { ...commonTrans },

            // Categories
            categories: { ...categoryTrans },

            // Helper methods bound to this calculator context
            t: (key, params = {}) => {
                // First try calculator-specific key
                const calcKey = `calculators.${calculatorName}.${key}`;
                let text = this._getNestedValue(translations, calcKey);

                // Fall back to common key
                if (text === undefined) {
                    text = this._getNestedValue(translations, `common.${key}`);
                }

                // Fall back to root key
                if (text === undefined) {
                    text = this._getNestedValue(translations, key);
                }

                // Return key if not found
                if (text === undefined) {
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

            // Format helpers
            formatCurrency: (amount, options) => this.formatCurrency(amount, options),
            formatNumber: (num, options) => this.formatNumber(num, options),
            formatDate: (date, options) => this.formatDate(date, options),
            formatPercent: (value, decimals) => this.formatPercent(value, decimals)
        };

        return result;
    },

    /**
     * Helper method to get nested value from object using dot notation
     * @private
     */
    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
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
        hero: {
            title: 'Free Financial Calculators',
            subtitle: 'Make smarter financial decisions with our easy-to-use calculators. No signup required, 100% free.'
        },
        categories: {
            homeMortgage: 'Home & Mortgage',
            loansDebt: 'Loans & Debt',
            savingsInvestment: 'Savings & Investment',
            retirement: 'Retirement Planning',
            taxIncome: 'Tax & Income'
        },
        calculators: {
            mortgage: { title: 'Mortgage Calculator', desc: 'Calculate monthly payments, total interest, and view amortization schedule.' },
            refinance: { title: 'Refinance Calculator', desc: 'See if refinancing your mortgage could save you money.' },
            rentVsBuy: {
                title: 'Rent vs Buy Calculator',
                desc: 'Compare the costs of renting versus buying a home.',
                recommendBuy: 'Buy',
                recommendRent: 'Rent',
                buyingSaves: 'Buying saves {amount} over {years} years',
                rentingSaves: 'Renting saves {amount} over {years} years'
            },
            homeAffordability: { title: 'Home Affordability', desc: 'Find out how much house you can afford based on your income.' },
            loanPayoff: { title: 'Loan Payoff Calculator', desc: 'See how extra payments can help you pay off loans faster.' },
            debtPayoff: { title: 'Debt Payoff Planner', desc: 'Create a debt payoff plan using snowball or avalanche method.' },
            autoLoan: { title: 'Auto Loan Calculator', desc: 'Calculate car loan payments and total cost of financing.' },
            studentLoan: { title: 'Student Loan Calculator', desc: 'Plan your student loan repayment and explore forgiveness options.' },
            compoundInterest: { title: 'Compound Interest', desc: 'See how your investments grow over time with compound interest.' },
            investmentReturn: { title: 'Investment Return (ROI)', desc: 'Calculate ROI and compare different investment scenarios.' },
            savingsGoal: { title: 'Savings Goal Calculator', desc: 'Find out how much to save monthly to reach your goal.' },
            emergencyFund: { title: 'Emergency Fund', desc: 'Calculate how much you need in your emergency fund.' },
            retirement: { title: 'Retirement Calculator', desc: 'Plan your retirement savings and see if you\'re on track.' },
            calc401k: { title: '401(k) Calculator', desc: 'Maximize your 401(k) contributions and employer matching.' },
            socialSecurity: { title: 'Social Security Estimator', desc: 'Estimate your Social Security benefits at different ages.' },
            rothVsTraditional: { title: 'Roth vs Traditional IRA', desc: 'Compare Roth and Traditional IRA to find the best option.' },
            salary: { title: 'Salary Calculator', desc: 'Convert between hourly, weekly, monthly, and annual salary.' },
            takeHomePay: { title: 'Take-Home Pay', desc: 'Calculate your net pay after taxes and deductions.' },
            selfEmploymentTax: { title: 'Self-Employment Tax', desc: 'Estimate self-employment taxes for freelancers and contractors.' },
            inflation: { title: 'Inflation Calculator', desc: 'See how inflation affects your purchasing power over time.' }
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
            perYear: '/year',
            calculateArrow: 'Calculate →'
        },
        about: {
            title: 'Why Use Our Calculators?',
            free: { title: '100% Free', desc: 'All calculators are completely free. No hidden fees, no premium features to unlock.' },
            noSignup: { title: 'No Signup Required', desc: 'Start calculating immediately. We don\'t ask for your email or personal information.' },
            privacy: { title: 'Privacy First', desc: 'All calculations happen in your browser. Your financial data never leaves your device.' },
            mobile: { title: 'Mobile Friendly', desc: 'Use our calculators on any device - phone, tablet, or desktop computer.' }
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
        },
        accessibility: {
            skipToContent: 'Skip to main content'
        },
        newsletter: {
            subscribe: 'Subscribe',
            emailPlaceholder: 'Enter your email address',
            invalidEmail: 'Please enter a valid email address',
            success: 'Thank you for subscribing! Check your inbox for confirmation.',
            error: 'Something went wrong. Please try again later.',
            alreadySubscribed: "You're already subscribed to our newsletter.",
            submitting: 'Subscribing...',
            close: 'Close',
            privacy: 'We respect your privacy. Unsubscribe at any time.',
            popupTitle: 'Stay Updated!',
            popupDescription: 'Get the latest financial tips, calculator updates, and exclusive content delivered to your inbox.',
            inlineTitle: 'Subscribe to Our Newsletter',
            inlineDescription: 'Join thousands of readers who receive our weekly financial insights and tips.',
            footerTitle: 'Get Financial Tips in Your Inbox',
            footerDescription: 'Subscribe to receive weekly tips on saving, investing, and managing your money.',
            widgetTitle: 'Newsletter',
            widgetDescription: 'Get weekly financial tips and updates.'
        },
        premium: {
            exportPDF: 'Export PDF',
            saveResult: 'Save Result',
            viewHistory: 'History',
            upgradeTitle: 'Upgrade to Premium',
            upgradeDescription: 'Unlock all features including PDF export, unlimited saves, and ad-free experience.',
            feature: {
                pdfExport: 'Export calculations to PDF',
                unlimitedSaves: 'Unlimited saved calculations',
                noAds: 'Ad-free experience',
                support: 'Priority support'
            },
            plan: {
                monthly: 'Monthly',
                yearly: 'Yearly',
                lifetime: 'Lifetime'
            },
            bestValue: 'Best Value',
            save50: 'Save 50%',
            oneTime: 'One-time payment',
            getStarted: 'Get Premium',
            guarantee: '7-day money-back guarantee',
            savedCalculations: 'Saved Calculations',
            noSavedResults: 'No saved calculations yet.',
            limitReached: 'You\'ve reached the free limit of saved calculations.',
            upgradeSaveMore: 'Upgrade to Save More',
            load: 'Load',
            delete: 'Delete',
            loadSuccess: 'Calculation loaded!',
            deleteSuccess: 'Calculation deleted.',
            saveSuccess: 'Calculation saved!',
            pdfSuccess: 'PDF exported successfully!',
            pdfError: 'Failed to export PDF. Please try again.',
            inputs: 'Inputs',
            results: 'Results',
            disclaimer: 'This calculation is for informational purposes only. Consult a financial advisor for personalized advice.',
            checkoutPlaceholder: 'Payment integration coming soon! For now, enjoy the free features.',
            welcomeMessage: 'Welcome to Premium! Enjoy all features.'
        },
        affiliate: {
            recommended: 'Recommended Resources',
            disclosure: 'We may earn a commission from purchases made through these links.'
        }
    },
    zh: {
        site: {
            name: 'FinCalc',
            tagline: '免费财务计算器',
            description: '使用我们简单易用的计算器，做出更明智的财务决策。'
        },
        nav: {
            home: '首页',
            calculators: '计算器',
            blog: '博客',
            about: '关于'
        },
        hero: {
            title: '免费财务计算器',
            subtitle: '使用我们简单易用的计算器，做出更明智的财务决策。无需注册，100%免费。'
        },
        categories: {
            homeMortgage: '房屋与贷款',
            loansDebt: '贷款与债务',
            savingsInvestment: '储蓄与投资',
            retirement: '退休规划',
            taxIncome: '税务与收入'
        },
        calculators: {
            mortgage: { title: '房贷计算器', desc: '计算月供、总利息，查看还款计划表。' },
            refinance: { title: '再融资计算器', desc: '看看再融资是否能为您省钱。' },
            rentVsBuy: {
                title: '租房vs买房计算器',
                desc: '比较租房和买房的成本。',
                recommendBuy: '买房',
                recommendRent: '租房',
                buyingSaves: '买房可节省 {amount}（{years}年内）',
                rentingSaves: '租房可节省 {amount}（{years}年内）'
            },
            homeAffordability: { title: '购房能力计算器', desc: '根据您的收入计算能负担的房价。' },
            loanPayoff: { title: '贷款还清计算器', desc: '看看额外还款如何帮助您更快还清贷款。' },
            debtPayoff: { title: '债务还清规划器', desc: '使用雪球法或雪崩法制定还债计划。' },
            autoLoan: { title: '汽车贷款计算器', desc: '计算车贷月供和融资总成本。' },
            studentLoan: { title: '学生贷款计算器', desc: '规划学生贷款还款，探索减免选项。' },
            compoundInterest: { title: '复利计算器', desc: '看看您的投资如何随时间复利增长。' },
            investmentReturn: { title: '投资回报率(ROI)', desc: '计算投资回报率，比较不同投资方案。' },
            savingsGoal: { title: '储蓄目标计算器', desc: '计算每月需要存多少钱才能达到目标。' },
            emergencyFund: { title: '应急基金计算器', desc: '计算您需要多少应急基金。' },
            retirement: { title: '退休计算器', desc: '规划退休储蓄，看看是否在正轨上。' },
            calc401k: { title: '401(k)计算器', desc: '最大化您的401(k)缴款和雇主匹配。' },
            socialSecurity: { title: '社保估算器', desc: '估算不同年龄的社保福利。' },
            rothVsTraditional: { title: 'Roth vs 传统IRA', desc: '比较Roth和传统IRA，找到最佳选择。' },
            salary: { title: '工资计算器', desc: '在时薪、周薪、月薪和年薪之间转换。' },
            takeHomePay: { title: '实际到手工资', desc: '计算税后和扣除后的净工资。' },
            selfEmploymentTax: { title: '自雇税计算器', desc: '为自由职业者和承包商估算自雇税。' },
            inflation: { title: '通胀计算器', desc: '看看通胀如何影响您的购买力。' }
        },
        common: {
            calculate: '计算',
            reset: '重置',
            results: '结果',
            loading: '加载中...',
            error: '错误',
            years: '年',
            months: '月',
            perMonth: '/月',
            perYear: '/年',
            calculateArrow: '计算 →'
        },
        about: {
            title: '为什么使用我们的计算器？',
            free: { title: '100%免费', desc: '所有计算器完全免费。没有隐藏费用，没有需要解锁的高级功能。' },
            noSignup: { title: '无需注册', desc: '立即开始计算。我们不会要求您的邮箱或个人信息。' },
            privacy: { title: '隐私优先', desc: '所有计算都在您的浏览器中进行。您的财务数据永远不会离开您的设备。' },
            mobile: { title: '移动端友好', desc: '在任何设备上使用我们的计算器 - 手机、平板或台式电脑。' }
        },
        footer: {
            copyright: '© 2026 FinCalc. 保留所有权利。',
            privacy: '隐私政策',
            terms: '服务条款',
            disclaimer: '免责声明：这些计算器仅供参考。如需个性化建议，请咨询专业财务顾问。'
        },
        theme: {
            light: '浅色',
            dark: '深色',
            auto: '自动'
        },
        accessibility: {
            skipToContent: '跳转到主要内容'
        },
        newsletter: {
            subscribe: '订阅',
            emailPlaceholder: '请输入您的邮箱地址',
            invalidEmail: '请输入有效的邮箱地址',
            success: '感谢您的订阅！请查收确认邮件。',
            error: '出现错误，请稍后重试。',
            alreadySubscribed: '您已经订阅了我们的邮件。',
            submitting: '正在订阅...',
            close: '关闭',
            privacy: '我们尊重您的隐私，您可以随时取消订阅。',
            popupTitle: '获取最新资讯！',
            popupDescription: '订阅我们的邮件，获取最新的理财技巧、计算器更新和独家内容。',
            inlineTitle: '订阅我们的邮件',
            inlineDescription: '加入数千名读者，每周获取我们的理财见解和技巧。',
            footerTitle: '获取理财技巧',
            footerDescription: '订阅我们的邮件，每周获取储蓄、投资和理财管理的实用技巧。',
            widgetTitle: '邮件订阅',
            widgetDescription: '每周获取理财技巧和更新。'
        },
        premium: {
            exportPDF: '导出PDF',
            saveResult: '保存结果',
            viewHistory: '历史记录',
            upgradeTitle: '升级到高级版',
            upgradeDescription: '解锁所有功能，包括PDF导出、无限保存和无广告体验。',
            feature: {
                pdfExport: '将计算结果导出为PDF',
                unlimitedSaves: '无限保存计算结果',
                noAds: '无广告体验',
                support: '优先支持'
            },
            plan: {
                monthly: '月付',
                yearly: '年付',
                lifetime: '终身'
            },
            bestValue: '最划算',
            save50: '节省50%',
            oneTime: '一次性付款',
            getStarted: '获取高级版',
            guarantee: '7天退款保证',
            savedCalculations: '已保存的计算',
            noSavedResults: '暂无保存的计算。',
            limitReached: '您已达到免费保存上限。',
            upgradeSaveMore: '升级以保存更多',
            load: '加载',
            delete: '删除',
            loadSuccess: '计算已加载！',
            deleteSuccess: '计算已删除。',
            saveSuccess: '计算已保存！',
            pdfSuccess: 'PDF导出成功！',
            pdfError: 'PDF导出失败，请重试。',
            inputs: '输入',
            results: '结果',
            disclaimer: '此计算仅供参考。如需个性化建议，请咨询财务顾问。',
            checkoutPlaceholder: '支付功能即将推出！目前请享用免费功能。',
            welcomeMessage: '欢迎使用高级版！享受所有功能。'
        },
        affiliate: {
            recommended: '推荐资源',
            disclosure: '通过这些链接购买，我们可能会获得佣金。'
        }
    },
    es: {
        site: {
            name: 'FinCalc',
            tagline: 'Calculadoras Financieras Gratis',
            description: 'Toma decisiones financieras más inteligentes con nuestras calculadoras fáciles de usar.'
        },
        nav: {
            home: 'Inicio',
            calculators: 'Calculadoras',
            blog: 'Blog',
            about: 'Acerca de'
        },
        hero: {
            title: 'Calculadoras Financieras Gratis',
            subtitle: 'Toma decisiones financieras más inteligentes con nuestras calculadoras fáciles de usar. Sin registro, 100% gratis.'
        },
        categories: {
            homeMortgage: 'Hogar e Hipoteca',
            loansDebt: 'Préstamos y Deudas',
            savingsInvestment: 'Ahorro e Inversión',
            retirement: 'Planificación de Jubilación',
            taxIncome: 'Impuestos e Ingresos'
        },
        calculators: {
            mortgage: { title: 'Calculadora de Hipoteca', desc: 'Calcula pagos mensuales, interés total y ve el calendario de amortización.' },
            refinance: { title: 'Calculadora de Refinanciamiento', desc: 'Descubre si refinanciar tu hipoteca podría ahorrarte dinero.' },
            rentVsBuy: {
                title: 'Calculadora Alquilar vs Comprar',
                desc: 'Compara los costos de alquilar versus comprar una casa.',
                recommendBuy: 'Comprar',
                recommendRent: 'Alquilar',
                buyingSaves: 'Comprar ahorra {amount} en {years} años',
                rentingSaves: 'Alquilar ahorra {amount} en {years} años'
            },
            homeAffordability: { title: 'Asequibilidad de Vivienda', desc: 'Descubre cuánta casa puedes pagar según tus ingresos.' },
            loanPayoff: { title: 'Calculadora de Pago de Préstamo', desc: 'Ve cómo los pagos extra pueden ayudarte a pagar préstamos más rápido.' },
            debtPayoff: { title: 'Planificador de Pago de Deudas', desc: 'Crea un plan de pago de deudas usando el método bola de nieve o avalancha.' },
            autoLoan: { title: 'Calculadora de Préstamo de Auto', desc: 'Calcula pagos de préstamo de auto y costo total de financiamiento.' },
            studentLoan: { title: 'Calculadora de Préstamo Estudiantil', desc: 'Planifica el pago de tu préstamo estudiantil y explora opciones de condonación.' },
            compoundInterest: { title: 'Interés Compuesto', desc: 'Ve cómo crecen tus inversiones con el tiempo con interés compuesto.' },
            investmentReturn: { title: 'Retorno de Inversión (ROI)', desc: 'Calcula el ROI y compara diferentes escenarios de inversión.' },
            savingsGoal: { title: 'Calculadora de Meta de Ahorro', desc: 'Descubre cuánto ahorrar mensualmente para alcanzar tu meta.' },
            emergencyFund: { title: 'Fondo de Emergencia', desc: 'Calcula cuánto necesitas en tu fondo de emergencia.' },
            retirement: { title: 'Calculadora de Jubilación', desc: 'Planifica tus ahorros para la jubilación y ve si vas por buen camino.' },
            calc401k: { title: 'Calculadora 401(k)', desc: 'Maximiza tus contribuciones al 401(k) y el aporte del empleador.' },
            socialSecurity: { title: 'Estimador de Seguro Social', desc: 'Estima tus beneficios de Seguro Social a diferentes edades.' },
            rothVsTraditional: { title: 'Roth vs IRA Tradicional', desc: 'Compara Roth y IRA Tradicional para encontrar la mejor opción.' },
            salary: { title: 'Calculadora de Salario', desc: 'Convierte entre salario por hora, semanal, mensual y anual.' },
            takeHomePay: { title: 'Salario Neto', desc: 'Calcula tu pago neto después de impuestos y deducciones.' },
            selfEmploymentTax: { title: 'Impuesto de Autoempleo', desc: 'Estima impuestos de autoempleo para freelancers y contratistas.' },
            inflation: { title: 'Calculadora de Inflación', desc: 'Ve cómo la inflación afecta tu poder adquisitivo con el tiempo.' }
        },
        common: {
            calculate: 'Calcular',
            reset: 'Reiniciar',
            results: 'Resultados',
            loading: 'Cargando...',
            error: 'Error',
            years: 'años',
            months: 'meses',
            perMonth: '/mes',
            perYear: '/año',
            calculateArrow: 'Calcular →'
        },
        about: {
            title: '¿Por Qué Usar Nuestras Calculadoras?',
            free: { title: '100% Gratis', desc: 'Todas las calculadoras son completamente gratis. Sin tarifas ocultas, sin funciones premium que desbloquear.' },
            noSignup: { title: 'Sin Registro', desc: 'Comienza a calcular inmediatamente. No pedimos tu correo ni información personal.' },
            privacy: { title: 'Privacidad Primero', desc: 'Todos los cálculos ocurren en tu navegador. Tus datos financieros nunca salen de tu dispositivo.' },
            mobile: { title: 'Compatible con Móviles', desc: 'Usa nuestras calculadoras en cualquier dispositivo - teléfono, tablet o computadora.' }
        },
        footer: {
            copyright: '© 2026 FinCalc. Todos los derechos reservados.',
            privacy: 'Política de Privacidad',
            terms: 'Términos de Servicio',
            disclaimer: 'Aviso: Estas calculadoras son solo para fines informativos. Consulte a un asesor financiero calificado para obtener asesoramiento personalizado.'
        },
        theme: {
            light: 'Claro',
            dark: 'Oscuro',
            auto: 'Auto'
        },
        accessibility: {
            skipToContent: 'Saltar al contenido principal'
        },
        newsletter: {
            subscribe: 'Suscribirse',
            emailPlaceholder: 'Ingresa tu correo electrónico',
            invalidEmail: 'Por favor ingresa un correo válido',
            success: '¡Gracias por suscribirte! Revisa tu bandeja de entrada.',
            error: 'Algo salió mal. Por favor intenta más tarde.',
            alreadySubscribed: 'Ya estás suscrito a nuestro boletín.',
            submitting: 'Suscribiendo...',
            close: 'Cerrar',
            privacy: 'Respetamos tu privacidad. Cancela cuando quieras.',
            popupTitle: '¡Mantente Actualizado!',
            popupDescription: 'Recibe los últimos consejos financieros, actualizaciones y contenido exclusivo.',
            inlineTitle: 'Suscríbete a Nuestro Boletín',
            inlineDescription: 'Únete a miles de lectores que reciben nuestros consejos financieros semanales.',
            footerTitle: 'Recibe Consejos Financieros',
            footerDescription: 'Suscríbete para recibir consejos semanales sobre ahorro, inversión y finanzas.',
            widgetTitle: 'Boletín',
            widgetDescription: 'Recibe consejos financieros semanales.'
        },
        premium: {
            exportPDF: 'Exportar PDF',
            saveResult: 'Guardar Resultado',
            viewHistory: 'Historial',
            upgradeTitle: 'Actualizar a Premium',
            upgradeDescription: 'Desbloquea todas las funciones incluyendo exportación PDF, guardados ilimitados y experiencia sin anuncios.',
            feature: {
                pdfExport: 'Exportar cálculos a PDF',
                unlimitedSaves: 'Cálculos guardados ilimitados',
                noAds: 'Experiencia sin anuncios',
                support: 'Soporte prioritario'
            },
            plan: {
                monthly: 'Mensual',
                yearly: 'Anual',
                lifetime: 'De por vida'
            },
            bestValue: 'Mejor Valor',
            save50: 'Ahorra 50%',
            oneTime: 'Pago único',
            getStarted: 'Obtener Premium',
            guarantee: 'Garantía de devolución de 7 días',
            savedCalculations: 'Cálculos Guardados',
            noSavedResults: 'Aún no hay cálculos guardados.',
            limitReached: 'Has alcanzado el límite gratuito de cálculos guardados.',
            upgradeSaveMore: 'Actualiza para Guardar Más',
            load: 'Cargar',
            delete: 'Eliminar',
            loadSuccess: '¡Cálculo cargado!',
            deleteSuccess: 'Cálculo eliminado.',
            saveSuccess: '¡Cálculo guardado!',
            pdfSuccess: '¡PDF exportado exitosamente!',
            pdfError: 'Error al exportar PDF. Por favor intenta de nuevo.',
            inputs: 'Entradas',
            results: 'Resultados',
            disclaimer: 'Este cálculo es solo para fines informativos. Consulta a un asesor financiero para consejos personalizados.',
            checkoutPlaceholder: '¡Integración de pago próximamente! Por ahora, disfruta las funciones gratuitas.',
            welcomeMessage: '¡Bienvenido a Premium! Disfruta todas las funciones.'
        },
        affiliate: {
            recommended: 'Recursos Recomendados',
            disclosure: 'Podemos ganar una comisión por compras realizadas a través de estos enlaces.'
        }
    },
    ja: {
        site: {
            name: 'FinCalc',
            tagline: '無料金融計算機',
            description: '使いやすい計算機で、より賢い財務決定を。'
        },
        nav: {
            home: 'ホーム',
            calculators: '計算機',
            blog: 'ブログ',
            about: '概要'
        },
        hero: {
            title: '無料金融計算機',
            subtitle: '使いやすい計算機で、より賢い財務決定を。登録不要、100%無料。'
        },
        categories: {
            homeMortgage: '住宅・住宅ローン',
            loansDebt: 'ローン・債務',
            savingsInvestment: '貯蓄・投資',
            retirement: '退職計画',
            taxIncome: '税金・収入'
        },
        calculators: {
            mortgage: { title: '住宅ローン計算機', desc: '月々の支払い、総利息を計算し、返済スケジュールを表示。' },
            refinance: { title: '借り換え計算機', desc: '住宅ローンの借り換えで節約できるか確認。' },
            rentVsBuy: {
                title: '賃貸vs購入計算機',
                desc: '賃貸と購入のコストを比較。',
                recommendBuy: '購入',
                recommendRent: '賃貸',
                buyingSaves: '購入で{years}年間に{amount}節約',
                rentingSaves: '賃貸で{years}年間に{amount}節約'
            },
            homeAffordability: { title: '住宅購入可能額', desc: '収入に基づいて購入可能な住宅価格を計算。' },
            loanPayoff: { title: 'ローン返済計算機', desc: '追加返済でローンを早く完済する方法を確認。' },
            debtPayoff: { title: '債務返済プランナー', desc: 'スノーボール法またはアバランチ法で返済計画を作成。' },
            autoLoan: { title: '自動車ローン計算機', desc: '自動車ローンの支払いと総融資コストを計算。' },
            studentLoan: { title: '学生ローン計算機', desc: '学生ローンの返済計画と免除オプションを探索。' },
            compoundInterest: { title: '複利計算機', desc: '複利で投資がどのように成長するか確認。' },
            investmentReturn: { title: '投資収益率(ROI)', desc: 'ROIを計算し、異なる投資シナリオを比較。' },
            savingsGoal: { title: '貯蓄目標計算機', desc: '目標達成に必要な月々の貯蓄額を計算。' },
            emergencyFund: { title: '緊急資金', desc: '緊急資金にいくら必要か計算。' },
            retirement: { title: '退職計算機', desc: '退職貯蓄を計画し、目標に向かっているか確認。' },
            calc401k: { title: '401(k)計算機', desc: '401(k)の拠出と雇用主マッチングを最大化。' },
            socialSecurity: { title: '社会保障見積もり', desc: '異なる年齢での社会保障給付を見積もり。' },
            rothVsTraditional: { title: 'Roth vs 従来型IRA', desc: 'RothとTraditional IRAを比較して最適な選択を。' },
            salary: { title: '給与計算機', desc: '時給、週給、月給、年収を相互変換。' },
            takeHomePay: { title: '手取り給与', desc: '税金と控除後の手取り額を計算。' },
            selfEmploymentTax: { title: '自営業税', desc: 'フリーランサーと請負業者の自営業税を見積もり。' },
            inflation: { title: 'インフレ計算機', desc: 'インフレが購買力にどう影響するか確認。' }
        },
        common: {
            calculate: '計算',
            reset: 'リセット',
            results: '結果',
            loading: '読み込み中...',
            error: 'エラー',
            years: '年',
            months: 'ヶ月',
            perMonth: '/月',
            perYear: '/年',
            calculateArrow: '計算 →'
        },
        about: {
            title: 'なぜ当社の計算機を使うのか？',
            free: { title: '100%無料', desc: 'すべての計算機は完全無料。隠れた料金なし、プレミアム機能のロック解除なし。' },
            noSignup: { title: '登録不要', desc: 'すぐに計算を開始。メールや個人情報は求めません。' },
            privacy: { title: 'プライバシー優先', desc: 'すべての計算はブラウザ内で行われます。財務データがデバイスから出ることはありません。' },
            mobile: { title: 'モバイル対応', desc: 'スマートフォン、タブレット、デスクトップなど、どのデバイスでも使用可能。' }
        },
        footer: {
            copyright: '© 2026 FinCalc. All rights reserved.',
            privacy: 'プライバシーポリシー',
            terms: '利用規約',
            disclaimer: '免責事項：これらの計算機は情報提供のみを目的としています。個別のアドバイスについては、資格のあるファイナンシャルアドバイザーにご相談ください。'
        },
        theme: {
            light: 'ライト',
            dark: 'ダーク',
            auto: '自動'
        },
        accessibility: {
            skipToContent: 'メインコンテンツへスキップ'
        },
        newsletter: {
            subscribe: '購読する',
            emailPlaceholder: 'メールアドレスを入力',
            invalidEmail: '有効なメールアドレスを入力してください',
            success: 'ご購読ありがとうございます！確認メールをご確認ください。',
            error: 'エラーが発生しました。後でもう一度お試しください。',
            alreadySubscribed: 'すでにニュースレターを購読しています。',
            submitting: '購読中...',
            close: '閉じる',
            privacy: 'プライバシーを尊重します。いつでも解除できます。',
            popupTitle: '最新情報をお届け！',
            popupDescription: '最新の金融ヒント、計算機の更新、限定コンテンツをお届けします。',
            inlineTitle: 'ニュースレターを購読',
            inlineDescription: '毎週の金融インサイトとヒントを受け取る読者に参加しましょう。',
            footerTitle: '金融ヒントをメールで受け取る',
            footerDescription: '貯蓄、投資、資産管理に関する週刊ヒントを購読してください。',
            widgetTitle: 'ニュースレター',
            widgetDescription: '毎週の金融ヒントと更新情報。'
        },
        premium: {
            exportPDF: 'PDF出力',
            saveResult: '結果を保存',
            viewHistory: '履歴',
            upgradeTitle: 'プレミアムにアップグレード',
            upgradeDescription: 'PDF出力、無制限保存、広告なし体験など、すべての機能をアンロック。',
            feature: {
                pdfExport: '計算結果をPDFに出力',
                unlimitedSaves: '無制限の計算保存',
                noAds: '広告なし体験',
                support: '優先サポート'
            },
            plan: {
                monthly: '月額',
                yearly: '年額',
                lifetime: '永久'
            },
            bestValue: 'お得',
            save50: '50%オフ',
            oneTime: '一回払い',
            getStarted: 'プレミアムを取得',
            guarantee: '7日間返金保証',
            savedCalculations: '保存した計算',
            noSavedResults: 'まだ保存された計算はありません。',
            limitReached: '無料保存の上限に達しました。',
            upgradeSaveMore: 'アップグレードしてもっと保存',
            load: '読み込む',
            delete: '削除',
            loadSuccess: '計算を読み込みました！',
            deleteSuccess: '計算を削除しました。',
            saveSuccess: '計算を保存しました！',
            pdfSuccess: 'PDFを出力しました！',
            pdfError: 'PDF出力に失敗しました。もう一度お試しください。',
            inputs: '入力',
            results: '結果',
            disclaimer: 'この計算は情報提供のみを目的としています。個別のアドバイスについては、ファイナンシャルアドバイザーにご相談ください。',
            checkoutPlaceholder: '決済機能は近日公開予定です！今は無料機能をお楽しみください。',
            welcomeMessage: 'プレミアムへようこそ！すべての機能をお楽しみください。'
        },
        affiliate: {
            recommended: 'おすすめリソース',
            disclosure: 'これらのリンクからの購入で、私たちはコミッションを得る場合があります。'
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
