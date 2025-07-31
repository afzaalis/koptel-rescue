// ** React Imports
import { useState } from 'react';

// ** Next Imports
import dynamic from 'next/dynamic';

// ** MUI Imports
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
  Select, MenuItem, Grid, Card, CardContent, Box
} from "@mui/material";
import { useTheme } from '@mui/material/styles';

// ** Chart Imports
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ** Format helpers
const formatCurrency = (value: number) => `IDR ${value.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

interface DetailItem {
  no: number | null;
  uraian: string;
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

const kmData: KMData = {
  pendapatanUsaha: [
    { no: 1, uraian: "MARGIN PEMBIAYAAN KOMERSIAL", target: 4585372400, ytd: 5022703583, achievement: 109.54 },
    { no: 2, uraian: "MARGIN PEMBIAYAAN TELCO SUPER", target: 9360835566, ytd: 9031413912, achievement: 96.48 },
    { no: 3, uraian: "PENDAPATAN NON ANGGOTA", target: 2215691161, ytd: 2302744796, achievement: 103.93 },
    { no: 4, uraian: "PENDAPATAN LAIN LAIN", target: 226636438, ytd: 347517932, achievement: 153.34 }
  ],
  totalPendapatan: { no: null, uraian: "TOTAL PENDAPATAN", target: 16388535565, ytd: 16704380224, achievement: 101.93 },
  beban: [
    { no: 1, uraian: "BEBAN USAHA", target: 15555217444, ytd: 15809601871, achievement: 98.39 },
    { no: 2, uraian: "BEBAN LAIN LAIN", target: 5402685, ytd: 4551988, achievement: 118.69 }
  ],
  totalBeban: { no: null, uraian: "TOTAL BEBAN", target: 15560620129, ytd: 15814153860, achievement: 98.40 },
  sisaHasilUsaha: { no: null, uraian: "SISA HASIL USAHA", target: 827915436, ytd: 890226364, achievement: 107.53 },
  operatingRatio: { no: null, uraian: "OPERATING RATIO", target: 94.95, ytd: 94.67, achievement: 100.29 },
  labaOperasi: { no: null, uraian: "LABA OPERASI", target: 1838077419, ytd: 1864632658, achievement: 101.44 },
  roa: { no: null, uraian: "ROA", target: 0.23, ytd: 0.25, achievement: 108.64 }
};

const KMDashboard = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<"tabel" | "grafik">("grafik");

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('id-ID', { month: 'long' }).toUpperCase();
  const currentYear = currentDate.getFullYear();
  const ytdLabel = `YTD ${currentMonthName} ${currentYear}`;

  const createChart = (title: string, items: DetailItem[]) => {
    const categories = items.map(item => item.uraian);
    const chartSeries = [
      { name: "Target", data: items.map(item => item.target) },
      { name: ytdLabel, data: items.map(item => item.ytd) }
    ];

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
      colors: [theme.palette.primary.main, theme.palette.secondary.main],
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
          <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={350} />
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

  return (
    <>
      <Typography variant="h6" align="center" sx={{ mt: 2, mb: 2 }}>
        KINERJA KEUANGAN - {currentMonthName} {currentYear}
      </Typography>

      <Grid container justifyContent="center" sx={{ mb: 4 }}>
        <Grid item>
          <Select value={viewMode} onChange={(e) => setViewMode(e.target.value as "tabel" | "grafik")}>
            <MenuItem value="tabel">Tabel</MenuItem>
            <MenuItem value="grafik">Grafik</MenuItem>
          </Select>
        </Grid>
      </Grid>

      {viewMode === "tabel" ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={2} sx={{ fontWeight: "bold", background: theme.palette.grey[100] }}>URAIAN</TableCell>
                <TableCell sx={{ fontWeight: "bold", background: theme.palette.grey[100], textAlign: 'right' }}>TARGET</TableCell>
                <TableCell sx={{ fontWeight: "bold", background: theme.palette.grey[100], textAlign: 'right' }}>{ytdLabel}</TableCell>
                <TableCell sx={{ fontWeight: "bold", background: theme.palette.grey[100], textAlign: 'right' }}>ACHIEVEMENT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Pendapatan Usaha */}
              <TableRow><TableCell colSpan={5} sx={{ fontWeight: "bold", backgroundColor: theme.palette.action.hover }}>PENDAPATAN USAHA</TableCell></TableRow>
              {kmData.pendapatanUsaha.map(row => (
                <TableRow key={row.no}>
                  <TableCell>{row.no}</TableCell>
                  <TableCell>{row.uraian}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(row.target)}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(row.ytd)}</TableCell>
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
              {kmData.beban.map(row => (
                <TableRow key={row.no}>
                  <TableCell>{row.no}</TableCell>
                  <TableCell>{row.uraian}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(row.target)}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(row.ytd)}</TableCell>
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
              {[kmData.sisaHasilUsaha, kmData.operatingRatio, kmData.labaOperasi, kmData.roa].map((item, i) => (
                <TableRow key={i} sx={{ '& > td': { fontWeight: 'bold' } }}>
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
          {createChart("Pendapatan Usaha", kmData.pendapatanUsaha)}
          {createChart("Beban", kmData.beban)}
          {createChart("Laba & Ringkasan", [
            kmData.labaOperasi,
            kmData.sisaHasilUsaha,
            { ...kmData.roa, target: kmData.roa.target, ytd: kmData.roa.ytd }
          ])}
        </Box>
      )}
    </>
  );
};

export default KMDashboard;