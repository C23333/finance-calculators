document.getElementById('emergencyFundForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateEmergencyFund(true);
});

// Auto-calculate on input change
document.querySelectorAll('#emergencyFundForm input, #emergencyFundForm select').forEach(input => {
    input.addEventListener('input', () => calculateEmergencyFund(false));
    input.addEventListener('change', () => calculateEmergencyFund(false));
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
        const tabId = this.getAttribute('data-tab');
        const contentId = tabId + 'Content';
        const content = document.getElementById(contentId);
        if (content) {
            content.classList.add('active');
        }
    });
});

function calculateEmergencyFund(shouldScroll = false) {
    const housing = parseFloat(document.getElementById('housing').value) || 0;
    const utilities = parseFloat(document.getElementById('utilities').value) || 0;
    const food = parseFloat(document.getElementById('food').value) || 0;
    const transportation = parseFloat(document.getElementById('transportation').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance').value) || 0;
    const debtPayments = parseFloat(document.getElementById('debtPayments').value) || 0;
    const otherExpenses = parseFloat(document.getElementById('otherExpenses').value) || 0;

    const monthsCoverage = parseInt(document.getElementById('monthsCoverage').value);
    const currentSavings = parseFloat(document.getElementById('currentSavings').value) || 0;

    const monthlyExpenses = housing + utilities + food + transportation + insurance + debtPayments + otherExpenses;
    const targetFund = monthlyExpenses * monthsCoverage;
    const stillNeeded = Math.max(0, targetFund - currentSavings);
    const progress = targetFund > 0 ? Math.min(100, (currentSavings / targetFund) * 100) : 0;

    // Update main results
    document.getElementById('targetFund').textContent = formatCurrency(targetFund);
    document.getElementById('monthlyExpenses').textContent = formatCurrency(monthlyExpenses);
    document.getElementById('currentDisplay').textContent = formatCurrency(currentSavings);
    document.getElementById('stillNeeded').textContent = formatCurrency(stillNeeded);
    document.getElementById('progress').textContent = progress.toFixed(0) + '%';

    // Update breakdown tab
    const housingBreakdown = document.getElementById('housingBreakdown');
    const utilitiesBreakdown = document.getElementById('utilitiesBreakdown');
    const foodBreakdown = document.getElementById('foodBreakdown');
    const transportationBreakdown = document.getElementById('transportationBreakdown');
    const insuranceBreakdown = document.getElementById('insuranceBreakdown');
    const debtBreakdown = document.getElementById('debtBreakdown');
    const otherBreakdown = document.getElementById('otherBreakdown');
    const totalMonthlyBreakdown = document.getElementById('totalMonthlyBreakdown');

    if (housingBreakdown) housingBreakdown.textContent = formatCurrency(housing);
    if (utilitiesBreakdown) utilitiesBreakdown.textContent = formatCurrency(utilities);
    if (foodBreakdown) foodBreakdown.textContent = formatCurrency(food);
    if (transportationBreakdown) transportationBreakdown.textContent = formatCurrency(transportation);
    if (insuranceBreakdown) insuranceBreakdown.textContent = formatCurrency(insurance);
    if (debtBreakdown) debtBreakdown.textContent = formatCurrency(debtPayments);
    if (otherBreakdown) otherBreakdown.textContent = formatCurrency(otherExpenses);
    if (totalMonthlyBreakdown) totalMonthlyBreakdown.textContent = formatCurrency(monthlyExpenses);

    // Update savings plan tab
    const save6Months = document.getElementById('save6Months');
    const save12Months = document.getElementById('save12Months');
    const save24Months = document.getElementById('save24Months');
    const save36Months = document.getElementById('save36Months');

    if (save6Months) save6Months.textContent = formatCurrency(stillNeeded / 6) + '/mo';
    if (save12Months) save12Months.textContent = formatCurrency(stillNeeded / 12) + '/mo';
    if (save24Months) save24Months.textContent = formatCurrency(stillNeeded / 24) + '/mo';
    if (save36Months) save36Months.textContent = formatCurrency(stillNeeded / 36) + '/mo';

    // Color coding for progress
    const progressEl = document.getElementById('progress');
    if (progressEl) {
        if (progress >= 100) {
            progressEl.style.color = 'var(--secondary)';
        } else if (progress >= 50) {
            progressEl.style.color = 'var(--accent)';
        } else {
            progressEl.style.color = '#ef4444';
        }
    }

    // Handle old layout results section if it exists
    const results = document.getElementById('results');
    if (results) {
        results.classList.add('show');
        if (shouldScroll) {
            results.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

/**
 * Format currency using I18n if available, otherwise fallback to default
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
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

// Calculate on page load
document.addEventListener('DOMContentLoaded', () => calculateEmergencyFund(false));

// Recalculate when language changes to update currency format
document.addEventListener('languageChange', () => calculateEmergencyFund(false));
