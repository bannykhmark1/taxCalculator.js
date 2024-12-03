function calculateFullCost(netSalary, regionRate) {
    const CONTRIBUTION_RATE = 0.076;

    // Диапазоны и ставки НДФЛ
    const TAX_RANGES = [
        { threshold: 200000, rate: 0.13 },
        { threshold: 416700, rate: 0.15 },
        { threshold: 1670000, rate: 0.18 },
    ];

    let grossSalary = 0; // Общая брутто зарплата
    let remainingNetSalary = netSalary; // Остаток "чистой" зарплаты
    let ndflAmount = 0; // Суммарный НДФЛ
    let detailedTaxes = []; // Подробности расчета по диапазонам
    
    // Рассчет НДФЛ по каждому диапазону
    for (let i = 0; i < TAX_RANGES.length; i++) {
        const { threshold, rate } = TAX_RANGES[i];
        const lowerLimit = i === 0 ? 0 : TAX_RANGES[i - 1].threshold;

        const taxableAmount = Math.min(
            Math.max(0, netSalary - lowerLimit),
            threshold - lowerLimit
        );

        if (taxableAmount > 0) {
            const grossForRange = taxableAmount / (1 - rate);
            grossSalary += grossForRange;

            const ndflForRange = grossForRange - taxableAmount;
            ndflAmount += ndflForRange;

            detailedTaxes.push({
                range: i === 0
                    ? `От 0 до ${threshold.toLocaleString()} руб.`
                    : `Свыше ${lowerLimit.toLocaleString()} до ${threshold.toLocaleString()} руб.`,
                rate: rate * 100,
                taxableAmount: taxableAmount,
                ndflForThisPart: ndflForRange,
            });

            remainingNetSalary -= taxableAmount;
        }
    }

    const contributions = grossSalary * CONTRIBUTION_RATE;
    const regionalBonus = netSalary * regionRate;
    const totalCost = grossSalary + contributions + regionalBonus;

    return {
        salary: netSalary,
        grossSalary,
        ndflAmount,
        contributions,
        regionalBonus,
        totalCost,
        detailedTaxes,
    };
}

document.getElementById("calculateButton").addEventListener("click", () => {
    const salaryInput = parseFloat(document.getElementById("salaryInput").value);
    const regionRate = parseFloat(document.querySelector('input[name="region"]:checked').value);

    if (isNaN(salaryInput) || salaryInput <= 0) {
        alert("Введите корректную сумму зарплаты.");
        return;
    }

    const result = calculateFullCost(salaryInput, regionRate);

    document.getElementById("grossSalary").innerHTML = `
        <strong>Зарплата с НДФЛ (брутто):</strong> ${result.grossSalary.toFixed(2)} руб.
    `;
    document.getElementById("incomeTax").innerHTML = `
        <strong>НДФЛ:</strong> ${result.ndflAmount.toFixed(2)} руб.
    `;
    document.getElementById("pensionContribution").innerHTML = `
        <strong>Страховые взносы (7.6%):</strong> ${result.contributions.toFixed(2)} руб.
    `;
    document.getElementById("regionalCoefficient").innerHTML = `
        <strong>Районный коэффициент:</strong> ${result.regionalBonus.toFixed(2)} руб.
    `;
    document.getElementById("totalCost").innerHTML = `
        <strong>Полная стоимость сотрудника:</strong> ${result.totalCost.toFixed(2)} руб.
    `;

    let explanation = `<strong>Детализация расчета НДФЛ:</strong><br>`;
    result.detailedTaxes.forEach((item) => {
        explanation += `
            <div>
                Диапазон: ${item.range}<br>
                Ставка НДФЛ: ${item.rate}%<br>
                Налогооблагаемая сумма: ${item.taxableAmount.toFixed(2)} руб.<br>
                НДФЛ для этого диапазона: ${item.ndflForThisPart.toFixed(2)} руб.<br>
            </div><br>
        `;
    });

    document.getElementById("explanation").innerHTML = explanation;

    document.querySelector(".results").style.display = "block";
});
