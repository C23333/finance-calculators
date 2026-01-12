// Loan Payoff Calculator Logic

document.getElementById('loanPayoffForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateLoanPayoff(true);
});

function calculateLoanPayoff(shouldScroll = false) {
    // Get input values
    const balance = parseFloat(document.getElementById('loanBalance').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value);
    const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').value);
    const extraPayment = parseFloat(document.getElementById('extraPayment').value) || 0;

    const monthlyRate = annualRate / 100 / 12;

    // Calculate original payoff (without extra payments)
    const originalResult = calculatePayoff(balance, monthlyRate, monthlyPayment);

    // Calculate new payoff (with extra payments)
    const newResult = calculatePayoff(balance, monthlyRate, monthlyPayment + extraPayment);

    // Calculate savings
    const interestSaved = originalResult.totalInterest - newResult.totalInterest;
    const monthsSaved = originalResult.months - newResult.months;

    // Update results
    document.getElementById('interestSaved').textContent = formatCurrency(interestSaved);

    document.getElementById('originalTime').textContent = formatTime(originalResult.months);
    document.getElementById('originalInterest').textContent = formatCurrency(originalResult.totalInterest);

    document.getElementById('newTime').textContent = formatTime(newResult.months);
    document.getElementById('newInterest').textContent = formatCurrency(newResult.totalInterest);
    document.getElementById('timeSaved').textContent = formatTime(monthsSaved);

    // Show results
    document.getElementById('results').classList.add('show');
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
}

function calculatePayoff(balance, monthlyRate, payment) {
    let remaining = balance;
    let totalInterest = 0;
    let months = 0;
    const maxMonths = 600; // 50 years max to prevent infinite loops

    while (remaining > 0 && months < maxMonths) {
        // Calculate interest for this month
        const interest = remaining * monthlyRate;
        totalInterest += interest;

        // Calculate principal payment
        const principalPayment = Math.min(payment - interest, remaining);

        // Update balance
        remaining -= principalPayment;

        months++;

        // If payment doesn't cover interest, loan will never be paid off
        if (payment <= interest && remaining > 0) {
            return {
                months: Infinity,
                totalInterest: Infinity
            };
        }
    }

    return {
        months: months,
        totalInterest: totalInterest
    };
}

function formatCurrency(amount) {
    if (amount === Infinity) return 'Never';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatTime(months) {
    if (months === Infinity) return 'Never';
    if (months === 0) return '0 months';

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) {
        return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
        return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
}

// Calculate on page load
document.addEventListener('DOMContentLoaded', () => calculateLoanPayoff(false));
