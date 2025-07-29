// ** React Imports
import { useState, useEffect } from 'react';

// ** Next Imports
import dynamic from 'next/dynamic';

// ** MUI Imports
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
  Select, MenuItem, Grid, Card, CardContent, Box
} from "@mui/material";
import { styled, useTheme } from '@mui/material/styles';

// ** Chart Imports - Dynamically import ReactApexChart
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Helper function for currency formatting (IDR)
const formatCurrency = (value: number) => {
  return `IDR ${value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// Helper function for percentage formatting
const formatPercentage = (value: number) => {
  return `${value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
};

interface DetailItem {
  no: number | null; // null for sub-totals
  uraian: string;
  target: number;
  ytd: number;
  achievement: number; // Stored as raw number (e.g., 109.54)
  isSubTotal?: boolean; // To mark rows like "TOTAL PENDAPATAN"
  isMainCategory?: boolean; // To mark rows like "PENDAPATAN USAHA"
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


//ini masih hardcoded, nanti diambil dari API
const kmData: KMData = {
  pendapatanUsaha: [
    { no: 1, uraian: "MARGIN PEMBIAYAAN KOMERSIAL", target: 4585372400, ytd: 5022703583, achievement: 109.54 },
    { no: 2, uraian: "MARGIN PEMBIAYAAN TELCO SUPER", target: 9360835566, ytd: 9031413912, achievement: 96.48 },
    { no: 3, uraian: "PENDAPATAN NON ANGGOTA", target: 2215691161, ytd: 2302744796, achievement: 103.93 },
    { no: 4, uraian: "PENDAPATAN LAIN LAIN", target: 226636438, ytd: 347517932, achievement: 153.34 }
  ],
  totalPendapatan: { no: null, uraian: "TOTAL PENDAPATAN", target: 16388535565, ytd: 16704380224, achievement: 101.93, isSubTotal: true },
  beban: [
    { no: 1, uraian: "BEBAN USAHA", target: 15555217444, ytd: 15809601871, achievement: 98.39 },
    { no: 2, uraian: "BEBAN LAIN LAIN", target: 5402685, ytd: 4551988, achievement: 118.69 }
  ],
  totalBeban: { no: null, uraian: "TOTAL BEBAN", target: 15560620129, ytd: 15814153860, achievement: 98.40, isSubTotal: true },
  sisaHasilUsaha: { no: null, uraian: "SISA HASIL USAHA", target: 827915436, ytd: 890226364, achievement: 107.53, isSubTotal: true },
  operatingRatio: { no: null, uraian: "OPERATING RATIO", target: 94.95, ytd: 94.67, achievement: 100.29, isSubTotal: true },
  labaOperasi: { no: null, uraian: "LABA OPERASI", target: 1838077419, ytd: 1864632658, achievement: 101.44, isSubTotal: true },
  roa: { no: null, uraian: "ROA", target: 0.23, ytd: 0.25, achievement: 108.64, isSubTotal: true }
};

const KMDashboard = () => {
  const theme = useTheme();
  // Mengubah nilai awal viewMode dari "tabel" menjadi "grafik"
  const [viewMode, setViewMode] = useState<"tabel" | "grafik">("grafik"); 

  // Get current month and year dynamically
  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('id-ID', { month: 'long' }).toUpperCase();
  const currentYear = currentDate.getFullYear();

  // Data for the comparison chart (Total Pendapatan, Total Beban, Laba Operasi)
  const chartCategories = ["Total Pendapatan", "Total Beban", "Laba Operasi"];
  const chartSeries = [
    {
      name: "Target",
      data: [
        kmData.totalPendapatan.target,
        kmData.totalBeban.target,
        kmData.labaOperasi.target
      ]
    },
    {
      name: `YTD ${currentMonthName} ${currentYear}`,
      data: [
        kmData.totalPendapatan.ytd,
        kmData.totalBeban.ytd,
        kmData.labaOperasi.ytd
      ]
    }
  ];

  const chartOptions: ApexCharts.ApexOptions = {
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
      categories: chartCategories,
      title: {
        text: 'Kategori'
      }
    },
    yaxis: {
      title: {
        text: 'Nilai (IDR)'
      },
      labels: {
        formatter: (value) => formatCurrency(value)
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: (val) => formatCurrency(val)
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

  return (
    <>
      <Typography variant="h6" align="center" sx={{ mt: 2, mb: 2 }}>
        {currentMonthName} {currentYear}
      </Typography>

      <Grid container justifyContent="center" sx={{ mb: 4 }}>
        <Grid item>
          <Select value={viewMode} onChange={(e) => setViewMode(e.target.value as "tabel" | "grafik")}>
            <MenuItem value="tabel">Tabel</MenuItem>
            <MenuItem value="grafik">Grafik Perbandingan</MenuItem>
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
                <TableCell sx={{ fontWeight: "bold", background: theme.palette.grey[100], textAlign: 'right' }}>YTD {currentMonthName} {currentYear}</TableCell>
                <TableCell sx={{ fontWeight: "bold", background: theme.palette.grey[100], textAlign: 'right' }}>ACHIEVEMENT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* PENDAPATAN USAHA */}
              <TableRow>
                <TableCell colSpan={5} sx={{ fontWeight: "bold", backgroundColor: theme.palette.action.hover }}>PENDAPATAN USAHA</TableCell>
              </TableRow>
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

              {/* BEBAN */}
              <TableRow>
                <TableCell colSpan={5} sx={{ fontWeight: "bold", backgroundColor: theme.palette.action.hover }}>BEBAN</TableCell>
              </TableRow>
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

              {/* SUMMARY */}
              <TableRow>
                <TableCell colSpan={5} sx={{ fontWeight: "bold", backgroundColor: theme.palette.action.hover }}>SUMMARY</TableCell>
              </TableRow>
              <TableRow sx={{ '& > td': { fontWeight: 'bold' } }}>
                <TableCell colSpan={2}>{kmData.sisaHasilUsaha.uraian}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(kmData.sisaHasilUsaha.target)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(kmData.sisaHasilUsaha.ytd)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(kmData.sisaHasilUsaha.achievement)}</TableCell>
              </TableRow>
              <TableRow sx={{ '& > td': { fontWeight: 'bold' } }}>
                <TableCell colSpan={2}>{kmData.operatingRatio.uraian}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(kmData.operatingRatio.target)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(kmData.operatingRatio.ytd)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(kmData.operatingRatio.achievement)}</TableCell>
              </TableRow>
              <TableRow sx={{ '& > td': { fontWeight: 'bold' } }}>
                <TableCell colSpan={2}>{kmData.labaOperasi.uraian}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(kmData.labaOperasi.target)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(kmData.labaOperasi.ytd)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(kmData.labaOperasi.achievement)}</TableCell>
              </TableRow>
              <TableRow sx={{ '& > td': { fontWeight: 'bold' } }}>
                <TableCell colSpan={2}>{kmData.roa.uraian}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(kmData.roa.target)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(kmData.roa.ytd)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{formatPercentage(kmData.roa.achievement)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 4, textAlign: 'center' }}>
              Perbandingan Target vs YTD ({currentMonthName} {currentYear})
            </Typography>
            {ReactApexChart && <ReactApexChart options={chartOptions} series={chartSeries} type='bar' height={350} />}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default KMDashboard;