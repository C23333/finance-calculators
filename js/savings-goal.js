// Savings Goal Calculator Logic

document.getElementById('savingsGoalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateSavingsGoal(true);
});

// Auto-calculate on input change
document.querySelectorAll('#savingsGoalForm input').forEach(input => {
    input.addEventListener('input', () => calculateSavingsGoal(false));
    input.addEventListener('change', () => calculateSavingsGoal(false));
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
        const tabId = this.getAttribute('data-tab');
        const contentId = tabId + 'Content';
        const content = document.getElementById(contentId);
        if (content) {
            content.classList.add('active');
        }
    });
});

function calculateSavingsGoal(shouldScroll = false) {
    const goalAmount = parseFloat(document.getElementById('goalAmount').value) || 0;
    const currentSavings = parseFloat(document.getElementById('currentSavings').value) || 0;
    const timeframe = parseInt(document.getElementById('timeframe').value) || 1;
    const interestRate = parseFloat(document.getElementById('interestRate').value) / 100 || 0;

    const amountNeeded = Math.max(0, goalAmount - currentSavings);
    const monthlyRate = interestRate / 12;
    const totalMonths = timeframe;

    // Calculate monthly savings needed
    // Using future value of annuity formula solved for PMT
    let monthlySavings;
    if (monthlyRate === 0) {
        monthlySavings = amountNeeded / totalMonths;
    } else {
        // FV = PMT * [((1+r)^n - 1) / r]
        // PMT = FV * r / ((1+r)^n - 1)
        const growthFactor = Math.pow(1 + monthlyRate, totalMonths);
        monthlySavings = amountNeeded * monthlyRate / (growthFactor - 1);
    }

    // Calculate totals
    const totalContributions = monthlySavings * totalMonths;
    const interestEarned = Math.max(0, amountNeeded - totalContributions);
    const weeklySavings = monthlySavings * 12 / 52;
    const dailySavings = monthlySavings * 12 / 365;
    const finalBalance = currentSavings + totalContributions + interestEarned;

    // Update main results
    document.getElementById('monthlySavings').textContent = formatCurrency(monthlySavings);
    document.getElementById('weeklySavings').textContent = formatCurrency(weeklySavings);
    document.getElementById('dailySavings').textContent = formatCurrency(dailySavings);
    document.getElementById('totalContributions').textContent = formatCurrency(totalContributions);
    document.getElementById('interestEarned').textContent = formatCurrency(interestEarned);

    // Update breakdown tab
    const goalDisplay = document.getElementById('goalDisplay');
    const currentDisplay = document.getElementById('currentDisplay');
    const amountNeededEl = document.getElementById('amountNeeded');
    const timeframeDisplay = document.getElementById('timeframeDisplay');
    const rateDisplay = document.getElementById('rateDisplay');
    const finalBalanceEl = document.getElementById('finalBalance');

    if (goalDisplay) goalDisplay.textContent = formatCurrency(goalAmount);
    if (currentDisplay) currentDisplay.textContent = formatCurrency(currentSavings);
    if (amountNeededEl) amountNeededEl.textContent = formatCurrency(amountNeeded);
    if (timeframeDisplay) timeframeDisplay.textContent = timeframe + ' months';
    if (rateDisplay) rateDisplay.textContent = (interestRate * 100).toFixed(1) + '%';
    if (finalBalanceEl) finalBalanceEl.textContent = formatCurrency(finalBalance);

    // Generate schedule table
    generateSchedule(currentSavings, monthlySavings, monthlyRate, totalMonths);

    // Show results (for old layout compatibility)
    const results = document.getElementById('results');
    if (results) {
        results.classList.add('show');
        if (shouldScroll) {
            results.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function generateSchedule(startBalance, monthlyContribution, monthlyRate, totalMonths) {
    const scheduleBody = document.getElementById('scheduleBody');
    if (!scheduleBody) return;

    scheduleBody.innerHTML = '';
    let balance = startBalance;
    
    // Show first 12 months, then every 6 months, then final month
    const monthsToShow = [];
    for (let i = 1; i <= Math.min(12, totalMonths); i++) {
        monthsToShow.push(i);
    }
    for (let i = 18; i < totalMonths; i += 6) {
        if (!monthsToShow.includes(i)) monthsToShow.push(i);
    }
    if (!monthsToShow.includes(totalMonths)) monthsToShow.push(totalMonths);

    let cumulativeInterest = 0;
    for (let month = 1; month <= totalMonths; month++) {
        const interest = balance * monthlyRate;
        cumulativeInterest += interest;
        balance = balance + monthlyContribution + interest;

        if (monthsToShow.includes(month)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${month}</td>
                <td>${formatCurrency(monthlyContribution)}</td>
                <td>${formatCurrency(interest)}</td>
                <td>${formatCurrency(balance)}</td>
            `;
            scheduleBody.appendChild(row);
        }
    }
}

/**
 * Format currency using I18n if available, otherwise fallback to default
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    if (isNaN(amount) || !isFinite(amount)) amount = 0;
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

// Listen for language changes and recalculate
document.addEventListener('languageChange', function() {
    calculateSavingsGoal(false);
});

document.addEventListener('DOMContentLoaded', () => calculateSavingsGoal(false));
