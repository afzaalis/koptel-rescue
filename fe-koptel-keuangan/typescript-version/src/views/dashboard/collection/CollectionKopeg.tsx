import { useState, useEffect, SyntheticEvent } from 'react';
import dynamic from 'next/dynamic';

// ** MUI Imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import { styled, useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

// ** Icons Imports
import CashMultiple from 'mdi-material-ui/CashMultiple';
import AccountCash from 'mdi-material-ui/AccountCash';
import Percent from 'mdi-material-ui/Percent';
import Plus from 'mdi-material-ui/Plus';
import Close from 'mdi-material-ui/Close';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });
import axios from 'axios';
import authConfig from 'src/configs/auth';

// Styled Box for Icon background
const IconBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1A759F 0%, #30A7C3 100%)',
  borderRadius: '12px',
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
}));

// --- New Interfaces for Kopeg Debt Management ---
interface KopegDebtSummary {
  totalDebt: number;
  paidThisMonth: number;
  remainingDebtPercentage: number;
}

interface MonthlyDebtData {
  month: string;
  target: number;
  realization: number;
}

// Interface for Kopeg List (for the select input)
interface Kopeg {
  id: string;
  name: string;
}

// Interface for new debt input - **UPDATED**
interface NewDebtInput {
  kopegName: string; // Changed from kopegId to kopegName
  description: string;
  totalDebt: number;
  durationInMonths: number;
}

// Interface for payment realization input
interface PaymentRealizationInput {
  debtId: string;
  amount: number;
  paymentMonth: number; // 1-12
}

