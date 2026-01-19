// Mortgage Calculator Logic
// Requirements: 2.4, 3.4 - Auto-calculation and tab switching

document.getElementById('mortgageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateMortgage(true);
});

// Auto-calculation on input change (Requirement 2.4)
const mortgageInputs = document.querySelectorAll('#mortgageForm input, #mortgageForm select');
mortgageInputs.forEach(input => {
    input.addEventListener('input', () => calculateMortgage(false));
    input.addEventListener('change', () => calculateMortgage(false));
});

// Tab switching functionality (Requirement 3.4)
document.querySelectorAll('.calc-output-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Update active tab button
        document.querySelectorAll('.calc-output-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.calc-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(tabId + 'Content');
        if (targetContent) {
            targetContent.classList.add('active');
        }
    });
});

function calculateMortgage(shouldScroll = false) {
    // Get input values
    const homePrice = parseFloat(document.getElementById('homePrice').value);
    const downPayment = parseFloat(document.getElementById('downPayment').value);
    const annualRate = parseFloat(document.getElementById('interestRate').value);
    const loanTermYears = parseInt(document.getElementById('loanTerm').value);

    // Validate inputs
    if (isNaN(homePrice) || isNaN(downPayment) || isNaN(annualRate) || isNaN(loanTermYears)) {
        return;
    }

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
    const payoffDateStr = I18n.formatDate(payoffDate, { month: 'long', year: 'numeric' });

    // Update main results
    document.getElementById('monthlyPayment').textContent = I18n.formatCurrency(monthlyPayment);
    document.getElementById('loanAmount').textContent = I18n.formatCurrency(loanAmount);
    document.getElementById('totalInterest').textContent = I18n.formatCurrency(totalInterest);
    document.getElementById('totalCost').textContent = I18n.formatCurrency(totalCost);
    document.getElementById('payoffDate').textContent = payoffDateStr;

    // Update breakdown tab values
    const breakdownPrincipal = document.getElementById('breakdownPrincipal');
    const breakdownInterest = document.getElementById('breakdownInterest');
    const breakdownDownPayment = document.getElementById('breakdownDownPayment');
    const breakdownTotal = document.getElementById('breakdownTotal');
    
    if (breakdownPrincipal) breakdownPrincipal.textContent = I18n.formatCurrency(loanAmount);
    if (breakdownInterest) breakdownInterest.textContent = I18n.formatCurrency(totalInterest);
    if (breakdownDownPayment) breakdownDownPayment.textContent = I18n.formatCurrency(downPayment);
    if (breakdownTotal) breakdownTotal.textContent = I18n.formatCurrency(homePrice + totalInterest);

    // Generate amortization schedule
    generateAmortizationSchedule(loanAmount, monthlyRate, monthlyPayment, loanTermYears);

    // Show results (for compatibility with old layout)
    const resultsEl = document.getElementById('results');
    if (resultsEl) {
        resultsEl.classList.add('show');
        // Scroll to results only when user clicks calculate
        if (shouldScroll) {
            resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Trigger calculation complete event for monetization
    document.dispatchEvent(new CustomEvent('calculationComplete', {
        detail: { calculator: 'mortgage', results: { monthlyPayment, loanAmount, totalInterest } }
    }));
}

function generateAmortizationSchedule(principal, monthlyRate, monthlyPayment, years) {
    const tbody = document.getElementById('amortizationBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    let balance = principal;
    let yearlyPrincipal = 0;
    let yearlyInterest = 0;

    // Get the translated "Year" text
    const yearText = I18n.t('calculators.mortgage.year') || 'Year';

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
                <td>${yearText} ${year}</td>
                <td>${I18n.formatCurrency(yearlyPrincipal)}</td>
                <td>${I18n.formatCurrency(yearlyInterest)}</td>
                <td>${I18n.formatCurrency(balance)}</td>
            `;
            tbody.appendChild(row);

            // Reset yearly totals
            yearlyPrincipal = 0;
            yearlyInterest = 0;
        }
    }
}

// Calculate on page load with default values (without scrolling)
document.addEventListener('DOMContentLoaded', () => {
    // Wait for i18n to be ready before calculating
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        calculateMortgage(false);
    } else {
        document.addEventListener('i18nReady', () => calculateMortgage(false));
    }
});

// Recalculate when language changes
document.addEventListener('languageChange', () => calculateMortgage(false));
