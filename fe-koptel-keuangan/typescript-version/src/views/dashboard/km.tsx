import { useState, useEffect, SyntheticEvent } from 'react';

// ** Next Imports
import dynamic from 'next/dynamic';

// ** MUI Imports
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
  Select, MenuItem, Grid, Card, CardContent, Box, TextField, Button, CircularProgress
} from "@mui/material";
import { useTheme } from '@mui/material/styles';

// ** Chart Imports
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ** API Import
import axios from 'axios';
import authConfig from 'src/configs/auth';

// ** Format helpers
const formatCurrency = (value: number | undefined | null) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'IDR 0';
  }
  return `IDR ${value.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
};

const formatPercentage = (value: number | undefined | null) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0.00%';
  }
  return `${value.toFixed(2)}%`;
};

interface DetailItem {
  id: number;
  no: number | null;
  uraian: string;
  kategori: string;
  target: number;
  ytd: number;
  achievement: number;
}

interface KMData {
  pendapatanUsaha: DetailItem[];
  totalPendapatan: DetailItem;
  beban: DetailItem[];
  totalBeban: DetailItem;
  sisaHasilUsaha: DetailItem;
  operatingRatio: DetailItem;
  labaOperasi: DetailItem;
  roa: DetailItem;
}

const calculateAchievement = (ytd: number, target: number): number => {
  if (target === 0) return 0;
  return (ytd / target) * 100;
};

const formatApiData = (data: DetailItem[]): KMData | null => {
  if (!data || data.length === 0) return null;

  const kmData: any = {
    pendapatanUsaha: [],
    beban: [],
    totalPendapatan: null,
    totalBeban: null,
    sisaHasilUsaha: null,
    operatingRatio: null,
    labaOperasi: null,
    roa: null,
  };

  let noPendapatan = 1;
  let noBeban = 1;

  data.forEach(item => {
    switch (item.kategori) {
      case 'pendapatan_usaha':
        kmData.pendapatanUsaha.push({...item, no: noPendapatan++});
        break;
      case 'beban':
        kmData.beban.push({...item, no: noBeban++});
        break;
      case 'total_pendapatan':
        kmData.totalPendapatan = {...item, no: null};
        break;
      case 'total_beban':
        kmData.totalBeban = {...item, no: null};
        break;
      case 'sisa_hasil_usaha':
        kmData.sisaHasilUsaha = {...item, no: null};
        break;
      case 'operating_ratio':
        kmData.operatingRatio = {...item, no: null};
        break;
      case 'laba_operasi':
        kmData.labaOperasi = {...item, no: null};
        break;
      case 'roa':
        kmData.roa = {...item, no: null};
        break;
      default:
        break;
    }
  });
  return kmData as KMData;
};

const KMDashboard = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<"tabel" | "grafik">("grafik");
  const [viewModeGraph, setViewModeGraph] = useState<"ytd" | "yoy">("ytd"); // State baru untuk grafik
  const [kmData, setKmData] = useState<KMData | null>(null);
  const [kmDataPrevYear, setKmDataPrevYear] = useState<KMData | null>(null); // State untuk data tahun sebelumnya
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('id-ID', { month: 'long' }).toUpperCase();
  const currentYear = currentDate.getFullYear();
  const prevYear = currentYear - 1;
  const ytdLabel = `YTD ${currentMonthName} ${currentYear}`;
  const ytdPrevYearLabel = `YTD ${currentMonthName} ${prevYear}`;

  const baseUrl = authConfig.meEndpoint.split('/api/auth')[0];
  const kmApiUrl = `${baseUrl}/api/km`;
  const kmApiUrlPrevYear = `${baseUrl}/api/km?year=${prevYear}`; // Endpoint untuk data tahun sebelumnya

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resCurrentYear, resPrevYear] = await Promise.all([
        axios.get(kmApiUrl),
        axios.get(kmApiUrlPrevYear),
      ]);

      const formattedData = formatApiData(resCurrentYear.data);
      const formattedPrevYearData = formatApiData(resPrevYear.data);

      setKmData(formattedData);
      setKmDataPrevYear(formattedPrevYearData);
    } catch (err: any) {
      console.error('Error fetching KM data:', err);
      setError('Gagal memuat data kinerja keuangan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: SyntheticEvent, kategori: 'pendapatanUsaha' | 'beban', index: number, field: 'target' | 'ytd') => {
    const { value } = e.target as HTMLInputElement;
    const newValue = parseFloat(value);
  
    setKmData(prevData => {
      if (!prevData) return prevData;
  
      const updatedItems = [...prevData[kategori]];
      
      const updatedItem = {
        ...updatedItems[index],
        [field]: isNaN(newValue) ? 0 : newValue,
      };

      updatedItem.achievement = calculateAchievement(updatedItem.ytd, updatedItem.target);

      updatedItems[index] = updatedItem;
  
      const updatedTotal = updatedItems.reduce((acc, item) => ({
        ...acc,
        target: acc.target + (item.target || 0),
        ytd: acc.ytd + (item.ytd || 0),
      }), { target: 0, ytd: 0 });
  
      const updatedTotalItem = kategori === 'pendapatanUsaha' ? {
        ...prevData.totalPendapatan,
        target: updatedTotal.target,
        ytd: updatedTotal.ytd,
        achievement: calculateAchievement(updatedTotal.ytd, updatedTotal.target)
      } : {
        ...prevData.totalBeban,
        target: updatedTotal.target,
        ytd: updatedTotal.ytd,
        achievement: calculateAchievement(updatedTotal.ytd, updatedTotal.target)
      };
  
      const newKmData = {
        ...prevData,
        [kategori]: updatedItems,
        [kategori === 'pendapatanUsaha' ? 'totalPendapatan' : 'totalBeban']: updatedTotalItem
      };
  
      const totalPendapatanYtd = newKmData.totalPendapatan?.ytd ?? 0;
      const totalBebanYtd = newKmData.totalBeban?.ytd ?? 0;
      const totalPendapatanTarget = newKmData.totalPendapatan?.target ?? 0;
      const totalBebanTarget = newKmData.totalBeban?.target ?? 0;

      const updatedSHU = totalPendapatanYtd - totalBebanYtd;
      const updatedTargetSHU = totalPendapatanTarget - totalBebanTarget;
      const updatedOR = (totalBebanYtd / (totalPendapatanYtd || 1)) * 100;
  
      return {
        ...newKmData,
        sisaHasilUsaha: {
          ...newKmData.sisaHasilUsaha,
          target: updatedTargetSHU,
          ytd: updatedSHU,
          achievement: calculateAchievement(updatedSHU, updatedTargetSHU)
        } as DetailItem,
        operatingRatio: {
          ...newKmData.operatingRatio,
          ytd: updatedOR,
          achievement: calculateAchievement(updatedOR, newKmData.operatingRatio?.target ?? 0)
        } as DetailItem,
      };
    });
  };

  const handleSave = async () => {
    if (!kmData) return;

    const dataToSave = [
      ...kmData.pendapatanUsaha,
      ...kmData.beban,
      kmData.totalPendapatan,
      kmData.totalBeban,
      kmData.sisaHasilUsaha,
      kmData.operatingRatio,
      kmData.labaOperasi,
      kmData.roa,
    ].filter(item => item !== null && item.id !== undefined);

    try {
      await axios.put(kmApiUrl, dataToSave);
      alert('Data berhasil disimpan!');
      fetchData();
    } catch (err) {
      console.error('Failed to save KM data:', err);
      alert('Gagal menyimpan data. Silakan coba lagi.');
    }
  };

  const createChart = (title: string, items: DetailItem[], prevYearItems: DetailItem[] = []) => {
    if (!items || items.length === 0) return null;

    const categories = items.map(item => item.uraian);
    const ytdData = items.map(item => item.ytd);
    const targetData = items.map(item => item.target);
    const prevYearData = prevYearItems.map(item => item.ytd);

    let chartSeries;
    if (viewModeGraph === "yoy" && prevYearItems.length > 0) {
        chartSeries = [
            { name: ytdLabel, data: ytdData },
            { name: ytdPrevYearLabel, data: prevYearData }
        ];
    } else {
        chartSeries = [
            { name: "Target", data: targetData },
            { name: ytdLabel, data: ytdData }
        ];
    }

    const chartOptions: ApexCharts.ApexOptions = {
      chart: { type: 'bar', height: 350, toolbar: { show: false } },
      plotOptions: { bar: { columnWidth: '55%', borderRadius: 6 } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: { categories },
      yaxis: {
        labels: { formatter: val => formatCurrency(val) }
      },
      tooltip: {
        y: { formatter: val => formatCurrency(val) }
      },
      colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.info.main],
      fill: { opacity: 1 },
      grid: {
        borderColor: theme.palette.divider,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      }
    };
    return (
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
            {ReactApexChart && <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={350} />}
            <Box sx={{ mt: 2 }}>
              {items.map((item, idx) => (
                <Typography key={idx} variant="body2">
                  <strong>{item.uraian}:</strong> {formatPercentage(item.achievement)} pencapaian
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      );
  };
  
  if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
        </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <Typography color="error">{error}</Typography>
        </Box>
    );
  }

  if (!kmData) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <Typography>Data tidak ditemukan. Pastikan data sudah ada di database.</Typography>
        </Box>
    );
  }
  
  const summaryItems = [
    kmData.sisaHasilUsaha,
    kmData.operatingRatio,
    kmData.labaOperasi,
    kmData.roa
  ].filter(item => item !== null) as DetailItem[];

  const summaryItemsPrevYear = kmDataPrevYear ? [
    kmDataPrevYear.sisaHasilUsaha,
    kmDataPrevYear.operatingRatio,
    kmDataPrevYear.labaOperasi,
    kmDataPrevYear.roa
  ].filter(item => item !== null) as DetailItem[] : [];
  
  return (
    <>
      <Typography variant="h6" align="center" sx={{ mt: 2, mb: 2 }}>
        KINERJA KEUANGAN - {currentMonthName} {currentYear}
      </Typography>

      <Grid container justifyContent="center" spacing={2} sx={{ mb: 4 }}>
        <Grid item>
          <Select value={viewMode} onChange={(e) => setViewMode(e.target.value as "tabel" | "grafik")}>
            <MenuItem value="tabel">Tabel</MenuItem>
            <MenuItem value="grafik">Grafik</MenuItem>
          </Select>
        </Grid>
        {viewMode === "grafik" && (
            <Grid item>
                <Select value={viewModeGraph} onChange={(e) => setViewModeGraph(e.target.value as "ytd" | "yoy")}>
                    <MenuItem value="ytd">YtD vs Target</MenuItem>
                    <MenuItem value="yoy">YoY (YtD vs YtD Tahun Lalu)</MenuItem>
                </Select>
            </Grid>
        )}
        <Grid item>
          <Button variant="contained" onClick={handleSave}>Simpan</Button>
        </Grid>
      </Grid>

      {viewMode === "tabel" ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={2} sx={{ fontWeight: "bold", background: theme.palette.grey[100] }}>URAIAN</TableCell>
                <TableCell sx={{ fontWeight: "bold", background: theme.palette.grey[100], textAlign: 'center' }}>TARGET</TableCell>
                <TableCell sx={{ fontWeight: "bold", background: theme.palette.grey[100], textAlign: 'center' }}>{ytdLabel}</TableCell>
                <TableCell sx={{ fontWeight: "bold", background: theme.palette.grey[100], textAlign: 'right' }}>ACHIEVEMENT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Pendapatan Usaha */}
              <TableRow><TableCell colSpan={5} sx={{ fontWeight: "bold", backgroundColor: theme.palette.action.hover }}>PENDAPATAN USAHA</TableCell></TableRow>
              {kmData.pendapatanUsaha.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{row.no}</TableCell>
                  <TableCell>{row.uraian}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <TextField
                      value={row.target ?? ''}
                      onChange={(e) => handleInputChange(e, 'pendapatanUsaha', index, 'target')}
                      type="number"
                      InputProps={{ disableUnderline: true }}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <TextField
                      value={row.ytd ?? ''}
                      onChange={(e) => handleInputChange(e, 'pendapatanUsaha', index, 'ytd')}
                      type="number"
                      InputProps={{ disableUnderline: true }}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(row.achievement)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ '& > td': { fontWeight: 'bold', backgroundColor: theme.palette.grey[200] } }}>
                <TableCell colSpan={2}>{kmData.totalPendapatan.uraian}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(kmData.totalPendapatan.target)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(kmData.totalPendapatan.ytd)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(kmData.totalPendapatan.achievement)}</TableCell>
              </TableRow>

              {/* Beban */}
              <TableRow><TableCell colSpan={5} sx={{ fontWeight: "bold", backgroundColor: theme.palette.action.hover }}>BEBAN</TableCell></TableRow>
              {kmData.beban.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{row.no}</TableCell>
                  <TableCell>{row.uraian}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <TextField
                      value={row.target ?? ''}
                      onChange={(e) => handleInputChange(e, 'beban', index, 'target')}
                      type="number"
                      InputProps={{ disableUnderline: true }}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <TextField
                      value={row.ytd ?? ''}
                      onChange={(e) => handleInputChange(e, 'beban', index, 'ytd')}
                      type="number"
                      InputProps={{ disableUnderline: true }}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(row.achievement)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ '& > td': { fontWeight: 'bold', backgroundColor: theme.palette.grey[200] } }}>
                <TableCell colSpan={2}>{kmData.totalBeban.uraian}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(kmData.totalBeban.target)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(kmData.totalBeban.ytd)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(kmData.totalBeban.achievement)}</TableCell>
              </TableRow>

              {/* Summary */}
              <TableRow><TableCell colSpan={5} sx={{ fontWeight: "bold", backgroundColor: theme.palette.action.hover }}>SUMMARY</TableCell></TableRow>
              {summaryItems.map((item) => (
                <TableRow key={item.id} sx={{ '& > td': { fontWeight: 'bold' } }}>
                  <TableCell colSpan={2}>{item.uraian}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(item.target)}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(item.ytd)}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(item.achievement)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box>
          {createChart("Pendapatan Usaha", kmData.pendapatanUsaha, kmDataPrevYear?.pendapatanUsaha)}
          {createChart("Beban", kmData.beban, kmDataPrevYear?.beban)}
          {createChart("Laba & Ringkasan", summaryItems, summaryItemsPrevYear)}
        </Box>
      )}
    </>
  );
};

export default KMDashboard;

