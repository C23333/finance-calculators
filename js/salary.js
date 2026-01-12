// Salary Calculator Logic

document.getElementById('salaryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateSalary();
});

// Also calculate on input change for real-time updates
document.querySelectorAll('#salaryForm input, #salaryForm select').forEach(el => {
    el.addEventListener('change', calculateSalary);
});

function calculateSalary() {
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

    // Update results
    document.getElementById('hourlyPay').textContent = formatCurrency(hourly);
    document.getElementById('dailyPay').textContent = formatCurrency(daily);
    document.getElementById('weeklyPay').textContent = formatCurrency(weekly);
    document.getElementById('biweeklyPay').textContent = formatCurrency(biweekly);
    document.getElementById('semimonthlyPay').textContent = formatCurrency(semimonthly);
    document.getElementById('monthlyPay').textContent = formatCurrency(monthly);
    document.getElementById('quarterlyPay').textContent = formatCurrency(quarterly);
    document.getElementById('annualPay').textContent = formatCurrency(annualSalary);

    // Show results
    document.getElementById('results').classList.add('show');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

document.addEventListener('DOMContentLoaded', calculateSalary);
