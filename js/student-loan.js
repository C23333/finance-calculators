document.getElementById('studentLoanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateStudentLoan();
});

function calculateStudentLoan() {
    const loanBalance = parseFloat(document.getElementById('loanBalance').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value);
    const repaymentMonths = parseInt(document.getElementById('repaymentPlan').value);
    const extraPayment = parseFloat(document.getElementById('extraPayment').value) || 0;

    const monthlyRate = annualRate / 100 / 12;

    // Calculate standard payment
    let standardPayment;
    if (monthlyRate === 0) {
        standardPayment = loanBalance / repaymentMonths;
    } else {
        standardPayment = loanBalance * (monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) / (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
    }

    // Calculate with extra payment
    const totalPayment = standardPayment + extraPayment;

    // Simulate payoff
    let balance = loanBalance;
    let totalInterest = 0;
    let months = 0;

    while (balance > 0 && months < 600) {
        const interest = balance * monthlyRate;
        totalInterest += interest;
        const principal = Math.min(totalPayment - interest, balance);
        balance -= principal;
        months++;

        if (totalPayment <= interest) {
            months = Infinity;
            break;
        }
    }

    // Calculate standard scenario for comparison
    const standardTotalInterest = (standardPayment * repaymentMonths) - loanBalance;
    const interestSaved = standardTotalInterest - totalInterest;

    const totalCost = loanBalance + totalInterest;

    // Payoff date
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);
    const payoffDateStr = payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Update results
    document.getElementById('monthlyPayment').textContent = formatCurrency(totalPayment);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('totalCost').textContent = formatCurrency(totalCost);
    document.getElementById('payoffDate').textContent = months === Infinity ? 'Never' : payoffDateStr;
    document.getElementById('interestSaved').textContent = formatCurrency(Math.max(0, interestSaved));

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

document.addEventListener('DOMContentLoaded', calculateStudentLoan);
