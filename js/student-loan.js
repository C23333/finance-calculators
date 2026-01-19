// Student Loan Calculator Logic

document.getElementById('studentLoanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateStudentLoan(true);
});

// Add input event listeners for real-time calculation
document.querySelectorAll('#studentLoanForm input, #studentLoanForm select').forEach(input => {
    input.addEventListener('input', () => calculateStudentLoan(false));
    input.addEventListener('change', () => calculateStudentLoan(false));
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

function calculateStudentLoan(shouldScroll = false) {
    const loanBalance = parseFloat(document.getElementById('loanBalance').value) || 0;
    const annualRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const repaymentMonths = parseInt(document.getElementById('repaymentPlan').value) || 120;
    const extraPayment = parseFloat(document.getElementById('extraPayment').value) || 0;

    const monthlyRate = annualRate / 100 / 12;

    // Calculate standard payment
    let standardPayment;
    if (monthlyRate === 0) {
        standardPayment = repaymentMonths > 0 ? loanBalance / repaymentMonths : 0;
    } else {
        standardPayment = loanBalance * (monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) / (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
    }

    // Calculate with extra payment
    const totalPayment = standardPayment + extraPayment;

    // Simulate payoff
    let balance = loanBalance;
    let totalInterest = 0;
    let months = 0;

    while (balance > 0.01 && months < 600) {
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

    // Update main results
    document.getElementById('monthlyPayment').textContent = formatCurrency(totalPayment);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('totalCost').textContent = formatCurrency(totalCost);
    document.getElementById('payoffDate').textContent = payoffDateStr;
    document.getElementById('interestSaved').textContent = formatCurrency(Math.max(0, interestSaved));

    // Update breakdown tab
    const breakdownBalance = document.getElementById('breakdownBalance');
    const breakdownRate = document.getElementById('breakdownRate');
    const breakdownTerm = document.getElementById('breakdownTerm');
    const breakdownPayment = document.getElementById('breakdownPayment');
    const breakdownInterest = document.getElementById('breakdownInterest');
    const breakdownTotal = document.getElementById('breakdownTotal');

    if (breakdownBalance) breakdownBalance.textContent = formatCurrency(loanBalance);
    if (breakdownRate) breakdownRate.textContent = annualRate.toFixed(1) + '%';
    if (breakdownTerm) breakdownTerm.textContent = formatTerm(months);
    if (breakdownPayment) breakdownPayment.textContent = formatCurrency(totalPayment);
    if (breakdownInterest) breakdownInterest.textContent = formatCurrency(totalInterest);
    if (breakdownTotal) breakdownTotal.textContent = formatCurrency(totalCost);

    // Update comparison table
    updateComparisonTable(loanBalance, monthlyRate, extraPayment, repaymentMonths);

    // Show results (for old layout compatibility)
    const resultsEl = document.getElementById('results');
    if (resultsEl) {
        resultsEl.classList.add('show');
        if (shouldScroll) {
            resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function updateComparisonTable(loanBalance, monthlyRate, extraPayment, currentPlan) {
    const comparisonBody = document.getElementById('comparisonBody');
    if (!comparisonBody) return;

    const plans = [
        { months: 120, name: 'Standard (10 yr)' },
        { months: 180, name: 'Extended (15 yr)' },
        { months: 240, name: 'Extended (20 yr)' },
        { months: 300, name: 'Extended (25 yr)' }
    ];

    let html = '';
    plans.forEach(plan => {
        let payment;
        if (monthlyRate === 0) {
            payment = plan.months > 0 ? loanBalance / plan.months : 0;
        } else {
            payment = loanBalance * (monthlyRate * Math.pow(1 + monthlyRate, plan.months)) / (Math.pow(1 + monthlyRate, plan.months) - 1);
        }
        
        // Add extra payment
        const totalPayment = payment + extraPayment;
        
        // Simulate actual payoff
        let balance = loanBalance;
        let totalInterest = 0;
        let actualMonths = 0;
        
        while (balance > 0.01 && actualMonths < 600) {
            const interest = balance * monthlyRate;
            totalInterest += interest;
            const principal = Math.min(totalPayment - interest, balance);
            balance -= principal;
            actualMonths++;
            if (totalPayment <= interest) break;
        }
        
        const totalCost = loanBalance + totalInterest;
        const isSelected = plan.months === currentPlan;

        html += `<tr${isSelected ? ' class="highlight"' : ''}>
            <td>${plan.name}</td>
            <td>${formatCurrency(totalPayment)}</td>
            <td>${formatCurrency(totalInterest)}</td>
            <td>${formatCurrency(totalCost)}</td>
        </tr>`;
    });

    comparisonBody.innerHTML = html;
}

function formatTerm(months) {
    if (months === Infinity || isNaN(months)) {
        return getNeverText();
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
        return `${remainingMonths} mo`;
    } else if (remainingMonths === 0) {
        return `${years} yr`;
    } else {
        return `${years} yr ${remainingMonths} mo`;
    }
}

function getNeverText() {
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        const neverText = I18n.t('calculators.studentLoan.never');
        if (neverText && neverText !== 'calculators.studentLoan.never') {
            return neverText;
        }
    }
    return 'Never';
}

function formatPayoffDate(date) {
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        const locale = I18n.currentLanguage === 'zh' ? 'zh-CN' : 'en-US';
        return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatCurrency(amount) {
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

// Calculate on page load
document.addEventListener('DOMContentLoaded', () => calculateStudentLoan(false));

// Recalculate when language changes to update currency format
document.addEventListener('languageChange', () => calculateStudentLoan(false));

// Also recalculate when i18n is ready
document.addEventListener('i18nReady', () => calculateStudentLoan(false));
