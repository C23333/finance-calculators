// 401(k) Calculator Logic

document.getElementById('calc401kForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculate401k(true);
});

function calculate401k(shouldScroll = false) {
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
    document.getElementById('totalAtRetirement').textContent = formatCurrency(balance);
    document.getElementById('yourContributions').textContent = formatCurrency(totalYourContributions);
    document.getElementById('employerContributions').textContent = formatCurrency(totalEmployerContributions);
    document.getElementById('investmentGrowth').textContent = formatCurrency(investmentGrowth);
    document.getElementById('monthlyIncome').textContent = formatCurrency(monthlyIncome);
    document.getElementById('yearsToRetirement').textContent = yearsToRetirement + ' years';
    document.getElementById('annualContribution').textContent = formatCurrency(firstYearContribution);
    document.getElementById('annualMatch').textContent = formatCurrency(firstYearMatch);

    // Show results
    document.getElementById('results').classList.add('show');
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

document.addEventListener('DOMContentLoaded', () => calculate401k(false));
