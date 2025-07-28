function calculatePercentage(achieved, target) {
    return target > 0 ? (achieved / target) * 100 : 0;
}

function getMonthlyAchievementFromDbProduct({ id, name, target, realisasi }) {
    const percentage = calculatePercentage(realisasi, target);
    const sisa = Math.max(0, target - realisasi);

    return {
        id,
        name,
        labels: ["Tercapai", "Belum Tercapai"],
        series: [realisasi, sisa],
        percentage: parseFloat(percentage.toFixed(2)),
    };
}

module.exports = { getMonthlyAchievementFromDbProduct };
