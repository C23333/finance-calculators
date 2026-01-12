// Mortgage Calculator Logic

document.getElementById('mortgageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateMortgage();
});

function calculateMortgage() {
    // Get input values
    const homePrice = parseFloat(document.getElementById('homePrice').value);
    const downPayment = parseFloat(document.getElementById('downPayment').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value);
    const loanTermYears = parseInt(document.getElementById('loanTerm').value);

    // Calculate loan amount
    const loanAmount = homePrice - downPayment;

    // Monthly interest rate
    const monthlyRate = annualRate / 100 / 12;

    // Total number of payments
    const totalPayments = loanTermYears * 12;

    // Calculate monthly payment using the mortgage formula
    // M = P * [r(1+r)^n] / [(1+r)^n - 1]
    let monthlyPayment;
    if (monthlyRate === 0) {
        monthlyPayment = loanAmount / totalPayments;
    } else {
        monthlyPayment = loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
            (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }

    // Calculate totals
    const totalCost = monthlyPayment * totalPayments;
    const totalInterest = totalCost - loanAmount;

    // Calculate payoff date
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + totalPayments);
    const payoffDateStr = payoffDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    // Update results
    document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
    document.getElementById('loanAmount').textContent = formatCurrency(loanAmount);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('totalCost').textContent = formatCurrency(totalCost);
    document.getElementById('payoffDate').textContent = payoffDateStr;

    // Generate amortization schedule
    generateAmortizationSchedule(loanAmount, monthlyRate, monthlyPayment, loanTermYears);

    // Show results
    document.getElementById('results').classList.add('show');

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function generateAmortizationSchedule(principal, monthlyRate, monthlyPayment, years) {
    const tbody = document.getElementById('amortizationBody');
    tbody.innerHTML = '';

    let balance = principal;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    for (let month = 1; month <= years * 12; month++) {
        // Calculate interest for this month
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;

        // Update balance
        balance -= principalPayment;
        if (balance < 0) balance = 0;

        // Accumulate yearly totals
        yearlyPrincipal += principalPayment;
        yearlyInterest += interestPayment;

        // At end of each year, add row to table
        if (month % 12 === 0) {
            const year = month / 12;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Year ${year}</td>
                <td>${formatCurrency(yearlyPrincipal)}</td>
                <td>${formatCurrency(yearlyInterest)}</td>
                <td>${formatCurrency(balance)}</td>
            `;
            tbody.appendChild(row);

            // Reset yearly totals
            yearlyPrincipal = 0;
            yearlyInterest = 0;
        }
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

// Calculate on page load with default values
document.addEventListener('DOMContentLoaded', calculateMortgage);
