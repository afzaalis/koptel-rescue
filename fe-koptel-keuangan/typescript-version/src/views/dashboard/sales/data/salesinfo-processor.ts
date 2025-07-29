export interface SalesMonthlyAchievement {
  id: string;
  name: string;
  series: number[];
  labels: string[];
  percentage: number;
}

export const getSalesAchievement = (target: number[], realisasi: number[]): SalesMonthlyAchievement => {
  const currentMonth = new Date().getMonth();
  const currentTarget = target[currentMonth] || 0;
  const currentRealisasi = realisasi[currentMonth] || 0;
  const percentage = currentTarget > 0 ? (currentRealisasi / currentTarget) * 100 : 0;

  return {
    id: "sales-info",
    name: "Sales Info",
    labels: ["Realisasi", "Sisa"],
    series: [currentRealisasi, Math.max(currentTarget - currentRealisasi, 0)],
    percentage,
  };
};
