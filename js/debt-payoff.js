// Debt Payoff Calculator Logic

document.getElementById('debtForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateDebtPayoff(true);
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
}

function removeDebt(index) {
    debts.splice(index, 1);
    renderDebtList();
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

function calculateDebtPayoff(shouldScroll = false) {
    if (debts.length === 0) {
        const message = getTranslation('calculators.debtPayoff.addAtLeastOne', 'Please add at least one debt');
        alert(message);
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

    // Update results
    document.getElementById('totalDebt').textContent = formatCurrency(debts.reduce((sum, d) => sum + d.balance, 0));
    document.getElementById('payoffTime').textContent = formatTime(extraPaymentResult.months);
    document.getElementById('totalInterest').textContent = formatCurrency(extraPaymentResult.totalInterest);
    document.getElementById('interestSaved').textContent = formatCurrency(interestSaved);
    document.getElementById('timeSaved').textContent = formatTime(monthsSaved);

    // Generate payoff order
    generatePayoffOrder(method);

    // Show results
    document.getElementById('results').classList.add('show');
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
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

    while (workingDebts.some(d => d.currentBalance > 0) && months < maxMonths) {
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

/**
 * Get translation using I18n if available, otherwise return fallback
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback text
 * @returns {string} Translated text or fallback
 */
function getTranslation(key, fallback) {
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        const translation = I18n.t(key);
        return translation !== key ? translation : fallback;
    }
    return fallback;
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
    // Recalculate if results are visible
    if (document.getElementById('results').classList.contains('show') && debts.length > 0) {
        calculateDebtPayoff(false);
    }
});
