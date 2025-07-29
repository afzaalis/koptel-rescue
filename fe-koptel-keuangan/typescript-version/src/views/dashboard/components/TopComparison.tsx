import React from "react";
import { Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ArrowUpBold from "mdi-material-ui/ArrowUpBold";
import ArrowDownBold from "mdi-material-ui/ArrowDownBold";
import { formatRupiah } from "../utils";

interface TopComparisonData {
  previousRealisasi: number;
  currentRealisasi: number;
  realisasiComparisonValue: number;
  realisasiComparisonPercentage: string;
  isRealisasiIncreasing: boolean;
  nominalTargetBulanan: string;
  nominalRealisasiBulanan: string;
}

interface YearlyProgressData {
  totalTargetTahun: number;
  totalRealisasiYTD: number;
  pencapaianPersen: number;
}

interface TopComparisonProps {
  data: TopComparisonData;
  theme: Theme;
  yearlyProgress?: YearlyProgressData | null;
}

const TopComparison = ({ data, theme, yearlyProgress }: TopComparisonProps) => {
  const {
    previousRealisasi,
    currentRealisasi,
    realisasiComparisonValue,
    realisasiComparisonPercentage,
    isRealisasiIncreasing,
    nominalTargetBulanan,
    nominalRealisasiBulanan,
  } = data;

  const isUnderTarget = yearlyProgress ? yearlyProgress.pencapaianPersen < 100 : false;
  const pencapaianColor = isUnderTarget ? theme.palette.error.main : theme.palette.primary.main;

  return (
    <Grid container spacing={4} sx={{ mb: 4 }}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader
            title="Progress Hingga Bulan Ini"
            titleTypographyProps={{
              sx: {
                lineHeight: "2rem !important",
                letterSpacing: "0.15px !important",
                color: "text.primary",
              },
            }}
            action={
              yearlyProgress ? (
                <IconButton
                  size="small"
                  aria-label="yearly-progress"
                  className="card-more-options"
                  sx={{ color: pencapaianColor }}
                  style={{ marginRight: "8px", fontSize: "35px" }}
                >
                  {isUnderTarget ? (
                    <ArrowDownBold fontSize="inherit" />
                  ) : (
                    <ArrowUpBold fontSize="inherit" />
                  )}
                  {yearlyProgress.pencapaianPersen.toFixed(2)}%
                </IconButton>
              ) : null
            }
          />
          <CardContent>
            {yearlyProgress && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  Persentase Pencapaian Target Tahunan Hingga Bulan Ini:
                </Typography>
                <Typography variant="h6" sx={{ color: pencapaianColor }}>
                  {yearlyProgress.pencapaianPersen.toFixed(2)}% / 100%
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                  Target Tahunan: {formatRupiah(yearlyProgress.totalTargetTahun)}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Realisasi Hingga Saat Ini: {formatRupiah(yearlyProgress.totalRealisasiYTD)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mt: 4 }}>
          <CardHeader
            title="Realisasi Bulan Ini vs Bulan Sebelumnya"
            titleTypographyProps={{ sx: { color: "text.primary" } }}
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Realisasi Sebelumnya:
                </Typography>
                <Typography variant="h6" sx={{ color: "text.primary" }}>
                  {formatRupiah(previousRealisasi)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Realisasi Saat Ini (Bulan Ini):
                </Typography>
                <Typography variant="h6" sx={{ color: "text.primary" }}>
                  {formatRupiah(currentRealisasi)}
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", mr: 1 }}>
                Perubahan:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: isRealisasiIncreasing
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                }}
              >
                {formatRupiah(realisasiComparisonValue)} ({realisasiComparisonPercentage}%)
                {isRealisasiIncreasing ? (
                  <ArrowUpBold sx={{ verticalAlign: "middle", ml: 0.5 }} />
                ) : (
                  <ArrowDownBold sx={{ verticalAlign: "middle", ml: 0.5 }} />
                )}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Grid container direction="column" spacing={4}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Nominal Target Bulan Ini" titleTypographyProps={{ sx: { color: "text.primary" } }} />
              <CardContent>
                <Typography variant="h6" sx={{ color: "text.primary" }}>
                  {nominalTargetBulanan}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Nominal Realisasi Bulan Ini" titleTypographyProps={{ sx: { color: "text.primary" } }} />
              <CardContent>
                <Typography variant="h6" sx={{ color: "text.primary" }}>
                  {nominalRealisasiBulanan}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TopComparison;
