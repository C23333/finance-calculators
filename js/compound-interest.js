// Compound Interest Calculator Logic

document.getElementById('compoundForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateCompoundInterest();
});

// Auto-calculate on input change
document.querySelectorAll('#compoundForm input, #compoundForm select').forEach(input => {
    input.addEventListener('input', () => calculateCompoundInterest());
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

function calculateCompoundInterest() {
    // Get input values
    const principal = parseFloat(document.getElementById('principal').value);
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value) / 100;
    const years = parseInt(document.getElementById('years').value);
    const compoundFrequency = parseInt(document.getElementById('compoundFrequency').value);

    // Calculate rate per period
    const ratePerPeriod = annualRate / compoundFrequency;
    const totalPeriods = compoundFrequency * years;

    // Calculate future value of initial principal
    // FV = P(1 + r/n)^(nt)
    const principalFV = principal * Math.pow(1 + ratePerPeriod, totalPeriods);

    // Calculate future value of monthly contributions
    // Using the future value of annuity formula, adjusted for compound frequency
    let contributionsFV = 0;
    if (monthlyContribution > 0) {
        // Convert monthly to per-period contribution
        const periodsPerMonth = compoundFrequency / 12;
        const contributionPerPeriod = monthlyContribution / periodsPerMonth;

        if (ratePerPeriod > 0) {
            contributionsFV = contributionPerPeriod *
                ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod);
        } else {
            contributionsFV = contributionPerPeriod * totalPeriods;
        }
    }

    // Total future value
    const futureValue = principalFV + contributionsFV;

    // Total contributions
    const totalContributions = principal + (monthlyContribution * 12 * years);

    // Total interest earned
    const totalInterest = futureValue - totalContributions;

    // Effective annual rate (APY)
    const effectiveRate = (Math.pow(1 + ratePerPeriod, compoundFrequency) - 1) * 100;

    // Update results
    document.getElementById('futureValue').textContent = formatCurrency(futureValue);
    document.getElementById('initialDisplay').textContent = formatCurrency(principal);
    document.getElementById('totalContributions').textContent = formatCurrency(totalContributions);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('effectiveRate').textContent = effectiveRate.toFixed(2) + '%';

    // Update breakdown tab
    const ruleOf72El = document.getElementById('ruleOf72');
    if (ruleOf72El) {
        const yearsToDouble = annualRate > 0 ? (72 / (annualRate * 100)).toFixed(1) : '∞';
        ruleOf72El.textContent = `~${yearsToDouble} years`;
    }
    
    const interestPercentageEl = document.getElementById('interestPercentage');
    if (interestPercentageEl) {
        const interestPct = futureValue > 0 ? ((totalInterest / futureValue) * 100).toFixed(1) : 0;
        interestPercentageEl.textContent = `${interestPct}%`;
    }

    // Generate year-by-year breakdown
    generateGrowthTable(principal, monthlyContribution, annualRate, compoundFrequency, years);
}

function generateGrowthTable(principal, monthlyContribution, annualRate, compoundFrequency, years) {
    const tbody = document.getElementById('growthBody');
    tbody.innerHTML = '';

    let balance = principal;
    let totalContributed = principal;
    const ratePerPeriod = annualRate / compoundFrequency;
    const periodsPerYear = compoundFrequency;

    for (let year = 1; year <= years; year++) {
        const startBalance = balance;
        let yearlyInterest = 0;
        const yearlyContribution = monthlyContribution * 12;

        // Calculate growth for each period in the year
        for (let period = 0; period < periodsPerYear; period++) {
            // Add proportional monthly contribution
            const contributionThisPeriod = monthlyContribution * (12 / periodsPerYear);
            balance += contributionThisPeriod;

            // Calculate and add interest
            const interestThisPeriod = balance * ratePerPeriod;
            yearlyInterest += interestThisPeriod;
            balance += interestThisPeriod;
        }

        totalContributed += yearlyContribution;

        // Get localized "Year X" text
        const yearText = getYearText(year);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${yearText}</td>
            <td>${formatCurrency(totalContributed)}</td>
            <td>${formatCurrency(yearlyInterest)}</td>
            <td>${formatCurrency(balance)}</td>
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
        const yearXTemplate = I18n.t('calculators.compoundInterest.yearX');
        // If translation exists and contains {year} placeholder
        if (yearXTemplate && yearXTemplate !== 'calculators.compoundInterest.yearX') {
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
document.addEventListener('DOMContentLoaded', () => calculateCompoundInterest());

// Recalculate when language changes to update currency format
document.addEventListener('languageChange', () => calculateCompoundInterest());
