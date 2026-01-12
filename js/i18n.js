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
            rentVsBuy: { title: 'Rent vs Buy Calculator', desc: 'Compare the costs of renting versus buying a home.' },
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
            rentVsBuy: { title: '租房vs买房计算器', desc: '比较租房和买房的成本。' },
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
