import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Box,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import ReactApexcharts from "src/@core/components/react-apexcharts";
import { getPieChartOptions, formatRupiah } from "../utils";
import { ApexOptions } from "apexcharts";

// Formatter angka ringkas (contoh: 1.2Jt, 3.4M)
const formatAngkaPendek = (val: number): string => {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + "M";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "Jt";
  if (val >= 1_000) return (val / 1_000).toFixed(1) + "Rb";
  return val.toString();
};

interface YTDPerformanceData {
  totalTarget: number;
  totalRealisasi: number;
  pieTargetYTDSeries: number[];
  pieTargetYTDLabels: string[];
  realisasiYTDPercentage: number;
  productDistributionYTDSeries: number[];
  productDistributionYTDLabels: string[];
}

interface YTDPerformanceProps {
  data: YTDPerformanceData;
  theme: Theme;
  currentYear: number;
}

const YTDPerformance = ({ data, theme, currentYear }: YTDPerformanceProps) => {
  const {
    totalTarget,
    totalRealisasi,
    pieTargetYTDSeries,
    pieTargetYTDLabels,
    realisasiYTDPercentage,
    productDistributionYTDSeries,
    productDistributionYTDLabels,
  } = data;

  const [chartType, setChartType] = useState<"pie" | "bar">("bar");

  const pieTargetYTDColors = [theme.palette.success.main, theme.palette.error.main];
  const distributionColors = [
    theme.palette.primary.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.secondary.main,
  ];

  const barChartOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: "50%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => formatAngkaPendek(val),
    },
    xaxis: {
    categories: productDistributionYTDLabels,
    labels: {
      style: { colors: theme.palette.text.secondary },
      formatter: (val: string | number) => formatAngkaPendek(Number(val)),
    },
  },

    colors: distributionColors,
    tooltip: {
      y: {
        formatter: (val: number) => formatAngkaPendek(val),
      },
    },
    grid: { borderColor: theme.palette.divider },
  };

  return (
    <Grid container spacing={4} sx={{ mb: 4 }} style={{ marginTop: "10px", marginBottom: "10px" }}>

      <Grid item xs={12} md={9}>
        <Card>
          <CardHeader
            title={`Performa Year-to-Date (${currentYear})`}
            titleTypographyProps={{ sx: { color: "text.primary" } }}
          />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              {/* Donut: Target vs Realisasi */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Target vs Realisasi YTD
                </Typography>
                <ReactApexcharts
                  type="donut"
                  height={260}
                  options={getPieChartOptions(
                    theme,
                    pieTargetYTDLabels,
                    pieTargetYTDColors,
                    realisasiYTDPercentage,
                    formatAngkaPendek,
                  )}
                  series={pieTargetYTDSeries}
                />
              </Grid>

              {/* Distribusi Produk */}
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">Distribusi Realisasi Produk YTD</Typography>
                  <Select
                    size="small"
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as "pie" | "bar")}
                  >
                    <MenuItem value="bar">Bar Chart</MenuItem>
                    <MenuItem value="pie">Pie Chart</MenuItem>
                  </Select>
                </Box>
                {chartType === "pie" ? (
                  <ReactApexcharts
                    type="donut"
                    height={260}
                    options={getPieChartOptions(
                      theme,
                      productDistributionYTDLabels,
                      distributionColors,
                      undefined,
                      formatAngkaPendek
                    )}
                    series={productDistributionYTDSeries}
                  />
                ) : (
                  <ReactApexcharts
                    type="bar"
                    height={260}
                    options={barChartOptions}
                    series={[{ name: "Realisasi", data: productDistributionYTDSeries }]}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Ringkasan total */}
      {/* <Grid item xs={12} md={3}>
        <Card sx={{ backgroundColor: theme.palette.warning.light }}>
          <CardHeader
            title="Ringkasan Target & Realisasi"
            titleTypographyProps={{ sx: { color: "text.primary" } }}
          />
          <CardContent>
            <Box mb={3}>
              <Typography variant="body2" color="text.secondary">
                Total Target
              </Typography>
              <Typography variant="h6" color="text.primary">
                {formatRupiah(totalTarget)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Realisasi
              </Typography>
              <Typography variant="h6" color="text.primary">
                {formatRupiah(totalRealisasi)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid> */}

      <Grid item xs={12} md={3}>
        <Card
          sx={{
            height: '100%',
            backgroundColor: theme.palette.background.paper,
            backdropFilter: 'blur(6px)',  
            WebkitBackdropFilter: 'blur(6px)', // untuk Safari
            border: '1px solid',
            borderColor: theme.palette.divider,
            boxShadow: theme.shadows[3],
          }}
        >
          <CardHeader
            title="Ringkasan"
            titleTypographyProps={{ sx: { color: theme.palette.text.primary } }}
          />
          <Divider />
        <CardContent>
            <Box mb={3}>
              <Typography variant="body2" color="text.secondary">
                Total Target
              </Typography>
              <Typography variant="h6" color="text.primary">
                {formatRupiah(totalTarget)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Realisasi
              </Typography>
              <Typography variant="h6" color="text.primary">
                {formatRupiah(totalRealisasi)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

    </Grid>
  );
};

export default YTDPerformance;
