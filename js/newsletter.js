/**
 * FinCalc Newsletter Subscription System
 * Features: Form validation, API integration, i18n support, duplicate prevention
 */

const Newsletter = {
    // Configuration
    config: {
        // Replace with your actual newsletter service endpoint
        // Examples:
        // Mailchimp: 'https://YOUR_DC.api.mailchimp.com/3.0/lists/YOUR_LIST_ID/members'
        // ConvertKit: 'https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe'
        // Custom: '/api/newsletter/subscribe'
        apiUrl: '/api/newsletter/subscribe',

        // Storage key for tracking subscriptions
        storageKey: 'fincalc-newsletter-subscribed',

        // Debounce time for form submission (ms)
        submitDebounce: 2000,

        // Show popup after delay (ms), 0 to disable auto-popup
        popupDelay: 30000,

        // Show popup after scroll percentage, 0 to disable
        popupScrollTrigger: 50,

        // Days before showing popup again after dismissal
        dismissDays: 7
    },

    // State
    state: {
        isSubmitting: false,
        lastSubmitTime: 0,
        popupShown: false
    },

    /**
     * Initialize the newsletter system
     */
    init() {
        // Wait for i18n to be ready
        if (typeof I18n !== 'undefined' && I18n.isLoaded) {
            this._setup();
        } else {
            document.addEventListener('i18nReady', () => this._setup());
        }
    },

    /**
     * Internal setup after i18n is ready
     */
    _setup() {
        // Initialize all newsletter forms on the page
        this._initForms();

        // Setup popup triggers if not already subscribed
        if (!this._isSubscribed() && !this._isDismissed()) {
            this._setupPopupTriggers();
        }

        // Listen for language changes to update translations
        document.addEventListener('languageChange', () => {
            this._updateTranslations();
        });
    },

    /**
     * Initialize all newsletter forms
     */
    _initForms() {
        const forms = document.querySelectorAll('.newsletter-form');
        forms.forEach(form => this._setupForm(form));
    },

    /**
     * Setup a single newsletter form
     */
    _setupForm(form) {
        const emailInput = form.querySelector('.newsletter-email');
        const submitBtn = form.querySelector('.newsletter-submit');
        const messageEl = form.querySelector('.newsletter-message');

        if (!emailInput || !submitBtn) return;

        // Real-time email validation
        emailInput.addEventListener('input', () => {
            this._validateEmail(emailInput);
        });

        emailInput.addEventListener('blur', () => {
            this._validateEmail(emailInput, true);
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._handleSubmit(form);
        });

        // Update translations
        this._translateForm(form);
    },

    /**
     * Validate email input
     */
    _validateEmail(input, showError = false) {
        const email = input.value.trim();
        const isValid = this._isValidEmail(email);
        const form = input.closest('.newsletter-form');
        const messageEl = form?.querySelector('.newsletter-message');

        input.classList.remove('valid', 'invalid');

        if (email.length > 0) {
            input.classList.add(isValid ? 'valid' : 'invalid');

            if (!isValid && showError && messageEl) {
                this._showMessage(messageEl, 'error', I18n.t('newsletter.invalidEmail'));
            }
        }

        return isValid;
    },

    /**
     * Check if email is valid
     */
    _isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Handle form submission
     */
    async _handleSubmit(form) {
        const emailInput = form.querySelector('.newsletter-email');
        const submitBtn = form.querySelector('.newsletter-submit');
        const messageEl = form.querySelector('.newsletter-message');
        const email = emailInput.value.trim();

        // Prevent duplicate submissions
        const now = Date.now();
        if (this.state.isSubmitting || (now - this.state.lastSubmitTime) < this.config.submitDebounce) {
            return;
        }

        // Validate email
        if (!this._isValidEmail(email)) {
            this._showMessage(messageEl, 'error', I18n.t('newsletter.invalidEmail'));
            emailInput.focus();
            return;
        }

        // Check if already subscribed
        if (this._isSubscribed()) {
            this._showMessage(messageEl, 'info', I18n.t('newsletter.alreadySubscribed'));
            return;
        }

        // Start submission
        this.state.isSubmitting = true;
        this.state.lastSubmitTime = now;
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        this._showMessage(messageEl, 'loading', I18n.t('newsletter.submitting'));

        try {
            const response = await this._submitToAPI(email);

            if (response.success) {
                this._markAsSubscribed(email);
                this._showMessage(messageEl, 'success', I18n.t('newsletter.success'));
                emailInput.value = '';
                emailInput.classList.remove('valid', 'invalid');

                // Close popup if open
                this._closePopup();

                // Dispatch success event
                document.dispatchEvent(new CustomEvent('newsletterSubscribed', {
                    detail: { email }
                }));
            } else {
                throw new Error(response.message || 'Subscription failed');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this._showMessage(messageEl, 'error', I18n.t('newsletter.error'));
        } finally {
            this.state.isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    },

    /**
     * Submit email to API
     */
    async _submitToAPI(email) {
        // For demo/development, simulate API call
        // Replace this with actual API integration

        if (this.config.apiUrl.startsWith('/api/')) {
            // Simulated response for development
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Simulate 95% success rate
                    if (Math.random() > 0.05) {
                        resolve({ success: true });
                    } else {
                        resolve({ success: false, message: 'Server error' });
                    }
                }, 1000);
            });
        }

        // Real API call
        const response = await fetch(this.config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                source: window.location.pathname,
                language: I18n.currentLang,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    },

    /**
     * Show message in form
     */
    _showMessage(element, type, message) {
        if (!element) return;

        element.className = `newsletter-message ${type}`;
        element.textContent = message;
        element.style.display = 'block';

        // Auto-hide success/info messages
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    },

    /**
     * Check if user is already subscribed
     */
    _isSubscribed() {
        return localStorage.getItem(this.config.storageKey) !== null;
    },

    /**
     * Mark user as subscribed
     */
    _markAsSubscribed(email) {
        localStorage.setItem(this.config.storageKey, JSON.stringify({
            email: email,
            date: new Date().toISOString()
        }));
    },

    /**
     * Check if popup was recently dismissed
     */
    _isDismissed() {
        const dismissed = localStorage.getItem(`${this.config.storageKey}-dismissed`);
        if (!dismissed) return false;

        const dismissedDate = new Date(dismissed);
        const daysSinceDismissal = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

        return daysSinceDismissal < this.config.dismissDays;
    },

    /**
     * Mark popup as dismissed
     */
    _markAsDismissed() {
        localStorage.setItem(`${this.config.storageKey}-dismissed`, new Date().toISOString());
    },

    /**
     * Setup popup triggers
     */
    _setupPopupTriggers() {
        // Time-based trigger
        if (this.config.popupDelay > 0) {
            setTimeout(() => {
                if (!this.state.popupShown) {
                    this._showPopup();
                }
            }, this.config.popupDelay);
        }

        // Scroll-based trigger
        if (this.config.popupScrollTrigger > 0) {
            let scrollTriggered = false;
            window.addEventListener('scroll', () => {
                if (scrollTriggered || this.state.popupShown) return;

                const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
                if (scrollPercent >= this.config.popupScrollTrigger) {
                    scrollTriggered = true;
                    this._showPopup();
                }
            }, { passive: true });
        }

        // Exit intent trigger (desktop only)
        if (window.matchMedia('(pointer: fine)').matches) {
            document.addEventListener('mouseout', (e) => {
                if (this.state.popupShown) return;
                if (e.clientY <= 0 && e.relatedTarget === null) {
                    this._showPopup();
                }
            });
        }
    },

    /**
     * Show newsletter popup
     */
    _showPopup() {
        if (this.state.popupShown || this._isSubscribed() || this._isDismissed()) return;

        this.state.popupShown = true;

        // Create popup if it doesn't exist
        let popup = document.querySelector('.newsletter-popup');
        if (!popup) {
            popup = this._createPopup();
            document.body.appendChild(popup);
        }

        // Show popup with animation
        requestAnimationFrame(() => {
            popup.classList.add('show');
        });

        // Setup close handlers
        const closeBtn = popup.querySelector('.newsletter-popup-close');
        const overlay = popup.querySelector('.newsletter-popup-overlay');

        closeBtn?.addEventListener('click', () => this._closePopup());
        overlay?.addEventListener('click', () => this._closePopup());

        // Close on Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this._closePopup();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Initialize the form in popup
        const form = popup.querySelector('.newsletter-form');
        if (form) {
            this._setupForm(form);
        }
    },

    /**
     * Close newsletter popup
     */
    _closePopup() {
        const popup = document.querySelector('.newsletter-popup');
        if (popup) {
            popup.classList.remove('show');
            this._markAsDismissed();

            // Remove popup after animation
            setTimeout(() => {
                popup.remove();
            }, 300);
        }
    },

    /**
     * Create popup element
     */
    _createPopup() {
        const popup = document.createElement('div');
        popup.className = 'newsletter-popup';
        popup.innerHTML = `
            <div class="newsletter-popup-overlay"></div>
            <div class="newsletter-popup-content">
                <button class="newsletter-popup-close" aria-label="${I18n.t('newsletter.close')}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="newsletter-popup-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </div>
                <h3 class="newsletter-popup-title" data-i18n="newsletter.popupTitle">${I18n.t('newsletter.popupTitle')}</h3>
                <p class="newsletter-popup-description" data-i18n="newsletter.popupDescription">${I18n.t('newsletter.popupDescription')}</p>
                <form class="newsletter-form">
                    <div class="newsletter-input-group">
                        <input type="email"
                               class="newsletter-email"
                               placeholder="${I18n.t('newsletter.emailPlaceholder')}"
                               data-i18n-attr="placeholder:newsletter.emailPlaceholder"
                               required
                               autocomplete="email">
                        <button type="submit" class="newsletter-submit" data-i18n="newsletter.subscribe">
                            ${I18n.t('newsletter.subscribe')}
                        </button>
                    </div>
                    <div class="newsletter-message"></div>
                </form>
                <p class="newsletter-privacy" data-i18n="newsletter.privacy">${I18n.t('newsletter.privacy')}</p>
            </div>
        `;
        return popup;
    },

    /**
     * Create inline newsletter component
     * @param {object} options - Component options
     * @returns {HTMLElement} Newsletter component element
     */
    createInlineComponent(options = {}) {
        const {
            title = I18n.t('newsletter.inlineTitle'),
            description = I18n.t('newsletter.inlineDescription'),
            compact = false,
            className = ''
        } = options;

        const component = document.createElement('div');
        component.className = `newsletter-inline ${compact ? 'compact' : ''} ${className}`.trim();
        component.innerHTML = `
            <div class="newsletter-inline-content">
                ${!compact ? `
                    <div class="newsletter-inline-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </div>
                ` : ''}
                <div class="newsletter-inline-text">
                    <h4 class="newsletter-inline-title" data-i18n="newsletter.inlineTitle">${title}</h4>
                    ${!compact ? `<p class="newsletter-inline-description" data-i18n="newsletter.inlineDescription">${description}</p>` : ''}
                </div>
            </div>
            <form class="newsletter-form">
                <div class="newsletter-input-group">
                    <input type="email"
                           class="newsletter-email"
                           placeholder="${I18n.t('newsletter.emailPlaceholder')}"
                           data-i18n-attr="placeholder:newsletter.emailPlaceholder"
                           required
                           autocomplete="email">
                    <button type="submit" class="newsletter-submit" data-i18n="newsletter.subscribe">
                        ${I18n.t('newsletter.subscribe')}
                    </button>
                </div>
                <div class="newsletter-message"></div>
            </form>
        `;

        // Setup form after adding to DOM
        setTimeout(() => {
            const form = component.querySelector('.newsletter-form');
            if (form) {
                this._setupForm(form);
            }
        }, 0);

        return component;
    },

    /**
     * Translate form elements
     */
    _translateForm(form) {
        const emailInput = form.querySelector('.newsletter-email');
        const submitBtn = form.querySelector('.newsletter-submit');

        if (emailInput) {
            emailInput.placeholder = I18n.t('newsletter.emailPlaceholder');
        }
        if (submitBtn) {
            submitBtn.textContent = I18n.t('newsletter.subscribe');
        }
    },

    /**
     * Update all translations
     */
    _updateTranslations() {
        // Update all forms
        const forms = document.querySelectorAll('.newsletter-form');
        forms.forEach(form => this._translateForm(form));

        // Update popup if visible
        const popup = document.querySelector('.newsletter-popup');
        if (popup) {
            I18n.translateDynamicContent(popup);
        }

        // Update inline components
        const inlineComponents = document.querySelectorAll('.newsletter-inline');
        inlineComponents.forEach(component => {
            I18n.translateDynamicContent(component);
        });
    },

    /**
     * Manually show the popup
     */
    showPopup() {
        this.state.popupShown = false;
        this._showPopup();
    },

    /**
     * Get subscription status
     */
    getSubscriptionStatus() {
        const data = localStorage.getItem(this.config.storageKey);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    },

    /**
     * Clear subscription status (for testing)
     */
    clearSubscription() {
        localStorage.removeItem(this.config.storageKey);
        localStorage.removeItem(`${this.config.storageKey}-dismissed`);
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Newsletter.init());
} else {
    Newsletter.init();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Newsletter;
}

window.Newsletter = Newsletter;
