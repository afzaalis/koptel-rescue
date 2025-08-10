const pool = require('../db'); 

// Get all KM metrics
const getAllMetrics = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM km_metrics ORDER BY kategori, id');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching metrics:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data metrik.', details: err.message });
  }
};

// Update KM metrics
const updateMetrics = async (req, res) => {
  const metrics = req.body; 
  
  // 1. Validasi input: pastikan req.body adalah array
  if (!Array.isArray(metrics) || metrics.length === 0) {
    return res.status(400).json({ error: 'Input tidak valid. Harap kirimkan array data metrik.' });
  }

  try {
    // 2. Gunakan transaksi untuk memastikan semua update berhasil atau tidak sama sekali
    await pool.query('BEGIN');
    
    for (const metric of metrics) {
      const { id, target, ytd, achievement } = metric;

      // 3. Validasi setiap item dalam loop
      if (!id || typeof id !== 'number') {
        console.error('Invalid ID found in metric:', metric);
        throw new Error('ID metrik tidak valid atau hilang.');
      }

      // Query untuk memperbarui data
      const queryText = `
        UPDATE km_metrics
        SET target = $1, ytd = $2, achievement = $3
        WHERE id = $4
      `;
      await pool.query(queryText, [target, ytd, achievement, id]);
    }
    
    await pool.query('COMMIT');
    res.status(200).json({ message: 'Metrics updated successfully' });
  } catch (err) {
    // 4. Rollback jika ada error, dan berikan pesan error yang lebih jelas
    await pool.query('ROLLBACK');
    console.error('Failed to update metrics:', err.message);
    res.status(500).json({ error: 'Gagal memperbarui metrik. Mohon periksa log server untuk detail.', details: err.message });
  }
};

module.exports = {
  getAllMetrics,
  updateMetrics
};