const CollectionKopeg = () => {
  const theme = useTheme();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

  // ** State for data
  const [summary, setSummary] = useState<KopegDebtSummary | null>(null);
  const [monthlyDebtChartData, setMonthlyDebtChartData] = useState<MonthlyDebtData[]>([]);
  const [kopegList, setKopegList] = useState<Kopeg[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ** State for input form
  const [openForm, setOpenForm] = useState(false);

  // **UPDATED** state initialization to use kopegName
  const [newDebt, setNewDebt] = useState<NewDebtInput>({
    kopegName: '', // Changed from kopegId
    description: '',
    totalDebt: 0,
    durationInMonths: 1,
  });

  const [paymentRealization, setPaymentRealization] = useState({
    debtId: '',
    amount: 0,
    paymentMonth: new Date().getMonth() + 1,
  });
  const [debts, setDebts] = useState<any[]>([]); // state to hold a list of current debts

  const handleFormOpen = () => setOpenForm(true);
  const handleFormClose = () => {
    setOpenForm(false);
    setNewDebt({ // Reset form when closing
      kopegName: '',
      description: '',
      totalDebt: 0,
      durationInMonths: 1,
    });
  };

  const handleNewDebtChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDebt(prev => ({
      ...prev,
      [name]: name === 'totalDebt' || name === 'durationInMonths' ? Number(value) : value
    }));
  };

  const handlePaymentRealizationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPaymentRealization(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  // --- Fetch Data from API ---
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

      // Fetch summary of Kopeg debts
      const summaryResponse = await axios.get(`${baseUrl}/api/kopeg/debt-summary`, { headers });
      setSummary(summaryResponse.data);

      // Fetch monthly debt data for the chart (Target vs Realization)
      const monthlyDebtResponse = await axios.get(`${baseUrl}/api/kopeg/monthly-debt-realization`, { headers });
      setMonthlyDebtChartData(monthlyDebtResponse.data);

      // Fetch list of Kopeg (for the select input)
      // This is now only for the dropdown in "Input Realisasi Bayar",
      // so it's still needed.
      const kopegListResponse = await axios.get(`${baseUrl}/api/kopeg/list`, { headers });
      setKopegList(kopegListResponse.data);

      // Fetch list of active debts
      const debtsResponse = await axios.get(`${baseUrl}/api/kopeg/active-debts`, { headers });
      setDebts(debtsResponse.data);

    } catch (err: any) {
      console.error('Error fetching Kopeg collection data:', err);
      if (err.response && err.response.status === 401) {
        setError('Session expired or unauthorized. Please log in again.');
      } else {
        setError('Failed to load Kopeg data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handle Form Submissions ---
  const handleAddNewDebt = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = authConfig.meEndpoint.split('/api/auth')[0];

      // **UPDATED** to send kopegName instead of kopegId
      await axios.post(`${baseUrl}/api/kopeg/debt`, newDebt, { headers });
      
      // Close form and refresh data
      handleFormClose();
      fetchData();
    } catch (err) {
      console.error('Failed to add new debt', err);
      setError('Failed to add new debt. Please try again.');
    }
  };

  const handleUpdatePaymentRealization = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      const token = window.localStorage.getItem(authConfig.storageTokenKeyName);
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = authConfig.meEndpoint.split('/api/auth')[0];
      await axios.put(`${baseUrl}/api/kopeg/debt/payment`, paymentRealization, { headers });

      // Reset form and refresh data
      setPaymentRealization({ debtId: '', amount: 0, paymentMonth: new Date().getMonth() + 1 });
      fetchData();
    } catch (err) {
      console.error('Failed to update payment realization', err);
      setError('Failed to update payment. Please try again.');
    }
  };

  // --- Chart Configuration ---
  const monthlyDebtChartOptions: ApexCharts.ApexOptions = {
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
      categories: monthlyDebtChartData.map(data => data.month),
      title: {
        text: 'Bulan'
      }
    },
    yaxis: {
      title: {
        text: 'Jumlah (IDR)'
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
    colors: [theme.palette.warning.main, theme.palette.success.main], // Target vs Realization
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

  const monthlyDebtChartSeries = [{
    name: 'Target Bayar',
    data: monthlyDebtChartData.map(data => data.target)
  }, {
    name: 'Realisasi Bayar',
    data: monthlyDebtChartData.map(data => data.realization)
  }];


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="h6">Loading Kopeg Debt Data...</Typography>
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
      {/* Cards: Total Hutang, Realisasi Bulan Ini, Sisa Hutang */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconBox>
                <CashMultiple fontSize='large' />
              </IconBox>
              <Box sx={{ ml: 3 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Total Hutang Kopeg
                </Typography>
                <Typography variant='h5'>
                  IDR {summary?.totalDebt.toLocaleString('id-ID') || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Total keseluruhan hutang Kopeg
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
                  Realisasi Bayar
                </Typography>
                <Typography variant='h5'>
                  IDR {summary?.paidThisMonth.toLocaleString('id-ID') || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Realisasi Pembayaran Bulan {currentMonth} ({currentYear})
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
                  Sisa Hutang
                </Typography>
                <Typography variant='h5' sx={{ mb: 1 }}>
                  {summary?.remainingDebtPercentage.toFixed(2) || '0.00'}%
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={summary?.remainingDebtPercentage || 0}
                  sx={{ height: 8, borderRadius: 5 }}
                />
              </Box>
            </Box>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Persentase sisa hutang dari total
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Chart: Target vs Realisasi */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 4 }}>
              Target vs Realisasi Pembayaran Hutang Kopeg (Bulanan {currentYear})
            </Typography>
            {ReactApexChart && <ReactApexChart options={monthlyDebtChartOptions} series={monthlyDebtChartSeries} type='bar' height={350} />}
          </CardContent>
        </Card>
      </Grid>

      {/* Input Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant='h6'>Input Data Hutang Kopeg</Typography>
              <Button variant='contained' startIcon={<Plus />} onClick={handleFormOpen}>
                Tambah Hutang Baru
              </Button>
            </Box>
            <form onSubmit={handleUpdatePaymentRealization}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="select-debt-label">Pilih Hutang</InputLabel>
                    <Select
                      labelId="select-debt-label"
                      id="select-debt"
                      name="debtId"
                      value={paymentRealization.debtId}
                      label="Pilih Hutang"
                      onChange={(e) => setPaymentRealization(prev => ({ ...prev, debtId: e.target.value as string }))}
                      required
                    >
                      {debts.map(debt => (
                        <MenuItem key={debt.id} value={debt.id}>
                          {debt.kopegName} - {debt.description} (Sisa: IDR {debt.remaining.toLocaleString('id-ID')})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label='Jumlah Realisasi Bayar'
                    type='number'
                    name='amount'
                    value={paymentRealization.amount}
                    onChange={handlePaymentRealizationChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    fullWidth
                    variant='contained'
                    type='submit'
                    sx={{ height: '100%' }}
                  >
                    Input Realisasi
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* Dialog for adding new debt */}
     <Dialog open={openForm} onClose={handleFormClose} fullWidth maxWidth='sm'>
        <DialogTitle sx={{ m: 0, p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h6'>Tambah Hutang Kopeg Baru</Typography>
          <IconButton onClick={handleFormClose}><Close /></IconButton>
        </DialogTitle>
        <form onSubmit={handleAddNewDebt}>
          <DialogContent dividers>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                {/* Ganti FormControl ini dengan TextField */}
                <TextField
                  fullWidth
                  label='Nama Kopeg'
                  name='kopegName' 
                  value={newDebt.kopegName}
                  onChange={handleNewDebtChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Deskripsi Hutang'
                  name='description'
                  value={newDebt.description}
                  onChange={handleNewDebtChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Jumlah Hutang (IDR)'
                  type='number'
                  name='totalDebt'
                  value={newDebt.totalDebt || ''}
                  onChange={handleNewDebtChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Target Berapa Bulan'
                  type='number'
                  name='durationInMonths'
                  value={newDebt.durationInMonths || ''}
                  onChange={handleNewDebtChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4 }}>
            <Button onClick={handleFormClose} variant='outlined'>Batal</Button>
            <Button type='submit' variant='contained'>Simpan Hutang</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Grid>
  );
};

export default CollectionKopeg;