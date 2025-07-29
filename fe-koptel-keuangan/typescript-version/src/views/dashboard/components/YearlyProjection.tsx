import React from "react";
import { Theme } from "@mui/material/styles";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import ReactApexcharts from "src/@core/components/react-apexcharts";
import {
  getBarChartOptions,
  getLineChartOptions,
  formatRupiah,
} from "../utils";

interface YearlyProjectionData {
  currentYear: number;
  realisasiTahunIniPercentage: number;
  productFullYearAchievement: Array<{ name: string; percentage: number }>;
  productFullYearCategories: string[];
  productFullYearSeries: Array<{ name: string; data: number[] }>;
  projectionCategories: string[];
  projectionChartSeries: Array<{ name: string; data: number[] }>;
  projectedTotalRealisasi: number;
  pencapaianPersen?: number; // ⬅️ Tambahkan properti baru
}

interface YearlyProjectionProps {
  data?: Partial<YearlyProjectionData>;
  totalFullYearTarget: number;
  theme: Theme;
}

const YearlyProjection = ({
  data = {},
  totalFullYearTarget,
  theme,
}: YearlyProjectionProps) => {
  const {
    currentYear = new Date().getFullYear(),
    realisasiTahunIniPercentage = 0,
    productFullYearAchievement = [],
    productFullYearCategories = [],
    productFullYearSeries = [],
    projectionCategories = [],
    projectionChartSeries = [],
    projectedTotalRealisasi = 0,
    pencapaianPersen = 0, // ⬅️ Ambil dari props
  } = data;

  const productFullYearColors = productFullYearAchievement.map((p) =>
    p.percentage >= 100 ? theme.palette.success.main : theme.palette.error.main
  );

  return (
    <Grid container spacing={4} sx={{ mb: 4 }}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
          Proyeksi Akhir Tahun {currentYear}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader
            title="Ringkasan Proyeksi"
            titleTypographyProps={{ sx: { color: "text.primary" } }}
          />
          <CardContent>
            <Grid container spacing={4}>
              {/* Circular Progress */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Pencapaian Target Tahunan
                </Typography>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Box sx={{ position: "relative", display: "inline-flex" }}>
                    <CircularProgress
                      variant="determinate"
                      value={realisasiTahunIniPercentage}
                      size={100}
                      thickness={5}
                      sx={{
                        color:
                          realisasiTahunIniPercentage >= 100
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                      }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="div"
                        color="text.secondary"
                      >
                        {`${realisasiTahunIniPercentage.toFixed(0)}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ mt: 2, color: "text.secondary", textAlign: "center" }}
                  >
                    Realisasi YTD dari Target Tahunan
                  </Typography>

                  {/* Tambahan Pencapaian Persen */}
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 2,
                      fontWeight: 600,
                      color:
                        pencapaianPersen >= 100
                          ? theme.palette.success.main
                          : theme.palette.warning.main,
                      textAlign: "center",
                    }}
                  >
                    Pencapaian Total Tahun Ini: {realisasiTahunIniPercentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>

              {/* Bar Chart */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Produk Mencapai Target (Tahunan)
                </Typography>
                <ReactApexcharts
                  type="bar"
                  height={250}
                  options={getBarChartOptions(
                    theme,
                    productFullYearCategories,
                    productFullYearColors
                  )}
                  series={productFullYearSeries}
                />
              </Grid>

              {/* Line Chart */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Proyeksi Realisasi Akhir Tahun
                </Typography>
                <ReactApexcharts
                  type="line"
                  height={250}
                  options={{
                    ...getLineChartOptions(theme, projectionCategories, [
                      "Realisasi Aktual & Proyeksi",
                    ]),
                    stroke: {
                      dashArray: [0, 5],
                      curve: "smooth",
                      width: 2,
                      colors: [theme.palette.primary.main],
                    },
                  }}
                  series={projectionChartSeries}
                />
                <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
                  Total Proyeksi: {formatRupiah(projectedTotalRealisasi)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default YearlyProjection;
