// Inflation Calculator Logic

document.getElementById('inflationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateInflation();
});

function calculateInflation() {
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
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function generateInflationTable(amount, rate, years) {
    const tbody = document.getElementById('inflationTable');
    tbody.innerHTML = '';

    for (let year = 1; year <= Math.min(years, 20); year++) {
        const futureCost = amount * Math.pow(1 + rate, year);
        const buyingPower = amount / Math.pow(1 + rate, year);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Year ${year}</td>
            <td>${formatCurrency(futureCost)}</td>
            <td>${formatCurrency(buyingPower)}</td>
        `;
        tbody.appendChild(row);
    }

    if (years > 20) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Year ${years}</td>
            <td>${formatCurrency(amount * Math.pow(1 + rate, years))}</td>
            <td>${formatCurrency(amount / Math.pow(1 + rate, years))}</td>
        `;
        tbody.appendChild(row);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

document.addEventListener('DOMContentLoaded', calculateInflation);
