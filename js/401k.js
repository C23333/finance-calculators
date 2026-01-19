// 401(k) Calculator Logic

document.getElementById('calc401kForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculate401k();
});

// Auto-calculate on input change
document.querySelectorAll('#calc401kForm input, #calc401kForm select').forEach(input => {
    input.addEventListener('input', () => calculate401k());
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
        // Show corresponding tab content
        const tabId = this.getAttribute('data-tab') + 'Content';
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
            tabContent.classList.add('active');
        }
    });
});

function calculate401k() {
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const annualSalary = parseFloat(document.getElementById('annualSalary').value);
    const currentBalance = parseFloat(document.getElementById('currentBalance').value);
    const contributionPercent = parseFloat(document.getElementById('contributionPercent').value) / 100;
    const employerMatchPercent = parseFloat(document.getElementById('employerMatch').value) / 100;
    const matchLimit = parseFloat(document.getElementById('matchLimit').value) / 100;
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value) / 100;
    const salaryIncrease = parseFloat(document.getElementById('salaryIncrease').value) / 100;

    const yearsToRetirement = retirementAge - currentAge;

    let balance = currentBalance;
    let totalYourContributions = 0;
    let totalEmployerContributions = 0;
    let salary = annualSalary;

    // First year contributions for display
    const firstYearContribution = salary * contributionPercent;
    const firstYearMatchableAmount = Math.min(salary * contributionPercent, salary * matchLimit);
    const firstYearMatch = firstYearMatchableAmount * employerMatchPercent;

    // Calculate year by year
    for (let year = 0; year < yearsToRetirement; year++) {
        // Your contribution
        const yourContribution = salary * contributionPercent;
        totalYourContributions += yourContribution;

        // Employer match (limited to match limit)
        const matchableAmount = Math.min(yourContribution, salary * matchLimit);
        const employerContribution = matchableAmount * employerMatchPercent;
        totalEmployerContributions += employerContribution;

        // Add contributions and growth
        balance += yourContribution + employerContribution;
        balance *= (1 + expectedReturn);

        // Increase salary for next year
        salary *= (1 + salaryIncrease);
    }

    // Calculate investment growth
    const totalContributions = currentBalance + totalYourContributions + totalEmployerContributions;
    const investmentGrowth = balance - totalContributions;

    // Monthly income using 4% rule
    const monthlyIncome = (balance * 0.04) / 12;

    // Update results
    document.getElementById('totalAtRetirement').textContent = I18n.formatCurrency(balance, { decimals: 0 });
    document.getElementById('yourContributions').textContent = I18n.formatCurrency(totalYourContributions, { decimals: 0 });
    document.getElementById('employerContributions').textContent = I18n.formatCurrency(totalEmployerContributions, { decimals: 0 });
    document.getElementById('investmentGrowth').textContent = I18n.formatCurrency(investmentGrowth, { decimals: 0 });
    document.getElementById('monthlyIncome').textContent = I18n.formatCurrency(monthlyIncome, { decimals: 0 });
    document.getElementById('yearsToRetirement').textContent = yearsToRetirement + ' ' + I18n.t('common.years');
    document.getElementById('annualContribution').textContent = I18n.formatCurrency(firstYearContribution, { decimals: 0 });
    document.getElementById('annualMatch').textContent = I18n.formatCurrency(firstYearMatch, { decimals: 0 });
}

// Listen for language changes and recalculate
document.addEventListener('languageChange', function() {
    calculate401k();
});

document.addEventListener('DOMContentLoaded', () => calculate401k());
