// Savings Goal Calculator Logic

document.getElementById('savingsGoalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateSavingsGoal();
});

function calculateSavingsGoal() {
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
    document.getElementById('monthlySavings').textContent = formatCurrency(monthlySavings);
    document.getElementById('weeklySavings').textContent = formatCurrency(weeklySavings);
    document.getElementById('dailySavings').textContent = formatCurrency(dailySavings);
    document.getElementById('totalContributions').textContent = formatCurrency(totalContributions);
    document.getElementById('interestEarned').textContent = formatCurrency(Math.max(0, interestEarned));
    document.getElementById('goalDisplay').textContent = formatCurrency(goalAmount);

    // Show results
    document.getElementById('results').classList.add('show');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

document.addEventListener('DOMContentLoaded', calculateSavingsGoal);
