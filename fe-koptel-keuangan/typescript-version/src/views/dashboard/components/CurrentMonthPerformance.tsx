import React, { useState,useEffect } from "react";
import { Theme } from "@mui/material/styles";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  MenuItem,
  Select,
  Button,
  Box,
  Divider,
} from "@mui/material";
import CheckCircleOutline from "mdi-material-ui/CheckCircleOutline";
import CloseCircleOutline from "mdi-material-ui/CloseCircleOutline";
import ReactApexcharts from "src/@core/components/react-apexcharts";
import { getPieChartOptions } from "../utils";
import { ApexOptions } from "apexcharts";
import { useRouter } from "next/router";

// Format angka pendek
const formatAngkaPendek = (val: number): string => {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + "M";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "Jt";
  if (val >= 1_000) return (val / 1_000).toFixed(1) + "Rb";
  return val.toString();
};

// Format rupiah
const formatRupiah = (number: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

const bulanSekarang = new Date().toLocaleString("id-ID", {
  month: "long",
  year: "numeric",
});

interface ProductMonthlyAchievement {
  id: string;
  name: string;
  series: number[];
  labels: string[];
  percentage: number;
}

interface CurrentMonthPerformanceData {
  totalTarget: number;
  totalRealisasi: number;
  pieTargetBulanIniSeries: number[];
  pieTargetBulanIniLabels: string[];
  realisasiBulanIniPercentage: number;
  productMonthlyAchievements: ProductMonthlyAchievement[];
}

interface CurrentMonthPerformanceProps {
  data: CurrentMonthPerformanceData;
  theme: Theme;
}

const CurrentMonthPerformance = ({ data, theme }: CurrentMonthPerformanceProps) => {
  const router = useRouter();

  const {
    totalTarget,
    totalRealisasi,
    pieTargetBulanIniSeries,
    pieTargetBulanIniLabels,
    realisasiBulanIniPercentage,
    productMonthlyAchievements,
  } = data;

  // Inisialisasi selectedProductId dengan aman
  const [selectedProductId, setSelectedProductId] = useState(productMonthlyAchievements[0]?.id || "");

  // Jika productMonthlyAchievements kosong, pastikan selectedProductId direset
  // Ini penting agar selectedProduct tidak mencoba mencari ID yang tidak ada
  useEffect(() => {
    if (productMonthlyAchievements.length > 0 && !selectedProductId) {
      setSelectedProductId(productMonthlyAchievements[0].id);
    } else if (productMonthlyAchievements.length === 0 && selectedProductId) {
      setSelectedProductId(""); // Reset jika tidak ada produk
    }
  }, [productMonthlyAchievements, selectedProductId]);


  const [chartType, setChartType] = useState<"pie" | "bar">("bar");

  // Temukan produk yang dipilih
  const selectedProduct = productMonthlyAchievements.find(product => product.id === selectedProductId);

  const pieColors = [theme.palette.success.main, theme.palette.error.main];

  const handleBarClick = async (productName: string) => {
    const productRoutes: Record<string, string> = {
      "Super": "/dashboard/sales/salesinfo",
      "Project Financing": "/dashboard/sales/project-financing",
      "Project Executing": "/dashboard/sales/project-executing",
    };

    const route = productRoutes[productName];
    if (route) {
      await router.push(route);
    } else {
      console.warn("❌ Nama produk tidak dikenali:", productName);
    }
  };

  const barChartOptions = (labels: string[], productId: string): ApexOptions => ({
    chart: {
      type: "bar",
      toolbar: { show: false },
      events: {
        // Menggunakan arrow function untuk memastikan `productId` dan `handleBarClick` di-capture dengan benar
        dataPointSelection: (event, chartContext, config) => {
          // config.dataPointIndex akan memberikan indeks data point yang diklik
          // labels[config.dataPointIndex] akan memberikan nama produk yang diklik
          if (labels && labels[config.dataPointIndex]) {
            handleBarClick(labels[config.dataPointIndex]);
          }
        },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "50%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
    },
    xaxis: {
      categories: labels,
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    yaxis: {
      labels: {
        formatter: val => formatAngkaPendek(val),
        style: { colors: theme.palette.text.secondary },
      },
    },
    colors: [theme.palette.success.main, theme.palette.error.main],
    tooltip: {
      y: {
        formatter: val => formatAngkaPendek(val),
      },
    },
  });

  return (
    <Grid container spacing={4} alignItems="stretch">
      {/* Card Utama */}
      <Grid item xs={12} md={9}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={`Performa Bulan Ini (${bulanSekarang})`}
            titleTypographyProps={{ sx: { color: "text.primary" } }}
            action={
              <Box display="flex" gap={2}>
                {/* Hanya render Select jika ada produk */}
                {productMonthlyAchievements.length > 0 && (
                  <Select
                    size="small"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    {productMonthlyAchievements.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                <Select
                  size="small"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as "pie" | "bar")}
                >
                  <MenuItem value="bar">Bar</MenuItem>
                  <MenuItem value="pie">Pie</MenuItem>
                </Select>
              </Box>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              {/* Target Bulan Ini */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Target Bulan Ini
                </Typography>
                <ReactApexcharts
                  type="donut"
                  height={250}
                  options={getPieChartOptions(
                    theme,
                    pieTargetBulanIniLabels,
                    pieColors,
                    realisasiBulanIniPercentage
                  )}
                  series={pieTargetBulanIniSeries}
                />
              </Grid>

              {/* Performa Produk */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Performa Produk
                </Typography>
                {selectedProduct ? ( // Pastikan selectedProduct ada
                  <>
                    {chartType === "pie" ? (
                      <ReactApexcharts
                        type="donut"
                        height={250}
                        options={getPieChartOptions(
                          theme,
                          selectedProduct.labels,
                          pieColors,
                          // Pastikan percentage adalah number, beri fallback 0 jika undefined/null
                          selectedProduct.percentage || 0
                        )}
                        series={selectedProduct.series}
                      />
                    ) : (
                      <ReactApexcharts
                        type="bar"
                        height={250}
                        options={barChartOptions(selectedProduct.labels, selectedProduct.id)}
                        series={[
                          { name: selectedProduct.name, data: selectedProduct.series },
                        ]}
                      />
                    )}
                    <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
                      {/* Pengecekan keamanan untuk selectedProduct.percentage */}
                      {selectedProduct.percentage !== undefined && selectedProduct.percentage !== null && (
                        selectedProduct.percentage >= 100 ? (
                          <CheckCircleOutline sx={{ color: theme.palette.success.main, mr: 1 }} />
                        ) : (
                          <CloseCircleOutline sx={{ color: theme.palette.error.main, mr: 1 }} />
                        )
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Pencapaian: {
                          selectedProduct.percentage !== undefined && selectedProduct.percentage !== null
                            ? selectedProduct.percentage.toFixed(0)
                            : 'N/A' // Fallback jika percentage undefined/null
                        }%
                      </Typography>
                    </Box>

                    <Grid container justifyContent="center" mt={3}>
                      <Button
                        variant="outlined"
                        onClick={() => handleBarClick(selectedProduct.name)}
                      >
                        Lihat Detail Produk
                      </Button>
                    </Grid>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tidak ada data performa produk untuk bulan ini.
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Ringkasan */}
      <Grid item xs={12} md={3}>
        <Card
          sx={{
            height: '100%',
            // Menggunakan warna latar belakang dari tema MUI
            backgroundColor: theme.palette.background.paper, 
            // Menghapus backdropFilter karena mungkin tidak cocok untuk dark mode
            // backdropFilter: 'blur(6px)',
            // WebkitBackdropFilter: 'blur(6px)',
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
            <Box mb={2}>
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

export default CurrentMonthPerformance;
