document.getElementById('studentLoanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateStudentLoan(true);
});

function calculateStudentLoan(shouldScroll = false) {
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

    // Format payoff date based on locale
    let payoffDateStr;
    if (months === Infinity) {
        payoffDateStr = getNeverText();
    } else {
        payoffDateStr = formatPayoffDate(payoffDate);
    }

    // Update results
    document.getElementById('monthlyPayment').textContent = formatCurrency(totalPayment);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('totalCost').textContent = formatCurrency(totalCost);
    document.getElementById('payoffDate').textContent = payoffDateStr;
    document.getElementById('interestSaved').textContent = formatCurrency(Math.max(0, interestSaved));

    document.getElementById('results').classList.add('show');
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Get localized "Never" text
 * @returns {string} Localized never text
 */
function getNeverText() {
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        const neverText = I18n.t('calculators.studentLoan.never');
        if (neverText && neverText !== 'calculators.studentLoan.never') {
            return neverText;
        }
    }
    return 'Never';
}

/**
 * Format payoff date based on current locale
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatPayoffDate(date) {
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        const locale = I18n.currentLanguage === 'zh' ? 'zh-CN' : 'en-US';
        return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Format currency using I18n if available, otherwise fallback to default
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    // Use I18n.formatCurrency if available
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        return I18n.formatCurrency(amount, { decimals: 0 });
    }
    // Fallback to default formatting
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Calculate on page load
document.addEventListener('DOMContentLoaded', () => calculateStudentLoan(false));

// Recalculate when language changes to update currency format
document.addEventListener('languageChange', () => calculateStudentLoan(false));
