import { useState, useEffect } from 'react';

// ** Next Imports
import dynamic from 'next/dynamic';

// ** MUI Imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { styled, useTheme } from '@mui/material/styles';

// ** Icons Imports
import CashMinus from 'mdi-material-ui/CashMinus'; // Icon untuk Expenses
import CalendarMonth from 'mdi-material-ui/CalendarMonth'; // Icon untuk Expenses Bulan Ini

// ** Chart Imports - Dynamically import ReactApexChart
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ** Axios for API calls
import axios from 'axios';

// ** Auth Config (untuk baseURL API)
import authConfig from 'src/configs/auth';

// Styled Box for Icon background
const IconBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 100%)', // Warna baru untuk Expenses
  borderRadius: '12px',
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
}));

interface ExpensesSummary {
  expensesYTD: number;
  expensesCM: number;
}

// Perubahan di sini: Interface untuk data bulanan sekarang mencakup tahun ini dan tahun sebelumnya
interface MonthlyExpensesComparisonData {
  month: string;
  currentYearExpenses: number;
  previousYearExpenses: number;
}

const UtilityExpensesDashboard = () => {
  const theme = useTheme();

  // Dapatkan tahun saat ini
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1; // Mendapatkan tahun sebelumnya
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }); // Nama bulan saat ini

  // ** State untuk data
  const [summary, setSummary] = useState<ExpensesSummary | null>(null);
  // Perubahan di sini: Menggunakan tipe baru untuk data grafik bulanan
  const [monthlyExpensesChartData, setMonthlyExpensesChartData] = useState<MonthlyExpensesComparisonData[]>([]);
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

        // --- Fetch Expenses Summary ---
        const summaryResponse = await axios.get(`${baseUrl}/api/sales/expenses-summary`, { headers });
        setSummary(summaryResponse.data);

        // --- Fetch Monthly Expenses Comparison Data ---
        // Endpoint simulasi: GET http://localhost:5001/api/sales/monthly-expenses-comparison
        // Perubahan di sini: Menggunakan endpoint baru untuk perbandingan bulanan
        const monthlyComparisonResponse = await axios.get(`${baseUrl}/api/sales/monthly-expenses-comparison`, { headers });
        setMonthlyExpensesChartData(monthlyComparisonResponse.data);

      } catch (err: any) {
        console.error('Error fetching expenses data:', err);
        if (err.response && err.response.status === 401) {
          setError('Session expired or unauthorized. Please log in again.');
          // Optionally, trigger logout here
          // auth.logout();
        } else {
          setError('Failed to load expenses data. Please try again.');
        }
        setSummary(null);
        setMonthlyExpensesChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Options for Monthly Expenses Chart (Year-on-Year Comparison)
  const monthlyExpensesChartOptions: ApexCharts.ApexOptions = {
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
      categories: monthlyExpensesChartData.map(data => data.month),
      title: {
        text: 'Bulan'
      }
    },
    yaxis: {
      title: {
        text: 'Total Expenses (IDR)'
      },
      labels: {
        // Formatting angka dengan pemisah ribuan (titik) dan dua desimal
        formatter: (value) => `IDR ${value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        // Formatting angka dengan pemisah ribuan (titik) dan dua desimal di tooltip
        formatter: (val) => `IDR ${val.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main], // Warna untuk tahun ini dan tahun sebelumnya
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

  const monthlyExpensesChartSeries = [{
    name: `Tahun Ini (${currentYear})`,
    data: monthlyExpensesChartData.map(data => data.currentYearExpenses)
  }, {
    name: `Tahun Sebelumnya (${previousYear})`,
    data: monthlyExpensesChartData.map(data => data.previousYearExpenses)
  }];


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6">Loading Utility & Expenses Data...</Typography>
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
      {/* Expenses YTD, Expenses CM Cards */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconBox>
                <CashMinus fontSize='large' />
              </IconBox>
              <Box sx={{ ml: 3 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Expenses YTD
                </Typography>
                <Typography variant='h5'>
                  IDR {summary?.expensesYTD.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Total Expenses Tahun Ini ({currentYear})
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconBox>
                <CalendarMonth fontSize='large' />
              </IconBox>
              <Box sx={{ ml: 3 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Expenses CM
                </Typography>
                <Typography variant='h5'>
                  IDR {summary?.expensesCM.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Total Expenses Bulan {currentMonth} ({currentYear})
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Monthly Expenses Chart (Year-on-Year Comparison) */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 4 }}>
              Monthly Expenses Chart (Tahun Ini ({currentYear}) vs Tahun Sebelumnya ({previousYear}))
            </Typography>
            {ReactApexChart && <ReactApexChart options={monthlyExpensesChartOptions} series={monthlyExpensesChartSeries} type='bar' height={350} />}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default UtilityExpensesDashboard;
