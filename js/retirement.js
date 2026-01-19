// Retirement Calculator Logic

document.getElementById('retirementForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateRetirement();
});

// Auto-calculate on input change
document.querySelectorAll('#retirementForm input, #retirementForm select').forEach(input => {
    input.addEventListener('input', () => calculateRetirement());
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

function calculateRetirement() {
    // Get input values
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const currentSavings = parseFloat(document.getElementById('currentSavings').value);
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value) / 100;
    const desiredIncome = parseFloat(document.getElementById('desiredIncome').value);

    // Calculate years to retirement
    const yearsToRetirement = retirementAge - currentAge;

    // Calculate future value of current savings
    const currentSavingsFV = currentSavings * Math.pow(1 + expectedReturn, yearsToRetirement);

    // Calculate future value of monthly contributions
    // FV = PMT * [((1 + r)^n - 1) / r]
    const monthlyRate = expectedReturn / 12;
    const totalMonths = yearsToRetirement * 12;

    let contributionsFV = 0;
    if (monthlyRate > 0) {
        contributionsFV = monthlyContribution *
            ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    } else {
        contributionsFV = monthlyContribution * totalMonths;
    }

    // Total projected savings
    const projectedSavings = currentSavingsFV + contributionsFV;

    // Total contributions
    const totalContributions = currentSavings + (monthlyContribution * 12 * yearsToRetirement);

    // Investment growth
    const investmentGrowth = projectedSavings - totalContributions;

    // Savings needed based on 4% rule
    const savingsNeeded = desiredIncome * 25;

    // Annual income from projected savings (4% withdrawal)
    const annualIncome = projectedSavings * 0.04;

    // Determine status
    let statusKey, statusColor;
    const ratio = projectedSavings / savingsNeeded;

    if (ratio >= 1) {
        statusKey = 'calculators.retirement.statusOnTrack';
        statusColor = '#10b981';
    } else if (ratio >= 0.75) {
        statusKey = 'calculators.retirement.statusClose';
        statusColor = '#f59e0b';
    } else {
        statusKey = 'calculators.retirement.statusBehind';
        statusColor = '#ef4444';
    }

    // Get translated status text
    const status = I18n.isLoaded ? I18n.t(statusKey) : getDefaultStatus(statusKey);

    // Update results using I18n.formatCurrency
    document.getElementById('projectedSavings').textContent = I18n.formatCurrency(projectedSavings, { decimals: 0 });
    document.getElementById('yearsToRetirement').textContent = yearsToRetirement + ' ' + (I18n.isLoaded ? I18n.t('common.years') : 'years');
    document.getElementById('totalContributions').textContent = I18n.formatCurrency(totalContributions, { decimals: 0 });
    document.getElementById('investmentGrowth').textContent = I18n.formatCurrency(investmentGrowth, { decimals: 0 });
    document.getElementById('savingsNeeded').textContent = I18n.formatCurrency(savingsNeeded, { decimals: 0 });
    document.getElementById('annualIncome').textContent = I18n.formatCurrency(annualIncome, { decimals: 0 }) + (I18n.isLoaded ? I18n.t('common.perYear') : '/year');

    const statusEl = document.getElementById('status');
    statusEl.textContent = status;
    statusEl.style.color = statusColor;

    // Update monthly withdrawal
    const monthlyWithdrawalEl = document.getElementById('monthlyWithdrawal');
    if (monthlyWithdrawalEl) {
        monthlyWithdrawalEl.textContent = I18n.formatCurrency(annualIncome / 12, { decimals: 0 });
    }
}

// Fallback status text when I18n is not loaded
function getDefaultStatus(key) {
    const defaults = {
        'calculators.retirement.statusOnTrack': 'On Track',
        'calculators.retirement.statusClose': 'Close - Consider increasing contributions',
        'calculators.retirement.statusBehind': 'Behind - Need to save more'
    };
    return defaults[key] || key;
}

// Calculate on page load
document.addEventListener('DOMContentLoaded', () => calculateRetirement());

// Recalculate when language changes
document.addEventListener('languageChange', () => calculateRetirement());
