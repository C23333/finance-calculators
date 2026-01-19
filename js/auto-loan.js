// Auto Loan Calculator Logic

document.getElementById('autoLoanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateAutoLoan(true);
});

// Add input event listeners for real-time calculation
document.querySelectorAll('#autoLoanForm input, #autoLoanForm select').forEach(input => {
    input.addEventListener('input', () => calculateAutoLoan(false));
    input.addEventListener('change', () => calculateAutoLoan(false));
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

function calculateAutoLoan(shouldScroll = false) {
    const vehiclePrice = parseFloat(document.getElementById('vehiclePrice').value) || 0;
    const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
    const tradeInValue = parseFloat(document.getElementById('tradeInValue').value) || 0;
    const salesTaxRate = parseFloat(document.getElementById('salesTax').value) / 100 || 0;
    const annualRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const loanTermMonths = parseInt(document.getElementById('loanTerm').value) || 60;

    // Calculate taxable amount (price - trade-in in most states)
    const taxableAmount = vehiclePrice - tradeInValue;
    const salesTax = taxableAmount * salesTaxRate;

    // Calculate loan amount
    const loanAmount = Math.max(0, vehiclePrice + salesTax - downPayment - tradeInValue);

    // Monthly interest rate
    const monthlyRate = annualRate / 100 / 12;

    // Calculate monthly payment
    let monthlyPayment;
    if (monthlyRate === 0) {
        monthlyPayment = loanTermMonths > 0 ? loanAmount / loanTermMonths : 0;
    } else {
        monthlyPayment = loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) /
            (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
    }

    // Calculate totals
    const totalCost = monthlyPayment * loanTermMonths;
    const totalInterest = totalCost - loanAmount;

    // Update main results
    document.getElementById('monthlyPayment').textContent = I18n.formatCurrency(monthlyPayment);
    document.getElementById('loanAmount').textContent = I18n.formatCurrency(loanAmount);
    document.getElementById('totalInterest').textContent = I18n.formatCurrency(totalInterest);
    document.getElementById('totalCost').textContent = I18n.formatCurrency(totalCost);
    document.getElementById('taxAmount').textContent = I18n.formatCurrency(salesTax);

    // Update breakdown tab
    const breakdownVehiclePrice = document.getElementById('breakdownVehiclePrice');
    const breakdownTax = document.getElementById('breakdownTax');
    const breakdownDownPayment = document.getElementById('breakdownDownPayment');
    const breakdownTradeIn = document.getElementById('breakdownTradeIn');
    const breakdownLoanAmount = document.getElementById('breakdownLoanAmount');
    const breakdownInterest = document.getElementById('breakdownInterest');
    const breakdownTotal = document.getElementById('breakdownTotal');

    if (breakdownVehiclePrice) breakdownVehiclePrice.textContent = I18n.formatCurrency(vehiclePrice);
    if (breakdownTax) breakdownTax.textContent = I18n.formatCurrency(salesTax);
    if (breakdownDownPayment) breakdownDownPayment.textContent = '-' + I18n.formatCurrency(downPayment);
    if (breakdownTradeIn) breakdownTradeIn.textContent = '-' + I18n.formatCurrency(tradeInValue);
    if (breakdownLoanAmount) breakdownLoanAmount.textContent = I18n.formatCurrency(loanAmount);
    if (breakdownInterest) breakdownInterest.textContent = I18n.formatCurrency(totalInterest);
    if (breakdownTotal) breakdownTotal.textContent = I18n.formatCurrency(totalCost + downPayment + tradeInValue);

    // Update comparison table
    updateComparisonTable(vehiclePrice, salesTax, downPayment, tradeInValue, annualRate);

    // Show results (for old layout compatibility)
    const resultsEl = document.getElementById('results');
    if (resultsEl) {
        resultsEl.classList.add('show');
        if (shouldScroll) {
            resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function updateComparisonTable(vehiclePrice, salesTax, downPayment, tradeInValue, annualRate) {
    const comparisonBody = document.getElementById('comparisonBody');
    if (!comparisonBody) return;

    const loanAmount = Math.max(0, vehiclePrice + salesTax - downPayment - tradeInValue);
    const monthlyRate = annualRate / 100 / 12;
    const terms = [36, 48, 60, 72, 84];
    const currentTerm = parseInt(document.getElementById('loanTerm').value);

    let html = '';
    terms.forEach(term => {
        let payment;
        if (monthlyRate === 0) {
            payment = term > 0 ? loanAmount / term : 0;
        } else {
            payment = loanAmount *
                (monthlyRate * Math.pow(1 + monthlyRate, term)) /
                (Math.pow(1 + monthlyRate, term) - 1);
        }
        const totalCost = payment * term;
        const totalInterest = totalCost - loanAmount;
        const years = term / 12;
        const isSelected = term === currentTerm;

        html += `<tr${isSelected ? ' class="highlight"' : ''}>
            <td>${term} mo (${years} yr)</td>
            <td>${I18n.formatCurrency(payment)}</td>
            <td>${I18n.formatCurrency(totalInterest)}</td>
            <td>${I18n.formatCurrency(totalCost)}</td>
        </tr>`;
    });

    comparisonBody.innerHTML = html;
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
