// Loan Payoff Calculator Logic

document.getElementById('loanPayoffForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateLoanPayoff(true);
});

// Add input event listeners for real-time calculation
document.querySelectorAll('#loanPayoffForm input').forEach(input => {
    input.addEventListener('input', () => calculateLoanPayoff(false));
    input.addEventListener('change', () => calculateLoanPayoff(false));
});

// Tab switching functionality
document.querySelectorAll('.calc-output-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs
        document.querySelectorAll('.calc-output-tab').forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Hide all tab contents
        document.querySelectorAll('.calc-tab-content').forEach(content => content.classList.remove('active'));
        
        // Show corresponding content
        const tabName = this.getAttribute('data-tab');
        const contentId = tabName + 'Content';
        const content = document.getElementById(contentId);
        if (content) {
            content.classList.add('active');
        }
    });
});

function calculateLoanPayoff(shouldScroll = false) {
    // Get input values
    const balance = parseFloat(document.getElementById('loanBalance').value) || 0;
    const annualRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const monthlyPayment = parseFloat(document.getElementById('monthlyPayment').value) || 0;
    const extraPayment = parseFloat(document.getElementById('extraPayment').value) || 0;

    const monthlyRate = annualRate / 100 / 12;

    // Calculate original payoff (without extra payments)
    const originalResult = calculatePayoff(balance, monthlyRate, monthlyPayment);

    // Calculate new payoff (with extra payments)
    const newResult = calculatePayoff(balance, monthlyRate, monthlyPayment + extraPayment);

    // Calculate savings
    const interestSaved = originalResult.totalInterest - newResult.totalInterest;
    const monthsSaved = originalResult.months - newResult.months;

    // Update main results
    document.getElementById('interestSaved').textContent = formatCurrency(interestSaved);
    
    const newTimeEl = document.getElementById('newTime');
    if (newTimeEl) newTimeEl.textContent = formatTime(newResult.months);
    
    const timeSavedEl = document.getElementById('timeSaved');
    if (timeSavedEl) timeSavedEl.textContent = formatTime(monthsSaved);
    
    const newInterestEl = document.getElementById('newInterest');
    if (newInterestEl) newInterestEl.textContent = formatCurrency(newResult.totalInterest);

    // Calculate payoff date
    const payoffDateEl = document.getElementById('payoffDate');
    if (payoffDateEl) {
        if (newResult.months !== Infinity) {
            const payoffDate = new Date();
            payoffDate.setMonth(payoffDate.getMonth() + newResult.months);
            payoffDateEl.textContent = payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } else {
            payoffDateEl.textContent = '-';
        }
    }

    // Update comparison breakdown
    const originalTimeEl = document.getElementById('originalTime');
    if (originalTimeEl) originalTimeEl.textContent = formatTime(originalResult.months);
    
    const originalInterestEl = document.getElementById('originalInterest');
    if (originalInterestEl) originalInterestEl.textContent = formatCurrency(originalResult.totalInterest);
    
    const originalTotalEl = document.getElementById('originalTotal');
    if (originalTotalEl) originalTotalEl.textContent = formatCurrency(balance + originalResult.totalInterest);
    
    const newTimeBreakdownEl = document.getElementById('newTimeBreakdown');
    if (newTimeBreakdownEl) newTimeBreakdownEl.textContent = formatTime(newResult.months);
    
    const newInterestBreakdownEl = document.getElementById('newInterestBreakdown');
    if (newInterestBreakdownEl) newInterestBreakdownEl.textContent = formatCurrency(newResult.totalInterest);
    
    const newTotalEl = document.getElementById('newTotal');
    if (newTotalEl) newTotalEl.textContent = formatCurrency(balance + newResult.totalInterest);
    
    const totalSavingsEl = document.getElementById('totalSavings');
    if (totalSavingsEl) totalSavingsEl.textContent = formatCurrency(interestSaved);

    // Update schedule table
    updateScheduleTable(balance, monthlyRate, monthlyPayment + extraPayment);

    // Show results (for old layout compatibility)
    const resultsEl = document.getElementById('results');
    if (resultsEl) {
        resultsEl.classList.add('show');
        if (shouldScroll) {
            resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
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

function updateScheduleTable(balance, monthlyRate, payment) {
    const scheduleBody = document.getElementById('scheduleBody');
    if (!scheduleBody) return;

    let remaining = balance;
    let html = '';
    let month = 0;
    const maxMonths = 600;

    while (remaining > 0.01 && month < maxMonths) {
        month++;
        const interest = remaining * monthlyRate;
        const principal = Math.min(payment - interest, remaining);
        remaining = Math.max(0, remaining - principal);

        // Show first 12 months, then every 12th month
        if (month <= 12 || month % 12 === 0 || remaining <= 0.01) {
            html += `<tr>
                <td>${month}</td>
                <td>${formatCurrency(payment)}</td>
                <td>${formatCurrency(principal)}</td>
                <td>${formatCurrency(interest)}</td>
                <td>${formatCurrency(remaining)}</td>
            </tr>`;
        }

        // If payment doesn't cover interest, stop
        if (payment <= interest) break;
    }

    scheduleBody.innerHTML = html;
}

function formatCurrency(amount) {
    if (amount === Infinity || isNaN(amount)) {
        if (typeof I18n !== 'undefined' && I18n.isLoaded) {
            return I18n.t('calculators.loan.never') || 'Never';
        }
        return 'Never';
    }
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        return I18n.formatCurrency(amount, { decimals: 0 });
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatTime(months) {
    if (months === Infinity || isNaN(months)) {
        if (typeof I18n !== 'undefined' && I18n.isLoaded) {
            return I18n.t('calculators.loan.never') || 'Never';
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

    let yearStr, monthStr;
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        yearStr = I18n.t('common.years') || 'years';
        monthStr = I18n.t('common.months') || 'months';
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
    calculateLoanPayoff(false);
});

// Calculate on page load
document.addEventListener('DOMContentLoaded', () => calculateLoanPayoff(false));

// Also recalculate when i18n is ready
document.addEventListener('i18nReady', () => calculateLoanPayoff(false));
