import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { Select, MenuItem, FormControl, InputLabel, Box } from "@mui/material";
import { formatRupiah } from "../utils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const months = [
  "JANUARI", "PEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
  "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
];

interface ProjectExecutingResponse {
  target: number[];
  realisasi: number[];
  realisasiPrev: number[];
}

const ProjectExecuting = () => {
  const [target, setTarget] = useState<string[]>(Array(12).fill(""));
  const [realisasi, setRealisasi] = useState<string[]>(Array(12).fill(""));
  const [realisasiPrev, setRealisasiPrev] = useState<string[]>(Array(12).fill(""));
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const currentMonth = new Date().getMonth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/sales/project-executing");
        const data: ProjectExecutingResponse = await res.json();
        if (data?.target && data?.realisasi && data?.realisasiPrev) {
          setTarget(data.target.map(val => val.toString()));
          setRealisasi(data.realisasi.map(val => val.toString()));
          setRealisasiPrev(data.realisasiPrev.map(val => val.toString()));
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const chartSeries = [
    { name: "Target", data: target.map(val => Number(val) || 0) },
    { name: "Realisasi Tahun Ini", data: realisasi.map(val => Number(val) || 0) },
    { name: "Realisasi Tahun Lalu", data: realisasiPrev.map(val => Number(val) || 0) }
  ];

  const chartOptions: ApexOptions = {
    chart: { id: "project-executing-chart" },
    xaxis: {
      categories: months,
      labels: { style: { colors: "#222" } }
    },
    yaxis: {
      labels: {
        style: { colors: "#222" },
        formatter: (val: number) => formatRupiah(val)
      }
    },
    dataLabels: {
      enabled: true,
      style: { colors: ["#222"] },
      offsetY: chartType === "bar" ? -10 : -2,
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 2,
        color: "#fff",
        opacity: 0.9
      },
      formatter: function (val: number, opts: any) {
        if (chartType !== "bar") return formatRupiah(val);
        const { seriesIndex, dataPointIndex, w } = opts;
        if (
          w.globals.series.length > 1 &&
          w.globals.series[0][dataPointIndex] === w.globals.series[1][dataPointIndex] &&
          seriesIndex > 0
        ) {
          return "";
        }
        return formatRupiah(val);
      }
    },
    tooltip: {
      y: {
        formatter: (val: number) => formatRupiah(val)
      }
    },
    plotOptions: {
      bar: {
        dataLabels: { position: "center" }
      }
    },
    stroke: {
      curve: "smooth",
      width: chartType === "line" ? 3 : 1
    },
    legend: {
      labels: { colors: "#222" }
    }
  };

  const totalTarget = target.reduce((sum, val) => sum + (Number(val) || 0), 0);
  const totalRealisasi = realisasi.reduce((sum, val) => sum + (Number(val) || 0), 0);
  const totalRealisasiPrev = realisasiPrev.reduce((sum, val) => sum + (Number(val) || 0), 0);

  const pieOptions: ApexOptions = {
    legend: { position: "bottom", labels: { colors: "#222" } },
    tooltip: {
      y: { formatter: (val: number) => formatRupiah(val) }
    },
    dataLabels: {
      formatter: (val: number) => formatRupiah(val),
      style: { colors: ["#222"] }
    }
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <h2 style={{ color: "#222" }}>Grafik Project Executing</h2>
        <FormControl sx={{ mb: 2, minWidth: 180 }}>
          <InputLabel>Pilih Tipe Grafik</InputLabel>
          <Select
            value={chartType}
            label="Pilih Tipe Grafik"
            onChange={e => setChartType(e.target.value as "bar" | "line")}
          >
            <MenuItem value="bar">Diagram Batang</MenuItem>
            <MenuItem value="line">Diagram Garis</MenuItem>
          </Select>
        </FormControl>
        <Chart options={chartOptions} series={chartSeries} type={chartType} height={350} />
      </Grid>

      <Grid item xs={12} md={9}>
        <h2 style={{ color: "#222" }}>Perbandingan (Pie Chart)</h2>
        <Grid container spacing={2}>
          {["TOTAL", "CM", "YTD", "YOY", "EOY"].map((mode) => {
            let series: number[] = [];
            let labels: string[] = ["Target", "Realisasi Tahun Ini", "Realisasi Tahun Lalu"];

            if (mode === "CM") {
              series = [
                Number(target[currentMonth]) || 0,
                Number(realisasi[currentMonth]) || 0,
                Number(realisasiPrev[currentMonth]) || 0
              ];
            } else if (mode === "YTD") {
              const sumYTD = (arr: string[]) =>
                arr.slice(0, currentMonth + 1).reduce((acc, val) => acc + (Number(val) || 0), 0);
              series = [sumYTD(target), sumYTD(realisasi), sumYTD(realisasiPrev)];
            } else if (mode === "YOY") {
              const ytdCurr = realisasi.slice(0, currentMonth + 1).reduce((a, b) => a + (Number(b) || 0), 0);
              const ytdPrev = realisasiPrev.slice(0, currentMonth + 1).reduce((a, b) => a + (Number(b) || 0), 0);
              const growth = ytdPrev > 0 ? ((ytdCurr - ytdPrev) / ytdPrev) * 100 : 0;
              series = [ytdPrev, ytdCurr, growth];
              labels = ["Realisasi Tahun Lalu", "Realisasi Tahun Ini", "Pertumbuhan YoY (%)"];
            } else if (mode === "EOY") {
              const avg = (arr: string[]) =>
                arr.slice(0, currentMonth + 1).reduce((acc, val) => acc + (Number(val) || 0), 0) / (currentMonth + 1);
              series = [totalTarget, avg(realisasi) * 12, avg(realisasiPrev) * 12];
            } else {
              series = [totalTarget, totalRealisasi, totalRealisasiPrev];
            }

            return (
              <Grid item xs={12} sm={4} key={mode}>
                <Box>
                  <strong style={{ color: "#222" }}>
                    {{
                      TOTAL: "Total",
                      CM: "Current Month",
                      YTD: "Year to Date",
                      YOY: "Year on Year",
                      EOY: "End of Year"
                    }[mode]}
                  </strong>
                  <Chart
                    options={{ ...pieOptions, labels }}
                    series={series}
                    type="pie"
                    height={250}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
        <Box sx={{ mt: 2, color: "#222" }}>
          <strong>Total Target:</strong> {formatRupiah(totalTarget)}<br />
          <strong>Total Realisasi Tahun Ini:</strong> {formatRupiah(totalRealisasi)}<br />
          <strong>Total Realisasi Tahun Lalu:</strong> {formatRupiah(totalRealisasiPrev)}
        </Box>
      </Grid>
    </Grid>
  );
};

export default ProjectExecuting;
