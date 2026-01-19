// Debt Payoff Calculator Logic

document.getElementById('debtForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateDebtPayoff(true);
});

// Add input event listeners for real-time calculation
document.querySelectorAll('#extraPayment, #payoffMethod').forEach(input => {
    input.addEventListener('input', () => {
        if (debts.length > 0) calculateDebtPayoff(false);
    });
    input.addEventListener('change', () => {
        if (debts.length > 0) calculateDebtPayoff(false);
    });
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

// Store debts
let debts = [];

function addDebt() {
    const name = document.getElementById('debtName').value;
    const balance = parseFloat(document.getElementById('debtBalance').value);
    const rate = parseFloat(document.getElementById('debtRate').value);
    const minPayment = parseFloat(document.getElementById('debtMinPayment').value);

    if (!name || !balance || !rate || !minPayment) {
        const message = getTranslation('calculators.debtPayoff.fillAllFields', 'Please fill in all debt fields');
        alert(message);
        return;
    }

    debts.push({ name, balance, rate, minPayment });
    renderDebtList();
    clearDebtInputs();
    calculateDebtPayoff(false);
}

function removeDebt(index) {
    debts.splice(index, 1);
    renderDebtList();
    if (debts.length > 0) {
        calculateDebtPayoff(false);
    } else {
        resetResults();
    }
}

function renderDebtList() {
    const list = document.getElementById('debtList');
    if (debts.length === 0) {
        const noDebtsText = getTranslation('calculators.debtPayoff.noDebtsYet', 'No debts added yet');
        list.innerHTML = `<p style="color: var(--text-light); text-align: center;">${noDebtsText}</p>`;
        return;
    }

    const removeText = getTranslation('calculators.debtPayoff.remove', 'Remove');
    list.innerHTML = debts.map((debt, index) => `
        <div class="debt-item">
            <div class="debt-info">
                <strong>${debt.name}</strong>
                <span>${formatCurrency(debt.balance)} @ ${debt.rate}%</span>
            </div>
            <button type="button" class="remove-btn" onclick="removeDebt(${index})">${removeText}</button>
        </div>
    `).join('');
}

function clearDebtInputs() {
    document.getElementById('debtName').value = '';
    document.getElementById('debtBalance').value = '';
    document.getElementById('debtRate').value = '';
    document.getElementById('debtMinPayment').value = '';
}

function resetResults() {
    document.getElementById('totalDebt').textContent = '$0';
    document.getElementById('payoffTime').textContent = '0 months';
    document.getElementById('totalInterest').textContent = '$0';
    document.getElementById('interestSaved').textContent = '$0';
    document.getElementById('timeSaved').textContent = '0';
    
    const payoffOrder = document.getElementById('payoffOrder');
    if (payoffOrder) payoffOrder.innerHTML = '';
    
    updateSummary(0, 0, 0, 0, 0);
}

function calculateDebtPayoff(shouldScroll = false) {
    if (debts.length === 0) {
        if (shouldScroll) {
            const message = getTranslation('calculators.debtPayoff.addAtLeastOne', 'Please add at least one debt');
            alert(message);
        }
        return;
    }

    const extraPayment = parseFloat(document.getElementById('extraPayment').value) || 0;
    const method = document.getElementById('payoffMethod').value;

    // Calculate minimum payment only scenario
    const minPaymentResult = simulatePayoff([...debts], 0, 'avalanche');

    // Calculate with extra payment
    const extraPaymentResult = simulatePayoff([...debts], extraPayment, method);

    // Calculate savings
    const interestSaved = minPaymentResult.totalInterest - extraPaymentResult.totalInterest;
    const monthsSaved = minPaymentResult.months - extraPaymentResult.months;

    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const totalMinPayments = debts.reduce((sum, d) => sum + d.minPayment, 0);

    // Update main results
    document.getElementById('totalDebt').textContent = formatCurrency(totalDebt);
    document.getElementById('payoffTime').textContent = formatTime(extraPaymentResult.months);
    document.getElementById('totalInterest').textContent = formatCurrency(extraPaymentResult.totalInterest);
    document.getElementById('interestSaved').textContent = formatCurrency(Math.max(0, interestSaved));
    document.getElementById('timeSaved').textContent = formatTime(Math.max(0, monthsSaved));

    // Generate payoff order
    generatePayoffOrder(method);

    // Update summary tab
    updateSummary(totalDebt, totalMinPayments, extraPayment, extraPaymentResult.totalInterest, totalDebt + extraPaymentResult.totalInterest);

    // Show results (for old layout compatibility)
    const resultsEl = document.getElementById('results');
    if (resultsEl) {
        resultsEl.classList.add('show');
        if (shouldScroll) {
            resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function updateSummary(totalDebt, minPayments, extra, interest, total) {
    const summaryTotalDebt = document.getElementById('summaryTotalDebt');
    const summaryMinPayments = document.getElementById('summaryMinPayments');
    const summaryExtra = document.getElementById('summaryExtra');
    const summaryMonthly = document.getElementById('summaryMonthly');
    const summaryInterest = document.getElementById('summaryInterest');
    const summaryTotal = document.getElementById('summaryTotal');

    if (summaryTotalDebt) summaryTotalDebt.textContent = formatCurrency(totalDebt);
    if (summaryMinPayments) summaryMinPayments.textContent = formatCurrency(minPayments);
    if (summaryExtra) summaryExtra.textContent = formatCurrency(extra);
    if (summaryMonthly) summaryMonthly.textContent = formatCurrency(minPayments + extra);
    if (summaryInterest) summaryInterest.textContent = formatCurrency(interest);
    if (summaryTotal) summaryTotal.textContent = formatCurrency(total);
}

function simulatePayoff(debtsCopy, extraPayment, method) {
    // Sort debts based on method
    if (method === 'avalanche') {
        debtsCopy.sort((a, b) => b.rate - a.rate); // Highest rate first
    } else {
        debtsCopy.sort((a, b) => a.balance - b.balance); // Lowest balance first
    }

    let months = 0;
    let totalInterest = 0;
    const maxMonths = 600;

    // Create working copies
    let workingDebts = debtsCopy.map(d => ({
        ...d,
        currentBalance: d.balance
    }));

    while (workingDebts.some(d => d.currentBalance > 0.01) && months < maxMonths) {
        months++;

        // Calculate total minimum payment
        let availableExtra = extraPayment;

        // First, apply minimum payments and calculate interest
        for (let debt of workingDebts) {
            if (debt.currentBalance <= 0) continue;

            // Calculate monthly interest
            const monthlyRate = debt.rate / 100 / 12;
            const interest = debt.currentBalance * monthlyRate;
            totalInterest += interest;

            // Apply minimum payment
            const payment = Math.min(debt.minPayment, debt.currentBalance + interest);
            debt.currentBalance = debt.currentBalance + interest - payment;

            if (debt.currentBalance < 0) debt.currentBalance = 0;
        }

        // Apply extra payment to first debt with balance (based on sorted order)
        for (let debt of workingDebts) {
            if (debt.currentBalance <= 0 || availableExtra <= 0) continue;

            const extraApplied = Math.min(availableExtra, debt.currentBalance);
            debt.currentBalance -= extraApplied;
            availableExtra -= extraApplied;
        }
    }

    return { months, totalInterest };
}

function generatePayoffOrder(method) {
    const tbody = document.getElementById('payoffOrder');
    if (!tbody) return;

    let sortedDebts = [...debts];

    if (method === 'avalanche') {
        sortedDebts.sort((a, b) => b.rate - a.rate);
    } else {
        sortedDebts.sort((a, b) => a.balance - b.balance);
    }

    tbody.innerHTML = sortedDebts.map((debt, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${debt.name}</td>
            <td>${formatCurrency(debt.balance)}</td>
            <td>${debt.rate}%</td>
        </tr>
    `).join('');
}

function getTranslation(key, fallback) {
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        const translation = I18n.t(key);
        return translation !== key ? translation : fallback;
    }
    return fallback;
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

function formatTime(months) {
    if (months <= 0) return '0 ' + getTranslation('common.months', 'months');
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    const yearsText = getTranslation('common.years', 'years');
    const monthsText = getTranslation('common.months', 'months');

    if (years === 0) {
        return `${remainingMonths} ${remainingMonths !== 1 ? monthsText : monthsText.replace(/s$/, '')}`;
    } else if (remainingMonths === 0) {
        return `${years} ${years !== 1 ? yearsText : yearsText.replace(/s$/, '')}`;
    } else {
        return `${years}y ${remainingMonths}m`;
    }
}

// Initialize
renderDebtList();

// Recalculate when language changes to update currency format and translations
document.addEventListener('languageChange', () => {
    renderDebtList();
    if (debts.length > 0) {
        calculateDebtPayoff(false);
    }
});

// Also recalculate when i18n is ready
document.addEventListener('i18nReady', () => {
    renderDebtList();
});
