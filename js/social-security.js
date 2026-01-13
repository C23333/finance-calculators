document.getElementById('socialSecurityForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateSocialSecurity(true);
});

function calculateSocialSecurity(shouldScroll = false) {
    const currentAge = parseInt(document.getElementById('currentAge').value);
    const birthYear = parseInt(document.getElementById('birthYear').value);
    const retirementAge = parseInt(document.getElementById('retirementAge').value);
    const averageEarnings = parseFloat(document.getElementById('averageEarnings').value);
    const currentEarnings = parseFloat(document.getElementById('currentEarnings').value);
    const expectedRaise = parseFloat(document.getElementById('expectedRaise').value) / 100;

    // Determine Full Retirement Age based on birth year
    let fra = 67;
    if (birthYear <= 1937) fra = 65;
    else if (birthYear <= 1938) fra = 65 + 2/12;
    else if (birthYear <= 1939) fra = 65 + 4/12;
    else if (birthYear <= 1940) fra = 65 + 6/12;
    else if (birthYear <= 1941) fra = 65 + 8/12;
    else if (birthYear <= 1942) fra = 65 + 10/12;
    else if (birthYear <= 1954) fra = 66;
    else if (birthYear <= 1955) fra = 66 + 2/12;
    else if (birthYear <= 1956) fra = 66 + 4/12;
    else if (birthYear <= 1957) fra = 66 + 6/12;
    else if (birthYear <= 1958) fra = 66 + 8/12;
    else if (birthYear <= 1959) fra = 66 + 10/12;
    else fra = 67;

    // Calculate projected average earnings at retirement
    let projectedEarnings = averageEarnings;
    const yearsToRetirement = retirementAge - currentAge;

    if (yearsToRetirement > 0) {
        // Simple projection: blend current average with future earnings
        let futureEarningsSum = 0;
        let earnings = currentEarnings;
        for (let i = 0; i < yearsToRetirement; i++) {
            futureEarningsSum += Math.min(earnings, 168600); // Cap at max taxable
            earnings *= (1 + expectedRaise);
        }
        const futureAverage = futureEarningsSum / yearsToRetirement;
        // Weight future earnings into the 35-year average
        const yearsWorked = Math.min(35, currentAge - 22);
        const totalYears = Math.min(35, yearsWorked + yearsToRetirement);
        projectedEarnings = (averageEarnings * yearsWorked + futureAverage * yearsToRetirement) / totalYears;
    }

    // Calculate AIME (Average Indexed Monthly Earnings)
    const aime = Math.min(projectedEarnings, 168600) / 12;

    // Calculate PIA (Primary Insurance Amount) using 2024 bend points
    const bendPoint1 = 1174;
    const bendPoint2 = 7078;

    let pia = 0;
    if (aime <= bendPoint1) {
        pia = aime * 0.90;
    } else if (aime <= bendPoint2) {
        pia = bendPoint1 * 0.90 + (aime - bendPoint1) * 0.32;
    } else {
        pia = bendPoint1 * 0.90 + (bendPoint2 - bendPoint1) * 0.32 + (aime - bendPoint2) * 0.15;
    }

    // Calculate benefits at different ages
    const benefitAtFRA = pia;

    // Early retirement reduction (before FRA)
    // 5/9 of 1% per month for first 36 months, 5/12 of 1% for additional months
    let benefitAt62 = pia;
    const monthsEarly = (fra - 62) * 12;
    if (monthsEarly <= 36) {
        benefitAt62 = pia * (1 - monthsEarly * 5/9/100);
    } else {
        benefitAt62 = pia * (1 - 36 * 5/9/100 - (monthsEarly - 36) * 5/12/100);
    }

    // Delayed retirement credits (after FRA until 70)
    // 8% per year = 2/3 of 1% per month
    const monthsDelayed = (70 - fra) * 12;
    const benefitAt70 = pia * (1 + monthsDelayed * 2/3/100);

    // Calculate benefit at chosen retirement age
    let monthlyBenefit;
    if (retirementAge < fra) {
        const monthsEarlyChosen = (fra - retirementAge) * 12;
        if (monthsEarlyChosen <= 36) {
            monthlyBenefit = pia * (1 - monthsEarlyChosen * 5/9/100);
        } else {
            monthlyBenefit = pia * (1 - 36 * 5/9/100 - (monthsEarlyChosen - 36) * 5/12/100);
        }
    } else if (retirementAge > fra) {
        const monthsDelayedChosen = (retirementAge - fra) * 12;
        monthlyBenefit = pia * (1 + monthsDelayedChosen * 2/3/100);
    } else {
        monthlyBenefit = pia;
    }

    // Calculate lifetime benefits (assuming life expectancy of 85)
    const lifeExpectancy = 85;
    const yearsReceiving = lifeExpectancy - retirementAge;
    const lifetimeBenefits = monthlyBenefit * 12 * yearsReceiving;

    // Calculate break-even age (comparing early vs FRA)
    const totalAt62By = (age) => benefitAt62 * 12 * (age - 62);
    const totalAtFRABy = (age) => benefitAtFRA * 12 * Math.max(0, age - fra);

    let breakEvenAge = null;
    for (let age = Math.ceil(fra); age <= 100; age++) {
        if (totalAtFRABy(age) >= totalAt62By(age)) {
            breakEvenAge = age;
            break;
        }
    }

    // Display results
    document.getElementById('monthlyBenefit').textContent = I18n.formatCurrency(monthlyBenefit, { decimals: 0 });
    document.getElementById('annualBenefit').textContent = I18n.formatCurrency(monthlyBenefit * 12, { decimals: 0 });
    document.getElementById('fullRetirementAge').textContent = formatAge(fra);
    document.getElementById('benefitAt62').textContent = I18n.formatCurrency(benefitAt62, { decimals: 0 });
    document.getElementById('benefitAtFRA').textContent = I18n.formatCurrency(benefitAtFRA, { decimals: 0 });
    document.getElementById('benefitAt70').textContent = I18n.formatCurrency(benefitAt70, { decimals: 0 });
    document.getElementById('lifetimeBenefits').textContent = I18n.formatCurrency(lifetimeBenefits, { decimals: 0 });
    document.getElementById('breakEvenAge').textContent = breakEvenAge ? `Age ${breakEvenAge}` : 'N/A';

    // Build comparison table
    const comparisonBody = document.getElementById('comparisonBody');
    const scenarios = [
        { age: 62, benefit: benefitAt62, label: '62 (Early)' },
        { age: Math.round(fra), benefit: benefitAtFRA, label: `${formatAge(fra)} (FRA)` },
        { age: 70, benefit: benefitAt70, label: '70 (Delayed)' }
    ];

    comparisonBody.innerHTML = scenarios.map(s => {
        const yearsRec = lifeExpectancy - s.age;
        const lifetime = s.benefit * 12 * yearsRec;
        return `
            <tr>
                <td>${s.label}</td>
                <td>${I18n.formatCurrency(s.benefit, { decimals: 0 })}</td>
                <td>${I18n.formatCurrency(s.benefit * 12, { decimals: 0 })}</td>
                <td>${I18n.formatCurrency(lifetime, { decimals: 0 })}</td>
            </tr>
        `;
    }).join('');

    document.getElementById('results').style.display = 'block';
    if (shouldScroll) {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }
}

function formatAge(age) {
    const years = Math.floor(age);
    const months = Math.round((age - years) * 12);
    if (months === 0) return `${years}`;
    return `${years} and ${months} months`;
}

// Listen for language changes and recalculate
document.addEventListener('languageChange', function() {
    // Recalculate to update currency formatting
    if (document.getElementById('results').style.display !== 'none') {
        calculateSocialSecurity(false);
    }
});

// Calculate on page load with default values
document.addEventListener('DOMContentLoaded', function() {
    calculateSocialSecurity(false);
});
