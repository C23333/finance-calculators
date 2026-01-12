document.getElementById('rothTraditionalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateRothVsTraditional();
});

function calculateRothVsTraditional() {
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const annualContribution = parseFloat(document.getElementById('annualContribution').value);
    const currentTaxRate = parseFloat(document.getElementById('currentTaxRate').value) / 100;
    const retirementTaxRate = parseFloat(document.getElementById('retirementTaxRate').value) / 100;
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value) / 100;
    const currentTraditional = parseFloat(document.getElementById('currentTraditional').value) || 0;
    const currentRoth = parseFloat(document.getElementById('currentRoth').value) || 0;

    const yearsToRetirement = retirementAge - currentAge;

    // Traditional IRA/401k calculations
    // Pre-tax contribution, taxed at withdrawal
    const traditionalContribution = annualContribution;
    let traditionalBalance = currentTraditional;

    for (let i = 0; i < yearsToRetirement; i++) {
        traditionalBalance = (traditionalBalance + traditionalContribution) * (1 + expectedReturn);
    }

    // Tax savings now (invested in taxable account)
    const annualTaxSavings = annualContribution * currentTaxRate;
    let taxSavingsGrowth = 0;
    for (let i = 0; i < yearsToRetirement; i++) {
        taxSavingsGrowth = (taxSavingsGrowth + annualTaxSavings) * (1 + expectedReturn * 0.85); // Assume 15% tax drag
    }

    const traditionalAfterTax = traditionalBalance * (1 - retirementTaxRate) + taxSavingsGrowth * 0.85;

    // Roth IRA/401k calculations
    // After-tax contribution, tax-free withdrawal
    const rothContribution = annualContribution * (1 - currentTaxRate);
    let rothBalance = currentRoth;

    for (let i = 0; i < yearsToRetirement; i++) {
        rothBalance = (rothBalance + rothContribution) * (1 + expectedReturn);
    }

    const rothAfterTax = rothBalance; // No tax on withdrawal

    // Calculate equivalent values
    const traditionalPreTax = traditionalBalance;
    const rothPreTaxEquivalent = rothBalance / (1 - retirementTaxRate);

    // Determine winner
    const difference = rothAfterTax - traditionalAfterTax;
    const percentDifference = (difference / traditionalAfterTax) * 100;

    // Calculate break-even tax rate
    // At what retirement tax rate are they equal?
    // Traditional after tax = Traditional * (1 - r) + taxSavings
    // Roth after tax = Roth
    // Solve for r where Traditional * (1 - r) + taxSavings = Roth
    const breakEvenRate = 1 - (rothBalance - taxSavingsGrowth * 0.85) / traditionalBalance;

    // Monthly income in retirement (assuming 4% withdrawal rate)
    const traditionalMonthlyIncome = (traditionalAfterTax * 0.04) / 12;
    const rothMonthlyIncome = (rothAfterTax * 0.04) / 12;

    // Display results
    document.getElementById('traditionalBalance').textContent = formatCurrency(traditionalBalance);
    document.getElementById('rothBalance').textContent = formatCurrency(rothBalance);
    document.getElementById('traditionalAfterTax').textContent = formatCurrency(traditionalAfterTax);
    document.getElementById('rothAfterTax').textContent = formatCurrency(rothAfterTax);
    document.getElementById('traditionalMonthly').textContent = formatCurrency(traditionalMonthlyIncome);
    document.getElementById('rothMonthly').textContent = formatCurrency(rothMonthlyIncome);
    document.getElementById('difference').textContent = formatCurrency(Math.abs(difference));
    document.getElementById('breakEvenRate').textContent = (breakEvenRate * 100).toFixed(1) + '%';

    // Recommendation
    const recommendationEl = document.getElementById('recommendation');
    if (difference > 0) {
        recommendationEl.innerHTML = `
            <div class="recommendation roth-better">
                <h4>Roth is Better for You</h4>
                <p>Based on your inputs, a Roth account would provide <strong>${formatCurrency(difference)}</strong> more in after-tax retirement savings (${percentDifference.toFixed(1)}% more).</p>
                <p>This is because your expected retirement tax rate (${(retirementTaxRate * 100).toFixed(0)}%) is higher than or close to your current rate (${(currentTaxRate * 100).toFixed(0)}%).</p>
            </div>
        `;
    } else if (difference < 0) {
        recommendationEl.innerHTML = `
            <div class="recommendation traditional-better">
                <h4>Traditional is Better for You</h4>
                <p>Based on your inputs, a Traditional account would provide <strong>${formatCurrency(Math.abs(difference))}</strong> more in after-tax retirement savings (${Math.abs(percentDifference).toFixed(1)}% more).</p>
                <p>This is because your current tax rate (${(currentTaxRate * 100).toFixed(0)}%) is higher than your expected retirement rate (${(retirementTaxRate * 100).toFixed(0)}%).</p>
            </div>
        `;
    } else {
        recommendationEl.innerHTML = `
            <div class="recommendation equal">
                <h4>Both Options Are Equal</h4>
                <p>Based on your inputs, both Traditional and Roth accounts would provide similar after-tax retirement savings.</p>
                <p>Consider other factors like tax diversification and flexibility.</p>
            </div>
        `;
    }

    // Build comparison table
    const comparisonBody = document.getElementById('comparisonBody');
    comparisonBody.innerHTML = `
        <tr>
            <td>Annual Contribution</td>
            <td>${formatCurrency(traditionalContribution)}</td>
            <td>${formatCurrency(rothContribution)}</td>
        </tr>
        <tr>
            <td>Tax Savings Now</td>
            <td>${formatCurrency(annualTaxSavings)}/year</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>Balance at Retirement</td>
            <td>${formatCurrency(traditionalBalance)}</td>
            <td>${formatCurrency(rothBalance)}</td>
        </tr>
        <tr>
            <td>Taxes at Withdrawal</td>
            <td>${formatCurrency(traditionalBalance * retirementTaxRate)}</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>After-Tax Value</td>
            <td>${formatCurrency(traditionalAfterTax)}</td>
            <td>${formatCurrency(rothAfterTax)}</td>
        </tr>
        <tr>
            <td>Monthly Income (4% rule)</td>
            <td>${formatCurrency(traditionalMonthlyIncome)}</td>
            <td>${formatCurrency(rothMonthlyIncome)}</td>
        </tr>
    `;

    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Calculate on page load with default values
document.addEventListener('DOMContentLoaded', function() {
    calculateRothVsTraditional();
});
