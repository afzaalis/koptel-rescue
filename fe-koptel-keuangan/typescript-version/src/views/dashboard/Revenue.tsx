// ** React Imports
import { useState, useEffect } from 'react';

// ** Next Imports
import dynamic from 'next/dynamic';

// ** MUI Imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import { styled, useTheme } from '@mui/material/styles';

// ** Icons Imports
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd';
import Target from 'mdi-material-ui/Target';
import ChartLineVariant from 'mdi-material-ui/ChartLineVariant';

// ** Chart Imports - Dynamically import ReactApexChart
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ** Axios for API calls
import axios from 'axios';

// ** Auth Config (untuk baseURL API)
import authConfig from 'src/configs/auth';

// Styled Box for Icon background
const IconBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)',
  borderRadius: '12px',
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
}));

interface RevenueSummary {
  totalRevenue: number;
  totalTarget: number;
  targetAchievement: number; // Percentage
}

interface MonthlyData {
  month: string;
  realization: number; // Now storing actual realization value
  // growthRate: number; // No longer needed for Y-axis, but can be kept for tooltip if desired
}

interface ProductData {
  productName: string;
  currentYearRevenue: number;
  previousYearRevenue: number;
}

const RevenueDashboard = () => {
  const theme = useTheme();

  // Dapatkan tahun saat ini
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // ** State untuk data
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyData[]>([]);
  const [productChartData, setProductData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`
        };
        const baseUrl = authConfig.meEndpoint.split('/api/auth')[0];

        // --- Fetch Revenue Summary ---
        const summaryResponse = await axios.get(`${baseUrl}/api/sales/revenue-summary`, { headers });
        setSummary(summaryResponse.data);

        // --- Fetch Monthly Realization Data ---
        const monthlyResponse = await axios.get(`${baseUrl}/api/sales/monthly-realization`, { headers });
        // No need to calculate growth rate here if Y-axis is nominal value
        setMonthlyChartData(monthlyResponse.data);

        // --- Fetch Product Comparison Data ---
        const productResponse = await axios.get(`${baseUrl}/api/sales/product-comparison`, { headers });
        setProductData(productResponse.data);

      } catch (err: any) {
        console.error('Error fetching revenue data:', err);
        if (err.response && err.response.status === 401) {
          setError('Session expired or unauthorized. Please log in again.');
          // Optionally, trigger logout here
          // auth.logout();
        } else {
          setError('Failed to load revenue data. Please try again.');
        }
        setSummary(null);
        setMonthlyChartData([]);
        setProductData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Options for Realisasi Target Chart (Monthly Realization Value)
  const monthlyChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 8,
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: monthlyChartData.map(data => data.month),
      title: {
        text: 'Bulan'
      }
    },
    yaxis: {
      title: {
        text: 'Realisasi (IDR)' // Mengubah label sumbu Y
      },
      labels: {
        formatter: (value) => `IDR ${value.toLocaleString('id-ID')}` // Formatting angka
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: (val) => `IDR ${val.toLocaleString('id-ID')}` // Formatting tooltip
      }
    },
    colors: [theme.palette.primary.main],
    grid: {
      borderColor: theme.palette.divider,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    }
  };

  const monthlyChartSeries = [{
    name: 'Realisasi', // Mengubah nama series
    data: monthlyChartData.map(data => data.realization) // Menggunakan nilai realisasi
  }];

  // Options for Tahun Ini vs Tahun Sebelumnya Chart (Product Comparison)
  const productChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 8,
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: productChartData.map(data => data.productName),
      title: {
        text: 'Produk'
      }
    },
    yaxis: {
      title: {
        text: 'Pendapatan (IDR)'
      },
      labels: {
        formatter: (value) => `IDR ${value.toLocaleString('id-ID')}`
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: (val) => `IDR ${val.toLocaleString('id-ID')}`
      }
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
    grid: {
      borderColor: theme.palette.divider,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    }
  };

  const productChartSeries = [{
    name: `Tahun Ini (${currentYear})`, // Menampilkan tahun saat ini
    data: productChartData.map(data => data.currentYearRevenue)
  }, {
    name: `Tahun Sebelumnya (${previousYear})`, // Menampilkan tahun sebelumnya
    data: productChartData.map(data => data.previousYearRevenue)
  }];


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6">Loading Revenue Data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={6}>
      {/* Revenue, Target Achievement, Total Target Cards */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconBox>
                <CurrencyUsd fontSize='large' />
              </IconBox>
              <Box sx={{ ml: 3 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Revenue
                </Typography>
                <Typography variant='h5'>
                  IDR {summary?.totalRevenue.toLocaleString('id-ID') || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Total Realisasi Pendapatan Tahun Ini ({currentYear})
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconBox>
                <Target fontSize='large' />
              </IconBox>
              <Box sx={{ ml: 3 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Target Achievement
                </Typography>
                <Typography variant='h5' sx={{ mb: 1 }}>
                  {summary?.targetAchievement.toFixed(2) || '0.00'}%
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={summary?.targetAchievement || 0}
                  sx={{ height: 8, borderRadius: 5 }}
                />
              </Box>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Pencapaian Target Pendapatan Tahun Ini ({currentYear})
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconBox>
                <ChartLineVariant fontSize='large' />
              </IconBox>
              <Box sx={{ ml: 3 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Total Target
                </Typography>
                <Typography variant='h5'>
                  IDR {summary?.totalTarget.toLocaleString('id-ID') || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Target Pendapatan Keseluruhan Tahun Ini ({currentYear})
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Realisasi Target Chart (Monthly Realization Value) */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 4 }}>
              Realisasi Target Chart (Nilai Realisasi Bulanan {currentYear})
            </Typography>
            {ReactApexChart && <ReactApexChart options={monthlyChartOptions} series={monthlyChartSeries} type='bar' height={350} />}
          </CardContent>
        </Card>
      </Grid>

      {/* Tahun Ini vs Tahun Sebelumnya Chart (Product Comparison) */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 4 }}>
              Pendapatan Tahun Ini ({currentYear}) vs Tahun Sebelumnya ({previousYear}) (per Produk)
            </Typography>
            {ReactApexChart && <ReactApexChart options={productChartOptions} series={productChartSeries} type='bar' height={350} />}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default RevenueDashboard;