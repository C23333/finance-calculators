document.getElementById('refinanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateRefinance();
});

function calculateRefinance() {
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
    document.getElementById('newPayment').textContent = formatCurrency(newPayment);
    document.getElementById('monthlySavings').textContent = formatCurrency(monthlySavings);
    document.getElementById('lifetimeSavings').textContent = formatCurrency(lifetimeSavings);
    document.getElementById('breakEven').textContent = breakEven === Infinity ? 'Never' : breakEven + ' months';
    document.getElementById('recommendation').textContent = recommendation;
    document.getElementById('recommendation').style.color = recommendation === 'Refinance' ? 'var(--secondary)' : recommendation === 'Keep current' ? '#ef4444' : 'var(--accent)';

    document.getElementById('currentTotal').textContent = formatCurrency(currentTotal);
    document.getElementById('currentInterest').textContent = formatCurrency(currentInterest);
    document.getElementById('newTotal').textContent = formatCurrency(newTotal);
    document.getElementById('newInterest').textContent = formatCurrency(newInterest);

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

document.addEventListener('DOMContentLoaded', calculateRefinance);
