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
    if (amount === Infinity) {
        // Use i18n translation for "Never" if available
        if (typeof I18n !== 'undefined' && I18n.isLoaded) {
            return I18n.t('calculators.loan.never');
        }
        return 'Never';
    }
    // Use I18n.formatCurrency if available
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        return I18n.formatCurrency(amount, { decimals: 0 });
    }
    // Fallback to basic formatting
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatTime(months) {
    if (months === Infinity) {
        // Use i18n translation for "Never" if available
        if (typeof I18n !== 'undefined' && I18n.isLoaded) {
            return I18n.t('calculators.loan.never');
        }
        return 'Never';
    }
    if (months === 0) {
        if (typeof I18n !== 'undefined' && I18n.isLoaded) {
            return '0 ' + I18n.t('common.months');
        }
        return '0 months';
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    // Get localized strings
    let yearStr, monthStr;
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        yearStr = I18n.t('common.years');
        monthStr = I18n.t('common.months');
    } else {
        yearStr = years !== 1 ? 'years' : 'year';
        monthStr = remainingMonths !== 1 ? 'months' : 'month';
    }

    if (years === 0) {
        return `${remainingMonths} ${monthStr}`;
    } else if (remainingMonths === 0) {
        return `${years} ${yearStr}`;
    } else {
        return `${years} ${yearStr}, ${remainingMonths} ${monthStr}`;
    }
}

// Listen for language changes and recalculate
document.addEventListener('languageChange', function() {
    // Recalculate to update formatted values with new locale
    calculateLoanPayoff(false);
});

// Calculate on page load
document.addEventListener('DOMContentLoaded', () => calculateLoanPayoff(false));

// Also recalculate when i18n is ready (in case it loads after DOMContentLoaded)
document.addEventListener('i18nReady', () => calculateLoanPayoff(false));
