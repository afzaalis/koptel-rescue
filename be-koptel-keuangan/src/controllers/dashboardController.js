const pool = require('../db');

exports.getTotalYearlyProgress = async (req, res) => {
  try {
    const yearNow = new Date().getFullYear();

    // Lebih baik mengambil daftar produk secara dinamis dari tabel `budget_codes`
    // atau tabel `product_contributions` daripada hardcode
    const produkListResult = await pool.query(
      `
      SELECT DISTINCT name as produk
      FROM budget_codes
      WHERE type = 'REVENUE'
      ORDER BY produk
      `
    );
    const produkList = produkListResult.rows.map(row => row.produk);
    
    let totalTargetTahun = 0;
    let totalRealisasiYTD = 0;

    for (const produk of produkList) {
      // Ambil total target untuk produk ini di tahun ini
      const targetRes = await pool.query(
        `
        SELECT COALESCE(SUM(nominal), 0) as total
        FROM sales
        WHERE produk = $1 AND jenis_data = 'Target' AND EXTRACT(YEAR FROM tanggal)::int = $2
        `,
        [produk, yearNow]
      );

      // --- PERBAIKAN LOGIKA PENGHITUNGAN DI SINI ---
      // Nilai dari query sudah merupakan total target tahunan
      // Jadi, tidak perlu lagi dikalikan 12.
      const targetTahunan = parseFloat(targetRes.rows[0].total);
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
      pencapaianPersen: pencapaianPersen.toFixed(2),
    });
  } catch (err) {
    console.error("Error calculating yearly progress:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
