// Inflation Calculator Logic

document.getElementById('inflationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateInflation(true);
});

function calculateInflation(shouldScroll = false) {
    const currentAmount = parseFloat(document.getElementById('currentAmount').value);
    const inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100;
    const years = parseInt(document.getElementById('years').value);

    // Calculate future cost (what $100 of goods will cost in the future)
    const futureValue = currentAmount * Math.pow(1 + inflationRate, years);

    // Calculate future buying power (what $100 will buy in the future)
    const futureBuyingPower = currentAmount / Math.pow(1 + inflationRate, years);

    // Calculate losses
    const priceIncrease = futureValue - currentAmount;
    const purchasingPowerLost = currentAmount - futureBuyingPower;
    const percentDecrease = ((currentAmount - futureBuyingPower) / currentAmount) * 100;

    // Update results
    document.getElementById('futureValue').textContent = formatCurrency(futureValue);
    document.getElementById('purchasingPowerLost').textContent = formatCurrency(purchasingPowerLost);
    document.getElementById('percentDecrease').textContent = '-' + percentDecrease.toFixed(1) + '%';
    document.getElementById('futureBuyingPower').textContent = formatCurrency(futureBuyingPower);
    document.getElementById('priceIncrease').textContent = '+' + formatCurrency(priceIncrease);

    // Generate year-by-year table
    generateInflationTable(currentAmount, inflationRate, years);

    // Show results
    document.getElementById('results').classList.add('show');
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
}

function generateInflationTable(amount, rate, years) {
    const tbody = document.getElementById('inflationTable');
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
        const yearXTemplate = I18n.t('calculators.inflation.yearX');
        // If translation exists and contains {year} placeholder
        if (yearXTemplate && yearXTemplate !== 'calculators.inflation.yearX') {
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
