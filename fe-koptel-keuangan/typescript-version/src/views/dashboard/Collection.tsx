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
import CashMultiple from 'mdi-material-ui/CashMultiple'; 
import AccountCash from 'mdi-material-ui/AccountCash';
import Percent from 'mdi-material-ui/Percent'; 

// ** Chart Imports - Dynamically import ReactApexChart
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ** Axios for API calls
import axios from 'axios';

// ** Auth Config (untuk baseURL API)
import authConfig from 'src/configs/auth';

// Styled Box for Icon background
const IconBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF6B6B 0%, #EE4266 100%)', 
  borderRadius: '12px',
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
}));

interface CollectionSummary {
  totalCollectionThisYear: number;
  receivablesThisMonth: number;
  crThisMonthPercentage: number; 
}

interface MonthlyReceivablesData {
  month: string;
  receivables: number;
}

interface MonthlySalesCollectionData {
  month: string;
  salesCollection: number;
}

const CollectionDashboard = () => {
  const theme = useTheme();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }); 

  // ** State untuk data
  const [summary, setSummary] = useState<CollectionSummary | null>(null);
  const [monthlyReceivablesChartData, setMonthlyReceivablesChartData] = useState<MonthlyReceivablesData[]>([]);
  const [monthlySalesCollectionChartData, setMonthlySalesCollectionChartData] = useState<MonthlySalesCollectionData[]>([]);
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

        // --- Fetch Collection Summary ---
        // Endpoint simulasi: GET http://localhost:5001/api/sales/collection-summary
        const summaryResponse = await axios.get(`${baseUrl}/api/sales/collection-summary`, { headers });
        setSummary(summaryResponse.data);

        // --- Fetch Monthly Receivables Data ---
        // Endpoint simulasi: GET http://localhost:5001/api/sales/monthly-receivables
        const monthlyReceivablesResponse = await axios.get(`${baseUrl}/api/sales/monthly-receivables`, { headers });
        setMonthlyReceivablesChartData(monthlyReceivablesResponse.data);

        // --- Fetch Monthly Sales Collection Data ---
        // Endpoint simulasi: GET http://localhost:5001/api/sales/monthly-sales-collection
        const monthlySalesCollectionResponse = await axios.get(`${baseUrl}/api/sales/monthly-sales-collection`, { headers });
        setMonthlySalesCollectionChartData(monthlySalesCollectionResponse.data);

      } catch (err: any) {
        console.error('Error fetching collection data:', err);
        if (err.response && err.response.status === 401) {
          setError('Session expired or unauthorized. Please log in again.');
          // Optionally, trigger logout here
          // auth.logout();
        } else {
          setError('Failed to load collection data. Please try again.');
        }
        setSummary(null);
        setMonthlyReceivablesChartData([]);
        setMonthlySalesCollectionChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const monthlyReceivablesChartOptions: ApexCharts.ApexOptions = {
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
      categories: monthlyReceivablesChartData.map(data => data.month),
      title: {
        text: 'Bulan'
      }
    },
    yaxis: {
      title: {
        text: 'Receivables (IDR)'
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
    colors: [theme.palette.info.main], 
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

  const monthlyReceivablesChartSeries = [{
    name: 'Receivables',
    data: monthlyReceivablesChartData.map(data => data.receivables)
  }];

  // Options for Sales Collection Chart
  const monthlySalesCollectionChartOptions: ApexCharts.ApexOptions = {
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
      categories: monthlySalesCollectionChartData.map(data => data.month),
      title: {
        text: 'Bulan'
      }
    },
    yaxis: {
      title: {
        text: 'Total Sales Collection (IDR)'
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
    colors: [theme.palette.success.main], 
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

  const monthlySalesCollectionChartSeries = [{
    name: 'Sales Collection',
    data: monthlySalesCollectionChartData.map(data => data.salesCollection)
  }];


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6">Loading Collection Data...</Typography>
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
      {/* Collection, Receivables Bulan Ini, CR Cards */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconBox>
                <CashMultiple fontSize='large' />
              </IconBox>
              <Box sx={{ ml: 3 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Collection
                </Typography>
                <Typography variant='h5'>
                  IDR {summary?.totalCollectionThisYear.toLocaleString('id-ID') || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Total Collection Tahun Ini ({currentYear})
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconBox>
                <AccountCash fontSize='large' />
              </IconBox>
              <Box sx={{ ml: 3 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Receivables Bulan Ini
                </Typography>
                <Typography variant='h5'>
                  IDR {summary?.receivablesThisMonth.toLocaleString('id-ID') || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Total Receivables Bulan {currentMonth} ({currentYear})
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconBox>
                <Percent fontSize='large' />
              </IconBox>
              <Box sx={{ ml: 3 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  CR Bulan Ini
                </Typography>
                <Typography variant='h5' sx={{ mb: 1 }}>
                  {summary?.crThisMonthPercentage.toFixed(2) || '0.00'}%
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={summary?.crThisMonthPercentage || 0}
                  sx={{ height: 8, borderRadius: 5 }}
                />
              </Box>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Collection Rate Bulan {currentMonth} ({currentYear})
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Receivables Chart */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 4 }}>
              Receivables Chart (Bulanan {currentYear})
            </Typography>
            {ReactApexChart && <ReactApexChart options={monthlyReceivablesChartOptions} series={monthlyReceivablesChartSeries} type='bar' height={350} />}
          </CardContent>
        </Card>
      </Grid>

      {/* Sales Collection Chart */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 4 }}>
              Sales Collection Chart (Bulanan {currentYear})
            </Typography>
            {ReactApexChart && <ReactApexChart options={monthlySalesCollectionChartOptions} series={monthlySalesCollectionChartSeries} type='bar' height={350} />}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CollectionDashboard;
