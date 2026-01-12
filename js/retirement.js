// Retirement Calculator Logic

document.getElementById('retirementForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateRetirement(true);
});

function calculateRetirement(shouldScroll = false) {
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
    let status, statusColor;
    const ratio = projectedSavings / savingsNeeded;

    if (ratio >= 1) {
        status = 'On Track';
        statusColor = '#10b981';
    } else if (ratio >= 0.75) {
        status = 'Close - Consider increasing contributions';
        statusColor = '#f59e0b';
    } else {
        status = 'Behind - Need to save more';
        statusColor = '#ef4444';
    }

    // Update results
    document.getElementById('projectedSavings').textContent = formatCurrency(projectedSavings);
    document.getElementById('yearsToRetirement').textContent = yearsToRetirement + ' years';
    document.getElementById('totalContributions').textContent = formatCurrency(totalContributions);
    document.getElementById('investmentGrowth').textContent = formatCurrency(investmentGrowth);
    document.getElementById('savingsNeeded').textContent = formatCurrency(savingsNeeded);
    document.getElementById('annualIncome').textContent = formatCurrency(annualIncome) + '/year';

    const statusEl = document.getElementById('status');
    statusEl.textContent = status;
    statusEl.style.color = statusColor;

    // Show results
    document.getElementById('results').classList.add('show');
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Calculate on page load
document.addEventListener('DOMContentLoaded', () => calculateRetirement(false));
