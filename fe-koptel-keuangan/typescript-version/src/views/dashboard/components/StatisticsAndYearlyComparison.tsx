import React from "react";
import { Theme } from "@mui/material/styles";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Box,
} from "@mui/material";
import ReactApexcharts from "src/@core/components/react-apexcharts";
import { getLineChartOptions, formatRupiah } from "../utils";

interface StatisticsAndYearlyComparisonData {
  productPerformanceTableData: Array<{
    name: string;
    target: number;
    realisasi: number;
    pencapaian: string;
  }>;
  yearlyComparisonCategories: string[];
  yearlyComparisonSeries: Array<{ name: string; data: number[] }>;
}

interface StatisticsAndYearlyComparisonProps {
  data: StatisticsAndYearlyComparisonData;
  theme: Theme;
}

const StatisticsAndYearlyComparison = ({ data, theme }: StatisticsAndYearlyComparisonProps) => {
  const {
    productPerformanceTableData = [],
    yearlyComparisonCategories = [],
    yearlyComparisonSeries = [],
  } = data;

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 2, color: "text.primary" }}>
          Statistik & Perbandingan Tahunan
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader
            title="Statistik Produk & Perbandingan Tahun ke Tahun"
            titleTypographyProps={{ sx: { color: "text.primary" } }}
          />
          <CardContent>
            {/* TABEL */}
            <Box sx={{ overflowX: "auto", mb: 4 }}>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "text.primary", fontWeight: "bold" }}>Produk</TableCell>
                      <TableCell align="right" sx={{ color: "text.primary", fontWeight: "bold" }}>
                        Target (Thn)
                      </TableCell>
                      <TableCell align="right" sx={{ color: "text.primary", fontWeight: "bold" }}>
                        Realisasi (YTD)
                      </TableCell>
                      <TableCell align="right" sx={{ color: "text.primary", fontWeight: "bold" }}>
                        Pencapaian
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productPerformanceTableData.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{formatRupiah(row.target)}</TableCell>
                        <TableCell align="right">{formatRupiah(row.realisasi)}</TableCell>
                        <TableCell align="right">{row.pencapaian}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* GRAFIK */}
            <Typography variant="subtitle2" sx={{ mb: 2, color: "text.primary" }}>
              Grafik Perbandingan Tahun ke Tahun
            </Typography>
            <ReactApexcharts
              type="line"
              height={300}
              options={getLineChartOptions(theme, yearlyComparisonCategories, ["Total Target", "Total Realisasi"])}
              series={yearlyComparisonSeries}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatisticsAndYearlyComparison;
