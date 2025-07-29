import { Theme } from "@mui/material/styles";
import { ApexOptions } from "apexcharts";

// === FORMATTER ===

/**
 * Format angka ke dalam bentuk singkat versi Indonesia (Jt, M, Rb)
 * @example 1200000 => "1.2Jt"
 */
export const formatAngkaID = (val: number): string => {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + "M";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "Jt";
  if (val >= 1_000) return (val / 1_000).toFixed(1) + "Rb";
  return val.toString();
};

/**
 * Format angka pendek dalam notasi internasional (K, JT, M)
 * @example 1200000 => "1.2 JT"
 */
export const formatAngkaPendek = (val: number): string => {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} M`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} JT`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)} K`;
  return val.toString();
};

/**
 * Format angka ke dalam format Rupiah
 * @example 1200000 => "Rp1.200.000"
 */
export const formatRupiah = (amount: number | string): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return "N/A";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numAmount);
};

// === CHART OPTIONS ===

/**
 * Konfigurasi Pie/Donut Chart Apex
 */
export const getPieChartOptions = (
  theme: Theme,
  labels: string[],
  colors: string[],
  customTotalPercentage?: number,
  tooltipFormatter?: (val: number) => string
): ApexOptions => ({
  chart: {
    type: "donut",
    parentHeightOffset: 0,
    toolbar: { show: false },
  },
  labels,
  colors,
  legend: {
    show: true,
    position: "bottom",
    labels: { colors: theme.palette.text.secondary },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number, opts) =>
      `${labels[opts.seriesIndex]}: ${formatAngkaPendek(opts.w.config.series[opts.seriesIndex])}`,
    style: {
      fontSize: "13px",
      fontWeight: 500,
      colors: [theme.palette.text.primary],
    },
  },
  tooltip: {
    y: {
      formatter: tooltipFormatter ?? ((val) => formatAngkaPendek(val)),
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          name: { show: true },
          value: {
            show: true,
            formatter: (val: string) => `${parseFloat(val).toFixed(1)}%`,
          },
          total: {
            show: true,
            label: customTotalPercentage ? "Capai" : "Total",
            formatter: customTotalPercentage
              ? () => `${customTotalPercentage.toFixed(1)}%`
              : (w: any) => {
                  const sum = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                  return `${formatAngkaPendek(sum)}`;
                },
          },
        },
      },
    },
  },
  responsive: [
    {
      breakpoint: theme.breakpoints.values.md,
      options: {
        chart: {
          width: "100%",
        },
        legend: {
          position: "bottom",
        },
      },
    },
  ],
});

/**
 * Konfigurasi Bar Chart Horizontal Apex
 */
export const getBarChartOptions = (
  theme: Theme,
  categories: string[],
  colors: string[]
): ApexOptions => ({
  chart: {
    type: "bar",
    parentHeightOffset: 0,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 5,
      dataLabels: {
        position: "top",
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number | string) => formatAngkaPendek(Number(val)),
    offsetX: 10,
    style: {
      fontSize: "12px",
      colors: colors.map((color) =>
        color === theme.palette.error.main ? "#fff" : theme.palette.text.primary
      ),
    },
  },
  xaxis: {
    categories,
    labels: {
      formatter: (value: number | string) => formatAngkaPendek(Number(value)),
      style: { colors: theme.palette.text.secondary },
    },
  },
  yaxis: {
    labels: {
      style: { colors: theme.palette.text.secondary },
    },
  },
  grid: {
    borderColor: theme.palette.divider,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } },
  },
  colors,
});

/**
 * Konfigurasi Line Chart Apex
 */
export const getLineChartOptions = (
  theme: Theme,
  categories: string[],
  seriesName: string[]
): ApexOptions => ({
  chart: {
    type: "line",
    parentHeightOffset: 0,
    toolbar: { show: false },
  },
  stroke: {
    curve: "smooth",
    width: 2,
    colors: [theme.palette.primary.main, theme.palette.success.main],
  },
  xaxis: {
    categories,
    labels: {
      style: { colors: theme.palette.text.secondary },
    },
  },
  yaxis: {
    labels: {
      formatter: (value: number) => formatAngkaPendek(value),
      style: { colors: theme.palette.text.secondary },
    },
  },
  legend: {
    show: true,
    position: "top",
    horizontalAlign: "right",
    labels: {
      colors: theme.palette.text.secondary,
    },
  },
  tooltip: {
    y: {
      formatter: (val: number) => formatAngkaPendek(val),
    },
  },
  grid: {
    borderColor: theme.palette.divider,
    strokeDashArray: 7,
  },
});
