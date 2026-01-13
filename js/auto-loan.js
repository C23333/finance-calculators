// Auto Loan Calculator Logic

document.getElementById('autoLoanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateAutoLoan(true);
});

function calculateAutoLoan(shouldScroll = false) {
    const vehiclePrice = parseFloat(document.getElementById('vehiclePrice').value);
    const downPayment = parseFloat(document.getElementById('downPayment').value);
    const tradeInValue = parseFloat(document.getElementById('tradeInValue').value) || 0;
    const salesTaxRate = parseFloat(document.getElementById('salesTax').value) / 100;
    const annualRate = parseFloat(document.getElementById('interestRate').value);
    const loanTermMonths = parseInt(document.getElementById('loanTerm').value);

    // Calculate taxable amount (price - trade-in in most states)
    const taxableAmount = vehiclePrice - tradeInValue;
    const salesTax = taxableAmount * salesTaxRate;

    // Calculate loan amount
    const loanAmount = vehiclePrice + salesTax - downPayment - tradeInValue;

    // Monthly interest rate
    const monthlyRate = annualRate / 100 / 12;

    // Calculate monthly payment
    let monthlyPayment;
    if (monthlyRate === 0) {
        monthlyPayment = loanAmount / loanTermMonths;
    } else {
        monthlyPayment = loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) /
            (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
    }

    // Calculate totals
    const totalCost = monthlyPayment * loanTermMonths;
    const totalInterest = totalCost - loanAmount;

    // Update results
    document.getElementById('monthlyPayment').textContent = I18n.formatCurrency(monthlyPayment);
    document.getElementById('loanAmount').textContent = I18n.formatCurrency(loanAmount);
    document.getElementById('totalInterest').textContent = I18n.formatCurrency(totalInterest);
    document.getElementById('totalCost').textContent = I18n.formatCurrency(totalCost);
    document.getElementById('taxAmount').textContent = I18n.formatCurrency(salesTax);

    // Show results
    document.getElementById('results').classList.add('show');
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
}

// Calculate on page load with default values (without scrolling)
document.addEventListener('DOMContentLoaded', () => {
    // Wait for i18n to be ready before calculating
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        calculateAutoLoan(false);
    } else {
        document.addEventListener('i18nReady', () => calculateAutoLoan(false));
    }
});

// Recalculate when language changes
document.addEventListener('languageChange', () => calculateAutoLoan(false));
