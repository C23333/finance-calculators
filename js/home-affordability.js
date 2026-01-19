document.getElementById('affordabilityForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateAffordability(true);
});

// Auto-calculate on input change
document.querySelectorAll('#affordabilityForm input, #affordabilityForm select').forEach(input => {
    input.addEventListener('input', () => calculateAffordability(false));
    input.addEventListener('change', () => calculateAffordability(false));
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
        // Show the corresponding tab content
        const tabId = this.getAttribute('data-tab') + 'Content';
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
            tabContent.classList.add('active');
        }
    });
});

function calculateAffordability(shouldScroll = false) {
    const annualIncome = parseFloat(document.getElementById('annualIncome').value);
    const monthlyDebts = parseFloat(document.getElementById('monthlyDebts').value);
    const downPayment = parseFloat(document.getElementById('downPaymentAmount').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;
    const loanTermYears = parseInt(document.getElementById('loanTerm').value);
    const propertyTaxRate = parseFloat(document.getElementById('propertyTax').value) / 100;
    const annualInsurance = parseFloat(document.getElementById('homeInsurance').value);

    const monthlyIncome = annualIncome / 12;
    const loanTermMonths = loanTermYears * 12;

    // Use 28% front-end ratio for housing costs
    const maxHousingPayment = monthlyIncome * 0.28;

    // Use 36% back-end ratio for total debt
    const maxTotalDebt = monthlyIncome * 0.36;
    const maxHousingFromBackEnd = maxTotalDebt - monthlyDebts;

    // Use the lower of the two
    const maxMonthlyPayment = Math.min(maxHousingPayment, maxHousingFromBackEnd);

    // Estimate monthly tax and insurance to subtract from max payment
    // We'll iterate to find the right home price
    let homePrice = 100000;
    let iterations = 0;

    while (iterations < 100) {
        const monthlyTax = (homePrice * propertyTaxRate) / 12;
        const monthlyInsurance = annualInsurance / 12;
        const availableForPI = maxMonthlyPayment - monthlyTax - monthlyInsurance;

        if (availableForPI <= 0) {
            homePrice = downPayment;
            break;
        }

        // Calculate loan amount from available P&I payment
        let loanAmount;
        if (interestRate === 0) {
            loanAmount = availableForPI * loanTermMonths;
        } else {
            loanAmount = availableForPI * (Math.pow(1 + interestRate, loanTermMonths) - 1) / (interestRate * Math.pow(1 + interestRate, loanTermMonths));
        }

        const calculatedHomePrice = loanAmount + downPayment;

        if (Math.abs(calculatedHomePrice - homePrice) < 100) {
            homePrice = calculatedHomePrice;
            break;
        }

        homePrice = (homePrice + calculatedHomePrice) / 2;
        iterations++;
    }

    const loanAmount = homePrice - downPayment;

    // Calculate actual monthly payment
    let principalInterest;
    if (interestRate === 0) {
        principalInterest = loanAmount / loanTermMonths;
    } else {
        principalInterest = loanAmount * (interestRate * Math.pow(1 + interestRate, loanTermMonths)) / (Math.pow(1 + interestRate, loanTermMonths) - 1);
    }

    const monthlyTax = (homePrice * propertyTaxRate) / 12;
    const monthlyInsurance = annualInsurance / 12;
    const totalMonthlyPayment = principalInterest + monthlyTax + monthlyInsurance;

    // Calculate DTI
    const dtiRatio = ((totalMonthlyPayment + monthlyDebts) / monthlyIncome) * 100;
    const downPaymentPercent = (downPayment / homePrice) * 100;

    // Update results using I18n.formatCurrency
    document.getElementById('maxHomePrice').textContent = I18n.formatCurrency(homePrice, { decimals: 0 });
    document.getElementById('monthlyPayment').textContent = I18n.formatCurrency(totalMonthlyPayment, { decimals: 0 });
    document.getElementById('loanAmount').textContent = I18n.formatCurrency(loanAmount, { decimals: 0 });
    document.getElementById('dtiRatio').textContent = dtiRatio.toFixed(1) + '%';
    document.getElementById('downPaymentPercent').textContent = downPaymentPercent.toFixed(1) + '%';
    document.getElementById('principalInterest').textContent = I18n.formatCurrency(principalInterest, { decimals: 0 });
    document.getElementById('monthlyTax').textContent = I18n.formatCurrency(monthlyTax, { decimals: 0 });
    document.getElementById('monthlyInsurance').textContent = I18n.formatCurrency(monthlyInsurance, { decimals: 0 });

    // Update details tab if elements exist
    const totalMonthlyEl = document.getElementById('totalMonthly');
    const monthlyIncomeEl = document.getElementById('monthlyIncome');
    const maxHousingPaymentEl = document.getElementById('maxHousingPayment');
    const maxTotalDebtEl = document.getElementById('maxTotalDebt');
    const availableForHousingEl = document.getElementById('availableForHousing');
    
    if (totalMonthlyEl) {
        totalMonthlyEl.textContent = I18n.formatCurrency(totalMonthlyPayment, { decimals: 0 });
    }
    if (monthlyIncomeEl) {
        monthlyIncomeEl.textContent = I18n.formatCurrency(monthlyIncome, { decimals: 0 });
    }
    if (maxHousingPaymentEl) {
        maxHousingPaymentEl.textContent = I18n.formatCurrency(maxHousingPayment, { decimals: 0 });
    }
    if (maxTotalDebtEl) {
        maxTotalDebtEl.textContent = I18n.formatCurrency(maxTotalDebt, { decimals: 0 });
    }
    if (availableForHousingEl) {
        availableForHousingEl.textContent = I18n.formatCurrency(maxHousingFromBackEnd, { decimals: 0 });
    }

    // Show results (for old layout compatibility)
    const resultsEl = document.getElementById('results');
    if (resultsEl) {
        resultsEl.classList.add('show');
        if (shouldScroll) {
            resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Calculate on page load with default values (without scrolling)
document.addEventListener('DOMContentLoaded', () => {
    // Wait for i18n to be ready before calculating
    if (I18n.isLoaded) {
        calculateAffordability(false);
    } else {
        document.addEventListener('i18nReady', () => calculateAffordability(false));
    }
});

// Recalculate when language changes to update currency formatting
document.addEventListener('languageChange', () => calculateAffordability(false));
