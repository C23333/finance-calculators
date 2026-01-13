/**
 * FinCalc Premium Features System
 * PDF Export, Save Results, and Premium Paywall
 */

const Premium = {
    // Configuration
    config: {
        storageKey: 'fincalc-premium',
        savedResultsKey: 'fincalc-saved-results',
        maxFreeResults: 3,
        trialDays: 7,
        prices: {
            monthly: 4.99,
            yearly: 29.99,
            lifetime: 49.99
        },
        paymentUrl: '/premium/checkout', // Placeholder - replace with actual payment URL
        features: {
            pdfExport: true,
            saveResults: true,
            unlimitedSaves: true,
            noAds: true,
            prioritySupport: true
        }
    },

    // State
    state: {
        isPremium: false,
        savedResults: [],
        initialized: false
    },

    /**
     * Initialize premium system
     */
    init() {
        if (this.state.initialized) return;

        this.loadPremiumStatus();
        this.loadSavedResults();
        this.injectPremiumButtons();
        this.setupEventListeners();

        this.state.initialized = true;
        console.log('[Premium] Initialized');
    },

    /**
     * Load premium status from storage
     */
    loadPremiumStatus() {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                // Check if premium is still valid
                if (data.expiresAt && new Date(data.expiresAt) > new Date()) {
                    this.state.isPremium = true;
                } else if (data.lifetime) {
                    this.state.isPremium = true;
                }
            }
        } catch (e) {
            console.warn('[Premium] Failed to load status:', e);
        }
    },

    /**
     * Load saved results from storage
     */
    loadSavedResults() {
        try {
            const stored = localStorage.getItem(this.config.savedResultsKey);
            if (stored) {
                this.state.savedResults = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('[Premium] Failed to load saved results:', e);
        }
    },

    /**
     * Save results to storage
     */
    saveSavedResults() {
        try {
            localStorage.setItem(this.config.savedResultsKey, JSON.stringify(this.state.savedResults));
        } catch (e) {
            console.warn('[Premium] Failed to save results:', e);
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
     * Inject premium buttons into calculator pages
     */
    injectPremiumButtons() {
        const resultsSection = document.querySelector('.results');
        if (!resultsSection) return;

        // Check if buttons already exist
        if (document.querySelector('.premium-actions')) return;

        const actionsHtml = `
            <div class="premium-actions">
                <button class="premium-btn premium-btn-pdf" onclick="Premium.exportPDF()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span data-i18n="premium.exportPDF">${this.t('premium.exportPDF', 'Export PDF')}</span>
                </button>
                <button class="premium-btn premium-btn-save" onclick="Premium.saveResult()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    <span data-i18n="premium.saveResult">${this.t('premium.saveResult', 'Save Result')}</span>
                </button>
                <button class="premium-btn premium-btn-history" onclick="Premium.showSavedResults()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span data-i18n="premium.viewHistory">${this.t('premium.viewHistory', 'History')}</span>
                    <span class="premium-badge">${this.state.savedResults.length}</span>
                </button>
            </div>
        `;

        // Insert after results heading
        const resultsHeading = resultsSection.querySelector('h2') || resultsSection.querySelector('.result-highlight');
        if (resultsHeading) {
            resultsHeading.insertAdjacentHTML('afterend', actionsHtml);
        } else {
            resultsSection.insertAdjacentHTML('afterbegin', actionsHtml);
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for calculation complete
        document.addEventListener('calculationComplete', () => {
            this.injectPremiumButtons();
            this.updateHistoryBadge();
        });

        // Listen for language change
        document.addEventListener('languageChange', () => {
            // Re-translate buttons
            document.querySelectorAll('.premium-actions [data-i18n]').forEach(el => {
                const key = el.dataset.i18n;
                el.textContent = this.t(key, el.textContent);
            });
        });
    },

    /**
     * Update history badge count
     */
    updateHistoryBadge() {
        const badge = document.querySelector('.premium-btn-history .premium-badge');
        if (badge) {
            badge.textContent = this.state.savedResults.length;
        }
    },

    /**
     * Check if user can use premium feature
     */
    canUsePremiumFeature(feature) {
        if (this.state.isPremium) return true;

        // Free tier limits
        if (feature === 'saveResults') {
            return this.state.savedResults.length < this.config.maxFreeResults;
        }

        return false;
    },

    /**
     * Show premium paywall
     */
    showPaywall(feature) {
        const modal = document.createElement('div');
        modal.className = 'premium-modal-overlay';
        modal.innerHTML = `
            <div class="premium-modal">
                <button class="premium-modal-close" onclick="Premium.closePaywall()">&times;</button>
                <div class="premium-modal-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                </div>
                <h2 data-i18n="premium.upgradeTitle">${this.t('premium.upgradeTitle', 'Upgrade to Premium')}</h2>
                <p data-i18n="premium.upgradeDescription">${this.t('premium.upgradeDescription', 'Unlock all features including PDF export, unlimited saves, and ad-free experience.')}</p>

                <div class="premium-features-list">
                    <div class="premium-feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span data-i18n="premium.feature.pdfExport">${this.t('premium.feature.pdfExport', 'Export calculations to PDF')}</span>
                    </div>
                    <div class="premium-feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span data-i18n="premium.feature.unlimitedSaves">${this.t('premium.feature.unlimitedSaves', 'Unlimited saved calculations')}</span>
                    </div>
                    <div class="premium-feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span data-i18n="premium.feature.noAds">${this.t('premium.feature.noAds', 'Ad-free experience')}</span>
                    </div>
                    <div class="premium-feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span data-i18n="premium.feature.support">${this.t('premium.feature.support', 'Priority support')}</span>
                    </div>
                </div>

                <div class="premium-pricing">
                    <div class="premium-price-option" onclick="Premium.selectPlan('monthly')">
                        <div class="premium-price-name" data-i18n="premium.plan.monthly">${this.t('premium.plan.monthly', 'Monthly')}</div>
                        <div class="premium-price-amount">$${this.config.prices.monthly}<span>/mo</span></div>
                    </div>
                    <div class="premium-price-option premium-price-popular" onclick="Premium.selectPlan('yearly')">
                        <div class="premium-price-badge" data-i18n="premium.bestValue">${this.t('premium.bestValue', 'Best Value')}</div>
                        <div class="premium-price-name" data-i18n="premium.plan.yearly">${this.t('premium.plan.yearly', 'Yearly')}</div>
                        <div class="premium-price-amount">$${this.config.prices.yearly}<span>/yr</span></div>
                        <div class="premium-price-savings" data-i18n="premium.save50">${this.t('premium.save50', 'Save 50%')}</div>
                    </div>
                    <div class="premium-price-option" onclick="Premium.selectPlan('lifetime')">
                        <div class="premium-price-name" data-i18n="premium.plan.lifetime">${this.t('premium.plan.lifetime', 'Lifetime')}</div>
                        <div class="premium-price-amount">$${this.config.prices.lifetime}</div>
                        <div class="premium-price-savings" data-i18n="premium.oneTime">${this.t('premium.oneTime', 'One-time payment')}</div>
                    </div>
                </div>

                <button class="premium-cta-btn" onclick="Premium.startCheckout()">
                    <span data-i18n="premium.getStarted">${this.t('premium.getStarted', 'Get Premium')}</span>
                </button>

                <p class="premium-guarantee" data-i18n="premium.guarantee">${this.t('premium.guarantee', '7-day money-back guarantee')}</p>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Track paywall view
        if (window.ClickTracker) {
            window.ClickTracker.track('paywall_view', { feature });
        }
    },

    /**
     * Close paywall modal
     */
    closePaywall() {
        const modal = document.querySelector('.premium-modal-overlay');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    /**
     * Select pricing plan
     */
    selectPlan(plan) {
        document.querySelectorAll('.premium-price-option').forEach(el => {
            el.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        this.selectedPlan = plan;
    },

    /**
     * Start checkout process
     */
    startCheckout() {
        const plan = this.selectedPlan || 'yearly';

        // Track checkout start
        if (window.ClickTracker) {
            window.ClickTracker.track('checkout_start', { plan });
        }

        // Redirect to payment page (placeholder)
        // In production, integrate with Stripe, PayPal, etc.
        alert(this.t('premium.checkoutPlaceholder', 'Payment integration coming soon! For now, enjoy the free features.'));

        // For demo purposes, grant temporary premium
        // this.grantPremium(plan);
    },

    /**
     * Grant premium access (called after successful payment)
     */
    grantPremium(plan) {
        const data = {
            plan,
            grantedAt: new Date().toISOString()
        };

        if (plan === 'lifetime') {
            data.lifetime = true;
        } else {
            const days = plan === 'yearly' ? 365 : 30;
            data.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        }

        localStorage.setItem(this.config.storageKey, JSON.stringify(data));
        this.state.isPremium = true;
        this.closePaywall();

        // Show success message
        this.showNotification(this.t('premium.welcomeMessage', 'Welcome to Premium! Enjoy all features.'), 'success');
    },

    /**
     * Export current calculation to PDF
     */
    async exportPDF() {
        if (!this.canUsePremiumFeature('pdfExport')) {
            this.showPaywall('pdfExport');
            return;
        }

        // Show loading state
        const btn = document.querySelector('.premium-btn-pdf');
        if (btn) {
            btn.classList.add('loading');
            btn.disabled = true;
        }

        try {
            // Get calculator data
            const calculatorType = this.getCalculatorType();
            const results = this.getCalculationResults();
            const inputs = this.getCalculationInputs();

            // Generate PDF using browser print
            await this.generatePDF(calculatorType, inputs, results);

            // Track export
            if (window.ClickTracker) {
                window.ClickTracker.track('pdf_export', { calculator: calculatorType });
            }

            this.showNotification(this.t('premium.pdfSuccess', 'PDF exported successfully!'), 'success');
        } catch (e) {
            console.error('[Premium] PDF export failed:', e);
            this.showNotification(this.t('premium.pdfError', 'Failed to export PDF. Please try again.'), 'error');
        } finally {
            if (btn) {
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        }
    },

    /**
     * Generate PDF using print dialog
     */
    async generatePDF(calculatorType, inputs, results) {
        // Create print-friendly content
        const printContent = document.createElement('div');
        printContent.className = 'print-content';
        printContent.innerHTML = `
            <style>
                @media print {
                    body * { visibility: hidden; }
                    .print-content, .print-content * { visibility: visible; }
                    .print-content { position: absolute; left: 0; top: 0; width: 100%; }
                    .print-header { text-align: center; margin-bottom: 20px; }
                    .print-logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
                    .print-date { color: #666; font-size: 12px; }
                    .print-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                    .print-section h3 { margin: 0 0 10px 0; color: #333; }
                    .print-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .print-row:last-child { border-bottom: none; }
                    .print-label { color: #666; }
                    .print-value { font-weight: 600; color: #333; }
                    .print-highlight { background: #f0f0ff; padding: 15px; border-radius: 8px; text-align: center; }
                    .print-highlight .big-number { font-size: 32px; font-weight: bold; color: #4f46e5; }
                    .print-footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; }
                }
            </style>
            <div class="print-header">
                <div class="print-logo">FinCalc</div>
                <div class="print-date">${new Date().toLocaleDateString()}</div>
            </div>
            <h2>${this.getCalculatorTitle(calculatorType)}</h2>
            <div class="print-section">
                <h3>${this.t('premium.inputs', 'Inputs')}</h3>
                ${Object.entries(inputs).map(([key, value]) => `
                    <div class="print-row">
                        <span class="print-label">${key}</span>
                        <span class="print-value">${value}</span>
                    </div>
                `).join('')}
            </div>
            <div class="print-section">
                <h3>${this.t('premium.results', 'Results')}</h3>
                ${Object.entries(results).map(([key, value]) => `
                    <div class="print-row">
                        <span class="print-label">${key}</span>
                        <span class="print-value">${value}</span>
                    </div>
                `).join('')}
            </div>
            <div class="print-footer">
                ${this.t('premium.disclaimer', 'This calculation is for informational purposes only. Consult a financial advisor for personalized advice.')}
                <br>Generated by FinCalc - financecalc.cc
            </div>
        `;

        document.body.appendChild(printContent);
        window.print();
        document.body.removeChild(printContent);
    },

    /**
     * Save current calculation result
     */
    saveResult() {
        if (!this.canUsePremiumFeature('saveResults')) {
            this.showPaywall('saveResults');
            return;
        }

        const calculatorType = this.getCalculatorType();
        const results = this.getCalculationResults();
        const inputs = this.getCalculationInputs();

        const savedResult = {
            id: Date.now().toString(),
            calculator: calculatorType,
            title: this.getCalculatorTitle(calculatorType),
            inputs,
            results,
            savedAt: new Date().toISOString()
        };

        this.state.savedResults.unshift(savedResult);

        // Limit to 50 saved results
        if (this.state.savedResults.length > 50) {
            this.state.savedResults = this.state.savedResults.slice(0, 50);
        }

        this.saveSavedResults();
        this.updateHistoryBadge();

        // Track save
        if (window.ClickTracker) {
            window.ClickTracker.track('result_saved', { calculator: calculatorType });
        }

        this.showNotification(this.t('premium.saveSuccess', 'Calculation saved!'), 'success');
    },

    /**
     * Show saved results modal
     */
    showSavedResults() {
        const modal = document.createElement('div');
        modal.className = 'premium-modal-overlay';

        const resultsHtml = this.state.savedResults.length > 0
            ? this.state.savedResults.map(result => `
                <div class="saved-result-item" data-id="${result.id}">
                    <div class="saved-result-header">
                        <span class="saved-result-title">${result.title}</span>
                        <span class="saved-result-date">${new Date(result.savedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="saved-result-preview">
                        ${Object.entries(result.results).slice(0, 2).map(([k, v]) => `<span>${k}: ${v}</span>`).join(' | ')}
                    </div>
                    <div class="saved-result-actions">
                        <button onclick="Premium.loadSavedResult('${result.id}')" class="saved-result-btn">
                            ${this.t('premium.load', 'Load')}
                        </button>
                        <button onclick="Premium.deleteSavedResult('${result.id}')" class="saved-result-btn saved-result-btn-delete">
                            ${this.t('premium.delete', 'Delete')}
                        </button>
                    </div>
                </div>
            `).join('')
            : `<p class="no-saved-results">${this.t('premium.noSavedResults', 'No saved calculations yet.')}</p>`;

        modal.innerHTML = `
            <div class="premium-modal premium-modal-history">
                <button class="premium-modal-close" onclick="Premium.closePaywall()">&times;</button>
                <h2 data-i18n="premium.savedCalculations">${this.t('premium.savedCalculations', 'Saved Calculations')}</h2>
                <div class="saved-results-list">
                    ${resultsHtml}
                </div>
                ${!this.state.isPremium && this.state.savedResults.length >= this.config.maxFreeResults ? `
                    <div class="saved-results-limit">
                        <p>${this.t('premium.limitReached', `You've reached the free limit of ${this.config.maxFreeResults} saved calculations.`)}</p>
                        <button class="premium-cta-btn" onclick="Premium.showPaywall('saveResults')">
                            ${this.t('premium.upgradeSaveMore', 'Upgrade to Save More')}
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    },

    /**
     * Load a saved result
     */
    loadSavedResult(id) {
        const result = this.state.savedResults.find(r => r.id === id);
        if (!result) return;

        // Check if we're on the right calculator page
        const currentCalculator = this.getCalculatorType();
        if (currentCalculator !== result.calculator) {
            // Redirect to correct calculator
            window.location.href = `/calculators/${result.calculator}.html?load=${id}`;
            return;
        }

        // Load inputs into form
        Object.entries(result.inputs).forEach(([key, value]) => {
            const input = document.querySelector(`[name="${key}"], #${key}`);
            if (input) {
                input.value = value;
            }
        });

        // Trigger calculation
        const form = document.querySelector('form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }

        this.closePaywall();
        this.showNotification(this.t('premium.loadSuccess', 'Calculation loaded!'), 'success');
    },

    /**
     * Delete a saved result
     */
    deleteSavedResult(id) {
        this.state.savedResults = this.state.savedResults.filter(r => r.id !== id);
        this.saveSavedResults();

        // Remove from UI
        const item = document.querySelector(`.saved-result-item[data-id="${id}"]`);
        if (item) {
            item.remove();
        }

        this.updateHistoryBadge();
        this.showNotification(this.t('premium.deleteSuccess', 'Calculation deleted.'), 'info');
    },

    /**
     * Get current calculator type from URL
     */
    getCalculatorType() {
        const path = window.location.pathname;
        const match = path.match(/calculators\/([^.]+)\.html/);
        return match ? match[1] : 'unknown';
    },

    /**
     * Get calculator title
     */
    getCalculatorTitle(type) {
        const titles = {
            'mortgage': 'Mortgage Calculator',
            'compound-interest': 'Compound Interest Calculator',
            'retirement': 'Retirement Calculator',
            '401k': '401(k) Calculator',
            'debt-payoff': 'Debt Payoff Calculator',
            'loan-payoff': 'Loan Payoff Calculator',
            'auto-loan': 'Auto Loan Calculator',
            'student-loan': 'Student Loan Calculator',
            'savings-goal': 'Savings Goal Calculator',
            'emergency-fund': 'Emergency Fund Calculator',
            'salary': 'Salary Calculator',
            'take-home-pay': 'Take Home Pay Calculator',
            'self-employment-tax': 'Self-Employment Tax Calculator',
            'inflation': 'Inflation Calculator',
            'refinance': 'Refinance Calculator',
            'rent-vs-buy': 'Rent vs Buy Calculator',
            'home-affordability': 'Home Affordability Calculator',
            'social-security': 'Social Security Calculator',
            'roth-vs-traditional': 'Roth vs Traditional Calculator',
            'investment-return': 'Investment Return Calculator'
        };
        return this.t(`calculators.${type}.title`, titles[type] || type);
    },

    /**
     * Get calculation inputs from form
     */
    getCalculationInputs() {
        const inputs = {};
        const form = document.querySelector('form');
        if (!form) return inputs;

        form.querySelectorAll('input, select').forEach(el => {
            const label = document.querySelector(`label[for="${el.id}"]`);
            const key = label ? label.textContent.trim() : el.id;
            inputs[key] = el.value;
        });

        return inputs;
    },

    /**
     * Get calculation results from page
     */
    getCalculationResults() {
        const results = {};

        // Get from result cards
        document.querySelectorAll('.result-card, .result-item').forEach(card => {
            const label = card.querySelector('.label, .result-label');
            const value = card.querySelector('.value, .result-value');
            if (label && value) {
                results[label.textContent.trim()] = value.textContent.trim();
            }
        });

        // Get highlight value
        const highlight = document.querySelector('.result-highlight .big-number');
        const highlightLabel = document.querySelector('.result-highlight p');
        if (highlight && highlightLabel) {
            results[highlightLabel.textContent.trim()] = highlight.textContent.trim();
        }

        return results;
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `premium-notification premium-notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Premium.init());
} else {
    Premium.init();
}

// Export for external use
window.Premium = Premium;
