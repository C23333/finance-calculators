document.getElementById('rentVsBuyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateRentVsBuy(true);
});

function calculateRentVsBuy(shouldScroll = false) {
    const homePrice = parseFloat(document.getElementById('homePrice').value);
    const downPaymentPercent = parseFloat(document.getElementById('downPayment').value) / 100;
    const mortgageRate = parseFloat(document.getElementById('mortgageRate').value) / 100 / 12;
    const propertyTaxRate = parseFloat(document.getElementById('propertyTax').value) / 100;
    const homeInsurance = parseFloat(document.getElementById('homeInsurance').value);
    const maintenanceRate = parseFloat(document.getElementById('maintenance').value) / 100;

    const monthlyRent = parseFloat(document.getElementById('monthlyRent').value);
    const rentIncreaseRate = parseFloat(document.getElementById('rentIncrease').value) / 100;

    const yearsToStay = parseInt(document.getElementById('yearsToStay').value);
    const appreciationRate = parseFloat(document.getElementById('homeAppreciation').value) / 100;

    const downPayment = homePrice * downPaymentPercent;
    const loanAmount = homePrice - downPayment;
    const loanTermMonths = 360;

    // Calculate monthly mortgage payment
    let monthlyMortgage;
    if (mortgageRate === 0) {
        monthlyMortgage = loanAmount / loanTermMonths;
    } else {
        monthlyMortgage = loanAmount * (mortgageRate * Math.pow(1 + mortgageRate, loanTermMonths)) / (Math.pow(1 + mortgageRate, loanTermMonths) - 1);
    }

    // Calculate total buying costs
    let totalBuyCost = downPayment;
    let balance = loanAmount;
    let currentHomeValue = homePrice;

    for (let year = 1; year <= yearsToStay; year++) {
        // Annual costs
        const annualMortgage = monthlyMortgage * 12;
        const annualPropertyTax = currentHomeValue * propertyTaxRate;
        const annualMaintenance = currentHomeValue * maintenanceRate;

        totalBuyCost += annualMortgage + annualPropertyTax + homeInsurance + annualMaintenance;

        // Update balance (simplified - just principal portion)
        for (let month = 0; month < 12; month++) {
            const interestPayment = balance * mortgageRate;
            const principalPayment = monthlyMortgage - interestPayment;
            balance -= principalPayment;
        }

        // Home appreciation
        currentHomeValue *= (1 + appreciationRate);
    }

    // Equity built
    const equityBuilt = currentHomeValue - balance;

    // Net cost of buying (cost minus equity)
    const netBuyCost = totalBuyCost - equityBuilt + downPayment;

    // Calculate total renting costs
    let totalRentCost = 0;
    let currentRent = monthlyRent;

    for (let year = 1; year <= yearsToStay; year++) {
        totalRentCost += currentRent * 12;
        currentRent *= (1 + rentIncreaseRate);
    }

    // Determine recommendation
    const savings = Math.abs(totalRentCost - netBuyCost);
    let recommendation, savingsText;

    if (netBuyCost < totalRentCost) {
        recommendation = I18n.t('calculators.rentVsBuy.recommendBuy');
        savingsText = I18n.t('calculators.rentVsBuy.buyingSaves', { amount: I18n.formatCurrency(savings, { decimals: 0 }), years: yearsToStay });
    } else {
        recommendation = I18n.t('calculators.rentVsBuy.recommendRent');
        savingsText = I18n.t('calculators.rentVsBuy.rentingSaves', { amount: I18n.formatCurrency(savings, { decimals: 0 }), years: yearsToStay });
    }

    // Update results
    document.getElementById('recommendation').textContent = recommendation;
    document.getElementById('recommendation').style.color = netBuyCost < totalRentCost ? 'var(--secondary)' : 'var(--accent)';
    document.getElementById('savingsAmount').textContent = savingsText;
    document.getElementById('totalBuyCost').textContent = I18n.formatCurrency(netBuyCost, { decimals: 0 });
    document.getElementById('totalRentCost').textContent = I18n.formatCurrency(totalRentCost, { decimals: 0 });
    document.getElementById('equityBuilt').textContent = I18n.formatCurrency(equityBuilt, { decimals: 0 });
    document.getElementById('monthlyMortgage').textContent = I18n.formatCurrency(monthlyMortgage, { decimals: 0 });

    document.getElementById('results').classList.add('show');
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
}

// Listen for language changes and recalculate
document.addEventListener('languageChange', function() {
    // Recalculate to update currency formatting
    if (document.getElementById('results').classList.contains('show')) {
        calculateRentVsBuy(false);
    }
});

document.addEventListener('DOMContentLoaded', () => calculateRentVsBuy(false));
