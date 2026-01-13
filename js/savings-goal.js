// Savings Goal Calculator Logic

document.getElementById('savingsGoalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateSavingsGoal(true);
});

function calculateSavingsGoal(shouldScroll = false) {
    const goalAmount = parseFloat(document.getElementById('goalAmount').value);
    const currentSavings = parseFloat(document.getElementById('currentSavings').value);
    const timeframe = parseInt(document.getElementById('timeframe').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;

    const amountNeeded = goalAmount - currentSavings;
    const monthlyRate = interestRate / 12;
    const totalMonths = timeframe;

    // Calculate monthly savings needed
    // Using future value of annuity formula solved for PMT
    let monthlySavings;
    if (monthlyRate === 0) {
        monthlySavings = amountNeeded / totalMonths;
    } else {
        // FV = PMT * [((1+r)^n - 1) / r]
        // PMT = FV * r / ((1+r)^n - 1)
        const growthFactor = Math.pow(1 + monthlyRate, totalMonths);
        monthlySavings = amountNeeded * monthlyRate / (growthFactor - 1);
    }

    // Calculate totals
    const totalContributions = monthlySavings * totalMonths;
    const interestEarned = amountNeeded - totalContributions;
    const weeklySavings = monthlySavings * 12 / 52;
    const dailySavings = monthlySavings * 12 / 365;

    // Update results
    document.getElementById('monthlySavings').textContent = I18n.formatCurrency(monthlySavings, { decimals: 0 });
    document.getElementById('weeklySavings').textContent = I18n.formatCurrency(weeklySavings, { decimals: 0 });
    document.getElementById('dailySavings').textContent = I18n.formatCurrency(dailySavings, { decimals: 0 });
    document.getElementById('totalContributions').textContent = I18n.formatCurrency(totalContributions, { decimals: 0 });
    document.getElementById('interestEarned').textContent = I18n.formatCurrency(Math.max(0, interestEarned), { decimals: 0 });
    document.getElementById('goalDisplay').textContent = I18n.formatCurrency(goalAmount, { decimals: 0 });

    // Show results
    document.getElementById('results').classList.add('show');
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
}

// Listen for language changes and recalculate
document.addEventListener('languageChange', function() {
    // Recalculate to update currency formatting
    if (document.getElementById('results').classList.contains('show')) {
        calculateSavingsGoal(false);
    }
});

document.addEventListener('DOMContentLoaded', () => calculateSavingsGoal(false));
