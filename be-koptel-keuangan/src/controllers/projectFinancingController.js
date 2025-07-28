const pool = require('../db');

exports.getProjectFinancingData = async (req, res) => {
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
            WHERE produk = 'Project Financing' AND EXTRACT(YEAR FROM tanggal)::int IN ($1, $2)
            GROUP BY EXTRACT(MONTH FROM tanggal), jenis_data, EXTRACT(YEAR FROM tanggal)
            ORDER BY bulan
        `, [yearNow, yearPrev]);

        const data = {
            target: Array(12).fill(0),
            realisasi: Array(12).fill(0),
            realisasiPrev: Array(12).fill(0)
        };

        for (const row of result.rows) {
            const monthIdx = row.bulan - 1;
            const nominal = parseFloat(row.total);

            if (row.jenis_data === 'Target') {
                data.target[monthIdx] += nominal;
            } else {
                if (row.tahun === yearNow) {
                    data.realisasi[monthIdx] += nominal;
                } else {
                    data.realisasiPrev[monthIdx] += nominal;
                }
            }
        }

        res.json(data);
    } catch (err) {
        console.error("Error fetching Telco Super data:", err);
        res.status(500).json({ error: "Failed to load data" });
    }
};

// Simpan data Target & Realisasi
exports.insertRealisasiFinancing = async (req, res) => {
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

            if (targetValue > 0) {
                await pool.query(
                    `INSERT INTO sales (tanggal, produk, jenis_data, nominal, nama_pemasukan, nama_penginput)
                     VALUES ($1, 'Super', 'Target', $2, 'Telco Super Target', 'admin')`,
                    [tanggal, targetValue]
                );
            }

            if (realisasiValue > 0) {
                await pool.query(
                    `INSERT INTO sales (tanggal, produk, jenis_data, nominal, nama_pemasukan, nama_penginput)
                     VALUES ($1, 'Super', 'Realisasi', $2, 'Telco Super Realisasi', 'admin')`,
                    [tanggal, realisasiValue]
                );
            }
        }

        res.json({ message: "Data Telco Super berhasil disimpan" });
    } catch (err) {
        console.error("Error saving Telco Super data:", err);
        res.status(500).json({ error: "Failed to save data" });
    }
};


exports.putFinancing = async (req, res) => {
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
                `DELETE FROM sales WHERE tanggal = $1 AND produk = 'Super' AND jenis_data IN ('Target', 'Realisasi')`,
                [tanggal]
            );

            if (targetValue > 0) {
                await pool.query(
                    `INSERT INTO sales (tanggal, produk, jenis_data, nominal, nama_pemasukan, nama_penginput)
                     VALUES ($1, 'Super', 'Target', $2, 'Telco Super Target', 'admin')`,
                    [tanggal, targetValue]
                );
            }

            if (realisasiValue > 0) {
                await pool.query(
                    `INSERT INTO sales (tanggal, produk, jenis_data, nominal, nama_pemasukan, nama_penginput)
                     VALUES ($1, 'Super', 'Realisasi', $2, 'Telco Super Realisasi', 'admin')`,
                    [tanggal, realisasiValue]
                );
            }
        }

        res.json({ message: "Data Telco Super berhasil diperbarui" });
    } catch (err) {
        console.error("Error updating Telco Super data:", err);
        res.status(500).json({ error: "Failed to update data" });
    }
};