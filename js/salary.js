// Salary Calculator Logic

document.getElementById('salaryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateSalary(true);
});

// Also calculate on input change for real-time updates
document.querySelectorAll('#salaryForm input, #salaryForm select').forEach(el => {
    el.addEventListener('change', () => calculateSalary(false));
});

function calculateSalary(shouldScroll = false) {
    const amount = parseFloat(document.getElementById('salaryAmount').value);
    const period = document.getElementById('salaryPeriod').value;
    const hoursPerWeek = parseFloat(document.getElementById('hoursPerWeek').value);
    const weeksPerYear = parseFloat(document.getElementById('weeksPerYear').value);

    // Calculate annual salary first
    let annualSalary;
    const hoursPerYear = hoursPerWeek * weeksPerYear;

    switch(period) {
        case 'hourly':
            annualSalary = amount * hoursPerYear;
            break;
        case 'weekly':
            annualSalary = amount * weeksPerYear;
            break;
        case 'biweekly':
            annualSalary = amount * 26;
            break;
        case 'monthly':
            annualSalary = amount * 12;
            break;
        case 'annual':
        default:
            annualSalary = amount;
    }

    // Calculate all periods
    const hourly = annualSalary / hoursPerYear;
    const daily = annualSalary / (weeksPerYear * 5); // Assuming 5-day work week
    const weekly = annualSalary / weeksPerYear;
    const biweekly = annualSalary / 26;
    const semimonthly = annualSalary / 24;
    const monthly = annualSalary / 12;
    const quarterly = annualSalary / 4;

    // Update results using I18n.formatCurrency()
    document.getElementById('hourlyPay').textContent = I18n.formatCurrency(hourly);
    document.getElementById('dailyPay').textContent = I18n.formatCurrency(daily);
    document.getElementById('weeklyPay').textContent = I18n.formatCurrency(weekly);
    document.getElementById('biweeklyPay').textContent = I18n.formatCurrency(biweekly);
    document.getElementById('semimonthlyPay').textContent = I18n.formatCurrency(semimonthly);
    document.getElementById('monthlyPay').textContent = I18n.formatCurrency(monthly);
    document.getElementById('quarterlyPay').textContent = I18n.formatCurrency(quarterly);
    document.getElementById('annualPay').textContent = I18n.formatCurrency(annualSalary);

    // Show results
    document.getElementById('results').classList.add('show');
}

// Calculate on page load with default values (without scrolling)
document.addEventListener('DOMContentLoaded', () => {
    // Wait for i18n to be ready before calculating
    if (typeof I18n !== 'undefined' && I18n.isLoaded) {
        calculateSalary(false);
    } else {
        document.addEventListener('i18nReady', () => calculateSalary(false));
    }
});

// Recalculate when language changes to update currency formatting
document.addEventListener('languageChange', () => calculateSalary(false));
