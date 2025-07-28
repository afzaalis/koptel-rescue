const pool = require('../db');

exports.getProgressSummary = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const produkList = ['Project Executing', 'Telco Super', 'Project Financing'];

    let totalTarget = 0;
    let totalRealisasiYTD = 0;

    for (const produk of produkList) {
      const result = await pool.query(
        `SELECT 
           EXTRACT(MONTH FROM tanggal)::int AS bulan,
           jenis_data,
           SUM(nominal) AS total
         FROM sales
         WHERE produk = $1 AND EXTRACT(YEAR FROM tanggal)::int = $2
         GROUP BY EXTRACT(MONTH FROM tanggal), jenis_data`,
        [produk, year]
      );

      for (const row of result.rows) {
        const nominal = parseFloat(row.total);
        const bulan = row.bulan;

        if (row.jenis_data === 'Target') {
          totalTarget += nominal;
        } else if (row.jenis_data === 'Realisasi' && bulan <= month) {
          totalRealisasiYTD += nominal;
        }
      }
    }

    const percentage = totalTarget > 0 ? (totalRealisasiYTD / totalTarget) * 100 : 0;

    res.json({
      totalTarget,
      totalRealisasiYTD,
      percentage: parseFloat(percentage.toFixed(2)),
    });

  } catch (err) {
    console.error("Error in getProgressSummary:", err);
    res.status(500).json({ error: "Failed to get progress summary" });
  }
};
