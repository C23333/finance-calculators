// Inflation Calculator Logic

document.getElementById('inflationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateInflation(true);
});

// Auto-calculate on input change
document.querySelectorAll('#inflationForm input').forEach(input => {
    input.addEventListener('input', () => calculateInflation(false));
    input.addEventListener('change', () => calculateInflation(false));
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

function calculateInflation(shouldScroll = false) {
    const currentAmount = parseFloat(document.getElementById('currentAmount').value) || 0;
    const inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100 || 0;
    const years = parseInt(document.getElementById('years').value) || 1;

    // Calculate future cost (what $100 of goods will cost in the future)
    const futureValue = currentAmount * Math.pow(1 + inflationRate, years);

    // Calculate future buying power (what $100 will buy in the future)
    const futureBuyingPower = currentAmount / Math.pow(1 + inflationRate, years);

    // Calculate losses
    const priceIncrease = futureValue - currentAmount;
    const purchasingPowerLost = currentAmount - futureBuyingPower;
    const percentDecrease = currentAmount > 0 ? ((currentAmount - futureBuyingPower) / currentAmount) * 100 : 0;
    const cumulativeInflation = ((futureValue - currentAmount) / currentAmount) * 100;

    // Update main results
    document.getElementById('futureValue').textContent = formatCurrency(futureValue);
    document.getElementById('purchasingPowerLost').textContent = formatCurrency(purchasingPowerLost);
    document.getElementById('percentDecrease').textContent = '-' + percentDecrease.toFixed(1) + '%';
    document.getElementById('futureBuyingPower').textContent = formatCurrency(futureBuyingPower);
    document.getElementById('priceIncrease').textContent = '+' + formatCurrency(priceIncrease);

    // Update breakdown tab
    const currentDisplay = document.getElementById('currentDisplay');
    const rateDisplay = document.getElementById('rateDisplay');
    const yearsDisplay = document.getElementById('yearsDisplay');
    const cumulativeInflationEl = document.getElementById('cumulativeInflation');
    const futureCostBreakdown = document.getElementById('futureCostBreakdown');

    if (currentDisplay) currentDisplay.textContent = formatCurrency(currentAmount);
    if (rateDisplay) rateDisplay.textContent = (inflationRate * 100).toFixed(1) + '%';
    if (yearsDisplay) yearsDisplay.textContent = years;
    if (cumulativeInflationEl) cumulativeInflationEl.textContent = cumulativeInflation.toFixed(1) + '%';
    if (futureCostBreakdown) futureCostBreakdown.textContent = formatCurrency(futureValue);

    // Generate year-by-year table
    generateInflationTable(currentAmount, inflationRate, years);

    // Show results (for old layout compatibility)
    const results = document.getElementById('results');
    if (results) {
        results.classList.add('show');
        if (shouldScroll) {
            results.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function generateInflationTable(amount, rate, years) {
    const tbody = document.getElementById('inflationTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    for (let year = 1; year <= Math.min(years, 20); year++) {
        const futureCost = amount * Math.pow(1 + rate, year);
        const buyingPower = amount / Math.pow(1 + rate, year);

        // Get localized "Year X" text
        const yearText = getYearText(year);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${yearText}</td>
            <td>${formatCurrency(futureCost)}</td>
            <td>${formatCurrency(buyingPower)}</td>
        `;
        tbody.appendChild(row);
    }

    if (years > 20) {
        // Get localized "Year X" text for the final year
        const yearText = getYearText(years);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${yearText}</td>
            <td>${formatCurrency(amount * Math.pow(1 + rate, years))}</td>
            <td>${formatCurrency(amount / Math.pow(1 + rate, years))}</td>
        `;
        tbody.appendChild(row);
    }
}

/**
 * Get localized "Year X" text
 * @param {number} year - The year number
 * @returns {string} Localized year text
 */
function getYearText(year) {
    // Check if I18n is available and has the translation
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        const yearXTemplate = I18n.translations?.calculators?.inflation?.yearX;
        if (yearXTemplate) {
            return yearXTemplate.replace('{year}', year);
        }
    }
    // Fallback to English
    return `Year ${year}`;
}

/**
 * Format currency using I18n if available, otherwise fallback to default
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    if (isNaN(amount) || !isFinite(amount)) amount = 0;
    // Use I18n.formatCurrency if available
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        return I18n.formatCurrency(amount, { decimals: 2 });
    }
    // Fallback to default formatting
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Calculate on page load
document.addEventListener('DOMContentLoaded', () => calculateInflation(false));

// Recalculate when language changes to update currency format
document.addEventListener('languageChange', () => calculateInflation(false));
