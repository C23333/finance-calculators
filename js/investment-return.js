// Investment Return Calculator Logic

document.getElementById('investmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateInvestmentReturn();
});

// Auto-calculate on input change
document.querySelectorAll('#investmentForm input, #investmentForm select').forEach(input => {
    input.addEventListener('input', () => calculateInvestmentReturn());
});

// Tab switching functionality
document.querySelectorAll('.calc-output-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs
        document.querySelectorAll('.calc-output-tab').forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Hide all tab contents
        document.querySelectorAll('.calc-tab-content').forEach(content => content.classList.remove('active'));
        // Show corresponding tab content
        const tabId = this.getAttribute('data-tab') + 'Content';
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
            tabContent.classList.add('active');
        }
    });
});

function calculateInvestmentReturn() {
    // Get input values
    const initialInvestment = parseFloat(document.getElementById('initialInvestment').value);
    const finalValue = parseFloat(document.getElementById('finalValue').value);
    const years = parseFloat(document.getElementById('holdingPeriod').value);

    // Calculate profit/loss
    const profitLoss = finalValue - initialInvestment;

    // Calculate simple ROI
    const simpleROI = ((finalValue - initialInvestment) / initialInvestment) * 100;

    // Calculate CAGR (Compound Annual Growth Rate)
    // CAGR = (FV/PV)^(1/n) - 1
    const cagr = (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100;

    // Calculate doubling time using Rule of 72
    let doublingTime = '-';
    if (cagr > 0) {
        const doublingYears = (72 / cagr).toFixed(1);
        doublingTime = getDoublingTimeText(doublingYears);
    } else if (cagr < 0) {
        doublingTime = getDoublingTimeNAText();
    }

    // Update results
    document.getElementById('totalReturn').textContent = formatPercent(simpleROI);
    document.getElementById('profitLoss').textContent = formatCurrency(profitLoss);
    document.getElementById('annualizedReturn').textContent = formatPercent(cagr);
    document.getElementById('simpleROI').textContent = formatPercent(simpleROI);
    document.getElementById('doublingTime').textContent = doublingTime;

    // Color code profit/loss
    const profitLossEl = document.getElementById('profitLoss');
    const totalReturnEl = document.getElementById('totalReturn');

    if (profitLoss >= 0) {
        profitLossEl.style.color = '#10b981';
        totalReturnEl.style.color = '#10b981';
    } else {
        profitLossEl.style.color = '#ef4444';
        totalReturnEl.style.color = '#ef4444';
    }

    // Update details tab
    const initialDisplayEl = document.getElementById('initialDisplay');
    if (initialDisplayEl) {
        initialDisplayEl.textContent = formatCurrencySimple(initialInvestment);
    }
    
    const finalDisplayEl = document.getElementById('finalDisplay');
    if (finalDisplayEl) {
        finalDisplayEl.textContent = formatCurrencySimple(finalValue);
    }
    
    const periodDisplayEl = document.getElementById('periodDisplay');
    if (periodDisplayEl) {
        periodDisplayEl.textContent = `${years} years`;
    }
}

/**
 * Get localized doubling time text with years
 * @param {string} years - The number of years
 * @returns {string} Localized doubling time text
 */
function getDoublingTimeText(years) {
    // Check if I18n is available and has the translation
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        const template = I18n.t('calculators.investmentReturn.doublingTimeYears');
        // If translation exists and contains {years} placeholder
        if (template && template !== 'calculators.investmentReturn.doublingTimeYears') {
            return template.replace('{years}', years);
        }
    }
    // Fallback to English
    return `${years} years`;
}

/**
 * Get localized N/A text for negative returns
 * @returns {string} Localized N/A text
 */
function getDoublingTimeNAText() {
    // Check if I18n is available and has the translation
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        const text = I18n.t('calculators.investmentReturn.doublingTimeNA');
        if (text && text !== 'calculators.investmentReturn.doublingTimeNA') {
            return text;
        }
    }
    // Fallback to English
    return 'N/A (negative return)';
}

/**
 * Format currency using I18n if available, otherwise fallback to default
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    const prefix = amount >= 0 ? '+' : '';
    // Use I18n.formatCurrency if available
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        return prefix + I18n.formatCurrency(Math.abs(amount), { decimals: 0 });
    }
    // Fallback to default formatting
    return prefix + new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.abs(amount));
}

/**
 * Format currency without prefix
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrencySimple(amount) {
    // Use I18n.formatCurrency if available
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        return I18n.formatCurrency(amount, { decimals: 0 });
    }
    // Fallback to default formatting
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatPercent(value) {
    const prefix = value >= 0 ? '+' : '';
    return prefix + value.toFixed(2) + '%';
}

// Calculate on page load
document.addEventListener('DOMContentLoaded', () => calculateInvestmentReturn());

// Recalculate when language changes to update currency format
document.addEventListener('languageChange', () => calculateInvestmentReturn());
