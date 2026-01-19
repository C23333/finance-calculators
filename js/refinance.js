document.getElementById('refinanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateRefinance(true);
});

// Auto-calculate on input change
document.querySelectorAll('#refinanceForm input, #refinanceForm select').forEach(input => {
    input.addEventListener('input', () => calculateRefinance(false));
    input.addEventListener('change', () => calculateRefinance(false));
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
        // Show the corresponding tab content
        const tabId = this.getAttribute('data-tab') + 'Content';
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
            tabContent.classList.add('active');
        }
    });
});

function calculateRefinance(shouldScroll = false) {
    const currentBalance = parseFloat(document.getElementById('currentBalance').value);
    const currentRate = parseFloat(document.getElementById('currentRate').value) / 100 / 12;
    const currentTermRemaining = parseInt(document.getElementById('currentTermRemaining').value);
    const currentPayment = parseFloat(document.getElementById('currentPayment').value);

    const newRate = parseFloat(document.getElementById('newRate').value) / 100 / 12;
    const newTerm = parseInt(document.getElementById('newTerm').value);
    const closingCosts = parseFloat(document.getElementById('closingCosts').value);

    // Calculate new payment
    let newPayment;
    if (newRate === 0) {
        newPayment = currentBalance / newTerm;
    } else {
        newPayment = currentBalance * (newRate * Math.pow(1 + newRate, newTerm)) / (Math.pow(1 + newRate, newTerm) - 1);
    }

    // Current loan totals
    const currentTotal = currentPayment * currentTermRemaining;
    const currentInterest = currentTotal - currentBalance;

    // New loan totals
    const newTotal = (newPayment * newTerm) + closingCosts;
    const newInterest = (newPayment * newTerm) - currentBalance;

    // Savings
    const monthlySavings = currentPayment - newPayment;
    const lifetimeSavings = currentTotal - newTotal;

    // Break-even (months to recover closing costs)
    const breakEven = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : Infinity;

    // Recommendation
    let recommendation;
    if (lifetimeSavings > 0 && breakEven < 36) {
        recommendation = 'Refinance';
    } else if (lifetimeSavings > 0 && breakEven < 60) {
        recommendation = 'Consider it';
    } else {
        recommendation = 'Keep current';
    }

    // Update results
    document.getElementById('newPayment').textContent = I18n.formatCurrency(newPayment);
    document.getElementById('monthlySavings').textContent = I18n.formatCurrency(monthlySavings);
    document.getElementById('lifetimeSavings').textContent = I18n.formatCurrency(lifetimeSavings);
    document.getElementById('breakEven').textContent = breakEven === Infinity ? 'Never' : breakEven + ' months';
    document.getElementById('recommendation').textContent = recommendation;
    document.getElementById('recommendation').style.color = recommendation === 'Refinance' ? 'var(--secondary)' : recommendation === 'Keep current' ? '#ef4444' : 'var(--accent)';

    document.getElementById('currentTotal').textContent = I18n.formatCurrency(currentTotal);
    document.getElementById('currentInterest').textContent = I18n.formatCurrency(currentInterest);
    document.getElementById('newTotal').textContent = I18n.formatCurrency(newTotal);
    document.getElementById('newInterest').textContent = I18n.formatCurrency(newInterest);

    // Update details tab if elements exist
    const rateReductionEl = document.getElementById('rateReduction');
    const closingCostsDisplayEl = document.getElementById('closingCostsDisplay');
    const newLoanAmountEl = document.getElementById('newLoanAmount');
    const netSavingsEl = document.getElementById('netSavings');
    
    if (rateReductionEl) {
        const currentRatePercent = parseFloat(document.getElementById('currentRate').value);
        const newRatePercent = parseFloat(document.getElementById('newRate').value);
        rateReductionEl.textContent = (currentRatePercent - newRatePercent).toFixed(2) + '%';
    }
    if (closingCostsDisplayEl) {
        closingCostsDisplayEl.textContent = I18n.formatCurrency(closingCosts);
    }
    if (newLoanAmountEl) {
        newLoanAmountEl.textContent = I18n.formatCurrency(currentBalance);
    }
    if (netSavingsEl) {
        netSavingsEl.textContent = I18n.formatCurrency(lifetimeSavings);
    }

    // Show results (for old layout compatibility)
    const resultsEl = document.getElementById('results');
    if (resultsEl) {
        resultsEl.classList.add('show');
        if (shouldScroll) {
            resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Calculate on page load with default values (without scrolling)
document.addEventListener('DOMContentLoaded', () => {
    // Wait for i18n to be ready before calculating
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        calculateRefinance(false);
    } else {
        document.addEventListener('i18nReady', () => calculateRefinance(false));
    }
});

// Recalculate when language changes
document.addEventListener('languageChange', () => calculateRefinance(false));
