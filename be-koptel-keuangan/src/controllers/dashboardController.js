exports.getTotalYearlyProgress = async (req, res) => {
  try {
    const yearNow = new Date().getFullYear();

    const produkList = [
      'Telco Super',
      'Project Financing',
      'Project Executing'
    ];

    let totalTargetTahun = 0;
    let totalRealisasiYTD = 0;

    for (const produk of produkList) {
      const targetRes = await pool.query(
        `
        SELECT COALESCE(SUM(nominal), 0) as total 
        FROM sales 
        WHERE produk = $1 AND jenis_data = 'Target' AND EXTRACT(YEAR FROM tanggal)::int = $2
        `,
        [produk, yearNow]
      );

      // Total target tahunan = target bulanan * 12
      const targetBulanan = parseFloat(targetRes.rows[0].total);
      const targetTahunan = targetBulanan * 12;
      totalTargetTahun += targetTahunan;

      // Ambil realisasi YTD
      const realisasiRes = await pool.query(
        `
        SELECT COALESCE(SUM(nominal), 0) as total 
        FROM sales 
        WHERE produk = $1 AND jenis_data = 'Realisasi' 
          AND EXTRACT(YEAR FROM tanggal)::int = $2 
          AND EXTRACT(MONTH FROM tanggal)::int <= EXTRACT(MONTH FROM CURRENT_DATE)::int
        `,
        [produk, yearNow]
      );

      const realisasiYTD = parseFloat(realisasiRes.rows[0].total);
      totalRealisasiYTD += realisasiYTD;
    }

    const pencapaianPersen =
      totalTargetTahun > 0
        ? (totalRealisasiYTD / totalTargetTahun) * 100
        : 0;

    res.json({
      year: yearNow,
      totalTargetTahun,
      totalRealisasiYTD,
      pencapaianPersen,
    });
  } catch (err) {
    console.error("Error calculating yearly progress:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
