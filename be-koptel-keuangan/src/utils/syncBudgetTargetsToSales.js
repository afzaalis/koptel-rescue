const pool = require('../db');

const syncBudgetTargetsToSales = async (budgetCodeId, produkName, targetAmount, tanggal, namaPenginput) => {
    try {
        console.log(`Menyinkronkan data target untuk produk ${produkName} dengan budget code ID ${budgetCodeId}...`);
        
        await pool.query(
            `DELETE FROM sales WHERE budget_code_id = $1 AND EXTRACT(MONTH FROM tanggal) = EXTRACT(MONTH FROM $2::DATE) AND EXTRACT(YEAR FROM tanggal) = EXTRACT(YEAR FROM $2::DATE) AND jenis_data = 'Target'`,
            [budgetCodeId, tanggal]
        );

        if (targetAmount > 0) {
            await pool.query(
                `INSERT INTO sales (tanggal, nominal, jenis_data, produk, nama_pemasukan, budget_code_id, nama_penginput)
                 VALUES ($1, $2, 'Target', $3, 'Target dari Anggaran', $4, $5)`,
                [tanggal, targetAmount, produkName, budgetCodeId, namaPenginput]
            );
        }
        console.log(`Sinkronisasi data target berhasil untuk produk ${produkName}.`);
    } catch (error) {
        console.error('Error saat menyinkronkan data target:', error.message || error);
        throw error;
    }
};

module.exports = {
    syncBudgetTargetsToSales
};
