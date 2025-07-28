const pool = require('../db');
exports.getProjectExecutingData = async (req, res) => {
  try {
    const yearNow = new Date().getFullYear();
    const yearPrev = yearNow - 1;

    const result = await pool.query(`
      SELECT 
        EXTRACT(MONTH FROM tanggal)::int AS bulan,
        EXTRACT(YEAR FROM tanggal)::int AS tahun,
        jenis_data,
        SUM(nominal) AS total
      FROM sales
      WHERE produk = 'Project Executing' AND EXTRACT(YEAR FROM tanggal)::int IN ($1, $2)
      GROUP BY EXTRACT(MONTH FROM tanggal), EXTRACT(YEAR FROM tanggal), jenis_data
      ORDER BY tahun, bulan
    `, [yearNow, yearPrev]);

    const data = {
      target: Array(12).fill(0),
      realisasi: Array(12).fill(0),
      realisasiPrev: Array(12).fill(0)
    };

    for (const row of result.rows) {
      const monthIdx = row.bulan - 1;
      const nominal = parseFloat(row.total);
      const year = parseInt(row.tahun);

      if (row.jenis_data === 'Target') {
        data.target[monthIdx] += nominal;
      } else {
        if (year === yearNow) {
          data.realisasi[monthIdx] += nominal;
        } else {
          data.realisasiPrev[monthIdx] += nominal;
        }
      }
    }

    const totalTarget = data.target.reduce((acc, val) => acc + val, 0);
    const totalRealisasi = data.realisasi.reduce((acc, val) => acc + val, 0);

    let pencapaianPersen = 0;
    if (totalTarget > 0) {
      pencapaianPersen = (totalRealisasi / totalTarget) * 100;
    }

    data.totalTarget = totalTarget;
    data.totalRealisasi = totalRealisasi;
    data.pencapaianPersen = pencapaianPersen;

    res.json(data);
  } catch (err) {
    console.error("Error fetching Project Executing data:", err);
    res.status(500).json({ error: "Failed to load data" });
  }
};


exports.putProjectExecutingData = async (req, res) => {
  const { target, realisasi } = req.body;

  if (!target || !realisasi || target.length !== 12 || realisasi.length !== 12) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  const year = new Date().getFullYear();

  try {
    for (let month = 1; month <= 12; month++) {
      const targetValue = parseFloat(target[month - 1]) || 0;
      const realisasiValue = parseFloat(realisasi[month - 1]) || 0;
      const tanggal = new Date(year, month - 1, 1);

      await pool.query(
        `DELETE FROM sales WHERE tanggal = $1 AND produk = 'Project Executing' AND jenis_data IN ('Target', 'Realisasi')`,
        [tanggal]
      );

      if (targetValue > 0) {
        await pool.query(
          `INSERT INTO sales (tanggal, produk, jenis_data, nominal, nama_pemasukan, nama_penginput)
           VALUES ($1, 'Project Executing', 'Target', $2, 'PE Target', 'admin')`,
          [tanggal, targetValue]
        );
      }

      if (realisasiValue > 0) {
        await pool.query(
          `INSERT INTO sales (tanggal, produk, jenis_data, nominal, nama_pemasukan, nama_penginput)
           VALUES ($1, 'Project Executing', 'Realisasi', $2, 'PE Realisasi', 'admin')`,
          [tanggal, realisasiValue]
        );
      }
    }

    res.json({ message: "Data Project Executing berhasil diperbarui" });
  } catch (err) {
    console.error("Error saving Project Executing data:", err);
    res.status(500).json({ error: "Failed to save data" });
  }
};
