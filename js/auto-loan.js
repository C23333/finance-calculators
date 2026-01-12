// Auto Loan Calculator Logic

document.getElementById('autoLoanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateAutoLoan();
});

function calculateAutoLoan() {
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
    document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
    document.getElementById('loanAmount').textContent = formatCurrency(loanAmount);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('totalCost').textContent = formatCurrency(totalCost);
    document.getElementById('taxAmount').textContent = formatCurrency(salesTax);

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

document.addEventListener('DOMContentLoaded', calculateAutoLoan);
