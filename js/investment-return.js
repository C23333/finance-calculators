// Investment Return Calculator Logic

document.getElementById('investmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateInvestmentReturn();
});

function calculateInvestmentReturn() {
    // Get input values
    const initialInvestment = parseFloat(document.getElementById('initialInvestment').value);
    const finalValue = parseFloat(document.getElementById('finalValue').value);
    const years = parseFloat(document.getElementById('holdingPeriod').value);

    // Calculate profit/loss
    const profitLoss = finalValue - initialInvestment;

    // Calculate simple ROI
    const simpleROI = ((finalValue - initialInvestment) / initialInvestment) * 100;

    // Calculate CAGR (Compound Annual Growth Rate)
    // CAGR = (FV/PV)^(1/n) - 1
    const cagr = (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100;

    // Calculate doubling time using Rule of 72
    let doublingTime = '-';
    if (cagr > 0) {
        doublingTime = (72 / cagr).toFixed(1) + ' years';
    } else if (cagr < 0) {
        doublingTime = 'N/A (negative return)';
    }

    // Update results
    document.getElementById('totalReturn').textContent = formatPercent(simpleROI);
    document.getElementById('profitLoss').textContent = formatCurrency(profitLoss);
    document.getElementById('annualizedReturn').textContent = formatPercent(cagr);
    document.getElementById('simpleROI').textContent = formatPercent(simpleROI);
    document.getElementById('doublingTime').textContent = doublingTime;

    // Color code profit/loss
    const profitLossEl = document.getElementById('profitLoss');
    const totalReturnEl = document.getElementById('totalReturn');

    if (profitLoss >= 0) {
        profitLossEl.style.color = '#10b981';
        totalReturnEl.style.color = '#10b981';
    } else {
        profitLossEl.style.color = '#ef4444';
        totalReturnEl.style.color = '#ef4444';
    }

    // Show results
    document.getElementById('results').classList.add('show');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function formatCurrency(amount) {
    const prefix = amount >= 0 ? '+' : '';
    return prefix + new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatPercent(value) {
    const prefix = value >= 0 ? '+' : '';
    return prefix + value.toFixed(2) + '%';
}

// Calculate on page load
document.addEventListener('DOMContentLoaded', calculateInvestmentReturn);
