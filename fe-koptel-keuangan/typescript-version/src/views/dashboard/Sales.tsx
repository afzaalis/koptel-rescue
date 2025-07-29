import React, { useState, useEffect } from "react";
import { useTheme, Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import io from "socket.io-client";

import NavigationButtons from "./components/NavigationButtons";
import TopComparison from "./components/TopComparison";
import CurrentMonthPerformance from "./components/CurrentMonthPerformance";
import YTDPerformance from "./components/YDTPerformance";
import YearlyProjection from "./components/YearlyProjection";
import StatisticsAndYearlyComparison from "./components/StatisticsAndYearlyComparison";

import { BASE_URL } from "src/networks/apiServices";

interface DashboardData {
  topComparison: {
    previousRealisasi: number;
    currentRealisasi: number;
    realisasiComparisonValue: number;
    realisasiComparisonPercentage: string;
    isRealisasiIncreasing: boolean;
    nominalTargetBulanan: string;
    nominalRealisasiBulanan: string;
  };
  currentMonthPerformance: {
    totalTarget: number;
    totalRealisasi: number;
    pieTargetBulanIniSeries: number[];
    pieTargetBulanIniLabels: string[];
    realisasiBulanIniPercentage: number;
    productMonthlyAchievements: Array<{
      id: string;
      name: string;
      series: number[];
      labels: string[];
      percentage: number;
    }>;
  };
  ytdPerformance: {
    totalTarget: number;
    totalRealisasi: number;
    pieTargetYTDSeries: number[];
    pieTargetYTDLabels: string[];
    realisasiYTDPercentage: number;
    productDistributionYTDSeries: number[];
    productDistributionYTDLabels: string[];
  };
  yearlyProjection: {
    currentYear: number;
    realisasiTahunIniPercentage: number;
    productFullYearAchievement: Array<{ name: string; percentage: number }>;
    productFullYearCategories: string[];
    productFullYearSeries: Array<{ name: string; data: number[] }>;
    projectionCategories: string[];
    projectionChartSeries: Array<{ name: string; data: number[] }>;
    projectedTotalRealisasi: number;
    pencapaianPersen: number;
  };
  statisticsAndYearlyComparison: {
    productPerformanceTableData: Array<{
      name: string;
      target: number;
      realisasi: number;
      pencapaian: string;
    }>;
    yearlyComparisonCategories: string[];
    yearlyComparisonSeries: Array<{ name: string; data: number[] }>;
  };
}

const Sales = () => {
  const theme: Theme = useTheme();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(BASE_URL);

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socket.on("dashboard_update", (data: DashboardData) => {
      console.log("Received live dashboard update:", data);
      setDashboardData(data);
      setLoading(false);
      setError(null);
    });

    socket.on("connect_error", (err: any) => {
      console.error("Socket.IO connection error:", err);
      setError(`Failed to connect to real-time updates: ${err.message || err}`);
      setLoading(false);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    return () => {
      socket.disconnect();
      console.log("Socket.IO disconnected on component unmount.");
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Pastikan backend berjalan di {BASE_URL} dan Socket.IO terhubung dengan benar.
        </Typography>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Typography variant="h6">Tidak ada data untuk ditampilkan.</Typography>
      </Box>
    );
  }

const totalTargetTahun = dashboardData.statisticsAndYearlyComparison?.productPerformanceTableData
  ?.reduce((sum, p) => sum + (p.target || 0) * 12, 0) || 0;

const totalRealisasiYTD = dashboardData.ytdPerformance?.totalRealisasi || 0;

const pencapaianPersen = totalTargetTahun > 0
  ? (totalRealisasiYTD / totalTargetTahun) * 100
  : 0;

const yearlyProgress = {
  totalTargetTahun,
  totalRealisasiYTD,
  pencapaianPersen,
};

console.log(">>> Total Target Tahun:", totalTargetTahun);
console.log(">>> Total Realisasi YTD:", totalRealisasiYTD);
console.log(">>> Pencapaian %:", pencapaianPersen);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <NavigationButtons />

      <TopComparison
        data={dashboardData.topComparison}
        theme={theme}
        yearlyProgress={yearlyProgress}
      />

      <CurrentMonthPerformance
        data={dashboardData.currentMonthPerformance}
        theme={theme}
        key="currentMonthPerformance"
      />

      <YTDPerformance
        data={dashboardData.ytdPerformance}
        theme={theme}
        currentYear={dashboardData.yearlyProjection.currentYear}
        key="ytdPerformance"
      />

      <YearlyProjection
        data={dashboardData.yearlyProjection}
        totalFullYearTarget={dashboardData.statisticsAndYearlyComparison.productPerformanceTableData.reduce(
          (sum, p) => sum + (p.target || 0),
          0
        )}
        theme={theme}
        key="yearlyProjection"
      />

      <StatisticsAndYearlyComparison
        data={dashboardData.statisticsAndYearlyComparison}
        theme={theme}
        key="statisticsAndYearlyComparison"
      />
    </Box>
  );
};

export default Sales;
