document.getElementById('emergencyFundForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateEmergencyFund(true);
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

    document.getElementById('targetFund').textContent = formatCurrency(targetFund);
    document.getElementById('monthlyExpenses').textContent = formatCurrency(monthlyExpenses);
    document.getElementById('currentDisplay').textContent = formatCurrency(currentSavings);
    document.getElementById('stillNeeded').textContent = formatCurrency(stillNeeded);
    document.getElementById('progress').textContent = progress.toFixed(0) + '%';

    const progressEl = document.getElementById('progress');
    if (progress >= 100) {
        progressEl.style.color = 'var(--secondary)';
    } else if (progress >= 50) {
        progressEl.style.color = 'var(--accent)';
    } else {
        progressEl.style.color = '#ef4444';
    }

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

document.addEventListener('DOMContentLoaded', () => calculateEmergencyFund(false));
