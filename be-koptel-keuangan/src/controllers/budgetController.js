const pool = require('../db');

const getMonthlyAchievementFromDbProduct = ({ id, name, target, realisasi }) => {
    const achievement = target === 0 ? 0 : parseFloat(((realisasi / target) * 100).toFixed(2));
    const remainingTarget = Math.max(target - realisasi, 0); 

    return {
        id,
        name,
        targetBulanIni: target,
        realisasiBulanIni: realisasi,
        pencapaian: `${achievement}%`,
        isAchieved: realisasi >= target,
        percentage: achievement, 
        series: [realisasi, remainingTarget],
        labels: ['Realisasi', 'Sisa Target'], 
    };
};


const getAggregatedSalesData = async (year) => {
    try {
        const result = await pool.query(`
            SELECT
                EXTRACT(MONTH FROM tanggal)::int AS bulan,
                produk,
                jenis_data,
                SUM(nominal)::float AS total
            FROM sales
            WHERE EXTRACT(YEAR FROM tanggal)::int = $1 AND produk IS NOT NULL
            GROUP BY bulan, produk, jenis_data
            ORDER BY bulan
        `, [year]);

        const dataByMonth = Array(12).fill(null).map(() => ({
            totalTarget: 0,
            totalRealisasi: 0,
            products: []
        }));

        const productMap = {};

        for (const row of result.rows) {
            const monthIdx = row.bulan - 1;
            const nominal = row.total;
            const produk = row.produk;

            if (!productMap[produk]) {
                productMap[produk] = Array(12).fill(null).map(() => ({ target: 0, realisasi: 0 }));
            }

            if (row.jenis_data === 'Target') {
                dataByMonth[monthIdx].totalTarget += nominal;
                productMap[produk][monthIdx].target = nominal;
            } else if (row.jenis_data === 'Realisasi') {
                dataByMonth[monthIdx].totalRealisasi += nominal;
                productMap[produk][monthIdx].realisasi = nominal;
            }
        }

        dataByMonth.forEach((monthData, monthIdx) => {
            monthData.products = Object.entries(productMap).map(([name, values], i) => {
                return {
                    id: i + 1,
                    name,
                    targetBulanIni: values[monthIdx].target || 0,
                    realisasiBulanIni: values[monthIdx].realisasi || 0,
                };
            });
        });

        return {
            dataByMonth,
            productList: Object.keys(productMap).map((name, i) => ({
                id: i + 1,
                name,
                targetTahunanFull: productMap[name].reduce((sum, val) => sum + val.target, 0)
            }))
        };
    } catch (error) {
        console.error('Error in getAggregatedSalesData:', error.message || error);
        throw error; // Re-throw to be caught by calling function
    }
};

const calculateDashboardData = async () => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const { dataByMonth: salesDataByMonth, productList } = await getAggregatedSalesData(currentYear);

    const currentMonth = salesDataByMonth[currentMonthIndex];
    const previousMonth = salesDataByMonth[currentMonthIndex - 1] || { totalRealisasi: 0 };

    const topComparison = {
        previousRealisasi: previousMonth.totalRealisasi,
        currentRealisasi: currentMonth.totalRealisasi,
        realisasiComparisonValue: currentMonth.totalRealisasi - previousMonth.totalRealisasi,
        realisasiComparisonPercentage: previousMonth.totalRealisasi === 0
            ? "0%"
            : `${(((currentMonth.totalRealisasi - previousMonth.totalRealisasi) / previousMonth.totalRealisasi) * 100).toFixed(2)}%`,
        isRealisasiIncreasing: currentMonth.totalRealisasi >= previousMonth.totalRealisasi,
        nominalTargetBulanan: currentMonth.totalTarget.toLocaleString(),
        nominalRealisasiBulanan: currentMonth.totalRealisasi.toLocaleString()
    };

    const currentMonthPerformance = {
        totalTarget: currentMonth.totalTarget,
        totalRealisasi: currentMonth.totalRealisasi,
        pieTargetBulanIniSeries: [currentMonth.totalRealisasi, Math.max(currentMonth.totalTarget - currentMonth.totalRealisasi, 0)],
        pieTargetBulanIniLabels: ['Realisasi', ' Sisa Target'],
        realisasiBulanIniPercentage: currentMonth.totalTarget === 0
            ? 0
            : parseFloat(((currentMonth.totalRealisasi / currentMonth.totalTarget) * 100).toFixed(2)),
        productMonthlyAchievements: currentMonth.products.map(p => {
            const target = p.targetBulanIni || 0;
            const realisasi = p.realisasiBulanIni || 0;
            return getMonthlyAchievementFromDbProduct({
                id: p.id,
                name: p.name,
                target,
                realisasi
            });
        })
    };

    const ytdTarget = salesDataByMonth.reduce((sum, item) => sum + item.totalTarget, 0);
    const ytdRealisasi = salesDataByMonth.reduce((sum, item) => sum + item.totalRealisasi, 0);

    const ytdPerformance = {
        totalTarget: ytdTarget,
        totalRealisasi: ytdRealisasi,
        pieTargetYTDSeries: [ytdRealisasi, Math.max(ytdTarget - ytdRealisasi, 0)],
        pieTargetYTDLabels: ['Realisasi', 'Sisa Target'],
        realisasiYTDPercentage: ytdTarget === 0 ? 0 : parseFloat(((ytdRealisasi / ytdTarget) * 100).toFixed(2)),
        productDistributionYTDSeries: productList.map(p => p.targetTahunanFull),
        productDistributionYTDLabels: productList.map(p => p.name)
    };

    const projectionCategories = Array.from({ length: 12 }, (_, i) =>
        new Date(currentYear, i).toLocaleString('default', { month: 'short' })
    );

    const projectedTarget = salesDataByMonth.map(item => item.totalTarget);
    const projectedRealisasi = salesDataByMonth.map(item => item.totalRealisasi);
    const projectedTotalRealisasi = projectedRealisasi.reduce((sum, val) => sum + val, 0);

    const yearlyProjection = {
        currentYear,
        realisasiTahunIniPercentage: ytdTarget === 0 ? 0 : parseFloat(((projectedTotalRealisasi / ytdTarget) * 100).toFixed(2)),
        productFullYearAchievement: currentMonth.products.map(p => ({
            name: p.name,
            percentage: p.targetBulanIni === 0 ? 0 : parseFloat(((p.realisasiBulanIni / p.targetBulanIni) * 100).toFixed(2))
        })),
        productFullYearCategories: currentMonth.products.map(p => p.name),
        productFullYearSeries: [{
            name: "Achievement",
            data: currentMonth.products.map(p =>
                p.targetBulanIni === 0 ? 0 : parseFloat(((p.realisasiBulanIni / p.targetBulanIni) * 100).toFixed(2))
            )
        }],
        projectionCategories,
        projectionChartSeries: [
            { name: "Target", data: projectedTarget },
            { name: "Realisasi", data: projectedRealisasi }
        ],
        projectedTotalRealisasi
    };

    const productPerformanceTableData = currentMonth.products.map(p => ({
        name: p.name,
        target: p.targetBulanIni,
        realisasi: p.realisasiBulanIni,
        pencapaian: p.targetBulanIni === 0 ? "0%" : `${((p.realisasiBulanIni / p.targetBulanIni) * 100).toFixed(2)}%`
    }));

    const statisticsAndYearlyComparison = {
        productPerformanceTableData,
        yearlyComparisonCategories: projectionCategories,
        yearlyComparisonSeries: [
            { name: "Target", data: projectedTarget },
            { name: "Realisasi", data: projectedRealisasi }
        ]
    };

    return {
        topComparison,
        currentMonthPerformance,
        ytdPerformance,
        yearlyProjection,
        statisticsAndYearlyComparison
    };
};

exports.getDashboardData = async (req, res) => {
    try {
        const dashboardData = await calculateDashboardData();
        res.json(dashboardData);
    } catch (err) {
        console.error("Error calculating dashboard data:", err);
        res.status(500).json({ message: "Error calculating dashboard data." });
    }
};

exports.emitDashboardDataUpdate = async (io) => {
    try {
        const dashboardData = await calculateDashboardData();
        io.emit('dashboard_update', dashboardData);
        console.log('Emitted dashboard_update via Socket.IO');
    } catch (err) {
        console.error("Error emitting dashboard data:", err);
    }
};

// --- Budget Codes (Master Data) ---
exports.createBudgetCode = async (req, res) => {
    const { code, name, type, category, description } = req.body;
    if (req.user.role.toLowerCase() !== 'keuangan' && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Hanya role Keuangan atau Admin yang dapat membuat kode anggaran.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO budget_codes (code, name, type, category, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [code, name, type, category, description]
        );
        res.status(200).json({ message: 'Budget code created successfully', budgetCode: result.rows[0] });
    } catch (error) {
        console.error('Error creating budget code:', error);
        res.status(500).json({ message: 'Internal server error creating budget code.' });
    }
};

exports.getBudgetCodes = async (req, res) => {
    const { type, category } = req.query;
    let query = 'SELECT * FROM budget_codes';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (type) {
        conditions.push(`type = $${paramIndex++}`);
        params.push(type);
    }
    if (category) {
        conditions.push(`category = $${paramIndex++}`);
        params.push(category);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY code';

    try {
        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching budget codes:', error);
        res.status(500).json({ message: 'Internal server error fetching budget codes.' });
    }
};

exports.updateBudgetCode = async (req, res) => {
    const { id } = req.params;
    const { code, name, type, category, description } = req.body;
    if (req.user.role.toLowerCase() !== 'keuangan' && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Hanya role Keuangan atau Admin yang dapat memperbarui kode anggaran.' });
    }

    try {
        const result = await pool.query(
            'UPDATE budget_codes SET code = $1, name = $2, type = $3, category = $4, description = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
            [code, name, type, category, description, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Budget code not found.' });
        }
        res.status(200).json({ message: 'Budget code updated successfully', budgetCode: result.rows[0] });
    } catch (error) {
        console.error('Error updating budget code:', error);
        res.status(500).json({ message: 'Internal server error updating budget code.' });
    }
};

exports.deleteBudgetCode = async (req, res) => {
    const { id } = req.params;
    if (req.user.role.toLowerCase() !== 'keuangan' && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Hanya role Keuangan atau Admin yang dapat menghapus kode anggaran.' });
    }

    try {
        const result = await pool.query('DELETE FROM budget_codes WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Budget code not found.' });
        }
        res.status(200).json({ message: 'Budget code deleted successfully' });
    } catch (error) {
        console.error('Error deleting budget code:', error);
        res.status(500).json({ message: 'Internal server error deleting budget code.' });
    }
};

// --- Product Contributions ---
exports.createProductContribution = async (req, res) => {
    const { budget_code_id, product_name, month, year, contribution_amount } = req.body;
    if (req.user.role.toLowerCase() !== 'operasional' && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Hanya role Operasional atau Admin yang dapat membuat kontribusi produk.' });
    }

    try {
        // Verifikasi bahwa budget_code_id adalah tipe 'PRODUCT'
        const budgetCodeResult = await pool.query('SELECT type FROM budget_codes WHERE id = $1', [budget_code_id]);
        if (budgetCodeResult.rows.length === 0 || budgetCodeResult.rows[0].type !== 'PRODUCT') {
            return res.status(400).json({ message: 'Budget code ID tidak valid atau bukan tipe PRODUCT.' });
        }

        const result = await pool.query(
            'INSERT INTO product_contributions (budget_code_id, product_name, month, year, contribution_amount) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [budget_code_id, product_name, month, year, contribution_amount]
        );
        res.status(200).json({ message: 'Product contribution added successfully', contribution: result.rows[0] });
    } catch (error) {
        console.error('Error creating product contribution:', error);
        res.status(500).json({ message: 'Internal server error creating product contribution.' });
    }
};

exports.getProductContributions = async (req, res) => {
    const { budgetCodeId } = req.params;
    const { month, year } = req.query;
    let query = 'SELECT * FROM product_contributions WHERE budget_code_id = $1';
    const params = [budgetCodeId];
    let paramIndex = 2;

    if (month) {
        query += ` AND month = $${paramIndex++}`;
        params.push(parseInt(month));
    }
    if (year) {
        query += ` AND year = $${paramIndex++}`;
        params.push(parseInt(year));
    }
    query += ' ORDER BY year, month, product_name';

    try {
        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching product contributions:', error);
        res.status(500).json({ message: 'Internal server error fetching product contributions.' });
    }
};

exports.updateProductContribution = async (req, res) => {
    const { id } = req.params;
    const { product_name, month, year, contribution_amount } = req.body;
    if (req.user.role.toLowerCase() !== 'operasional' && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Hanya role Operasional atau Admin yang dapat memperbarui kontribusi produk.' });
    }

    try {
        const result = await pool.query(
            'UPDATE product_contributions SET product_name = $1, month = $2, year = $3, contribution_amount = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [product_name, month, year, contribution_amount, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product contribution not found.' });
        }
        res.status(200).json({ message: 'Product contribution updated successfully', contribution: result.rows[0] });
    } catch (error) {
        console.error('Error updating product contribution:', error);
        res.status(500).json({ message: 'Internal server error updating product contribution.' });
    }
};

exports.deleteProductContribution = async (req, res) => {
    const { id } = req.params;
    if (req.user.role.toLowerCase() !== 'operasional' && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Hanya role Operasional atau Admin yang dapat menghapus kontribusi produk.' });
    }

    try {
        const result = await pool.query('DELETE FROM product_contributions WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product contribution not found.' });
        }
        res.status(200).json({ message: 'Product contribution deleted successfully' });
    } catch (error) {
        console.error('Error deleting product contribution:', error);
        res.status(500).json({ message: 'Internal server error deleting product contribution.' });
    }
};

// --- Budget Targets ---
exports.createBudgetTarget = async (req, res) => {
    const { budget_code_id, month, year, target_amount } = req.body;
    if (req.user.role.toLowerCase() !== 'keuangan' && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Hanya role Keuangan atau Admin yang dapat membuat target anggaran.' });
    }

    try {
        // Verifikasi bahwa budget_code_id adalah tipe 'REVENUE' atau 'EXPENSE'
        const budgetCodeResult = await pool.query('SELECT type FROM budget_codes WHERE id = $1', [budget_code_id]);
        if (budgetCodeResult.rows.length === 0 || !['REVENUE', 'EXPENSE'].includes(budgetCodeResult.rows[0].type)) {
            return res.status(400).json({ message: 'Budget code ID tidak valid atau bukan tipe REVENUE/EXPENSE.' });
        }

        const result = await pool.query(
            'INSERT INTO budget_targets (budget_code_id, month, year, target_amount) VALUES ($1, $2, $3, $4) RETURNING *',
            [budget_code_id, month, year, target_amount]
        );
        res.status(200).json({ message: 'Budget target added successfully', target: result.rows[0] });
    } catch (error) {
        console.error('Error creating budget target:', error);
        res.status(500).json({ message: 'Internal server error creating budget target.' });
    }
};

exports.getBudgetTargets = async (req, res) => {
    const { budgetCodeId } = req.params;
    const { month, year } = req.query;
    let query = 'SELECT * FROM budget_targets WHERE budget_code_id = $1';
    const params = [budgetCodeId];
    let paramIndex = 2;

    if (month) {
        query += ` AND month = $${paramIndex++}`;
        params.push(parseInt(month));
    }
    if (year) {
        query += ` AND year = $${paramIndex++}`;
        params.push(parseInt(year));
    }
    query += ' ORDER BY year, month';

    try {
        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching budget targets:', error);
        res.status(500).json({ message: 'Internal server error fetching budget targets.' });
    }
};

exports.updateBudgetTarget = async (req, res) => {
    const { id } = req.params;
    const { month, year, target_amount } = req.body;
    if (req.user.role.toLowerCase() !== 'keuangan' && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Hanya role Keuangan atau Admin yang dapat memperbarui target anggaran.' });
    }

    try {
        const result = await pool.query(
            'UPDATE budget_targets SET month = $1, year = $2, target_amount = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [month, year, target_amount, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Budget target not found.' });
        }
        res.status(200).json({ message: 'Budget target updated successfully', target: result.rows[0] });
    } catch (error) {
        console.error('Error updating budget target:', error);
        res.status(500).json({ message: 'Internal server error updating budget target.' });
    }
};

exports.deleteBudgetTarget = async (req, res) => {
    const { id } = req.params;
    if (req.user.role.toLowerCase() !== 'keuangan' && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Hanya role Keuangan atau Admin yang dapat menghapus target anggaran.' });
    }

    try {
        const result = await pool.query('DELETE FROM budget_targets WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Budget target not found.' });
        }
        res.status(200).json({ message: 'Budget target deleted successfully' });
    } catch (error) {
        console.error('Error deleting budget target:', error);
        res.status(500).json({ message: 'Internal server error deleting budget target.' });
    }
};

exports.createRealization = async (req, res) => {
    const { tanggal, nominal, jenis_data, produk, nama_pemasukan, catatan, nama_penginput, budget_code_id } = req.body;
    if (req.user.role.toLowerCase() !== 'keuangan' && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Hanya role Keuangan atau Admin yang dapat membuat realisasi.' });
    }

    try {
        // Validasi jenis_data
        if (!['Realisasi', 'Expenses'].includes(jenis_data)) {
            return res.status(400).json({ message: 'Jenis data tidak valid untuk realisasi. Harus "Realisasi" atau "Expenses".' });
        }

        const result = await pool.query(
            'INSERT INTO sales (tanggal, nominal, jenis_data, produk, nama_pemasukan, catatan, nama_penginput, budget_code_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [tanggal, nominal, jenis_data, produk, nama_pemasukan, catatan, nama_penginput || req.user.username, budget_code_id]
        );
        res.status(200).json({ message: 'Realization data added successfully', realization: result.rows[0] });
    } catch (error) {
        console.error('Error creating realization:', error);
        res.status(500).json({ message: 'Internal server error creating realization.' });
    }
};

exports.getRealizations = async (req, res) => {
    const { jenis_data, year, month, budget_code_id } = req.query;
    let query = 'SELECT * FROM sales WHERE jenis_data IN (\'Realisasi\', \'Expenses\')';
    const params = [];
    let paramIndex = 1;

    if (jenis_data) {
        query += ` AND jenis_data = $${paramIndex++}`;
        params.push(jenis_data);
    }
    if (year) {
        query += ` AND EXTRACT(YEAR FROM tanggal) = $${paramIndex++}`;
        params.push(parseInt(year));
    }
    if (month) {
        query += ` AND EXTRACT(MONTH FROM tanggal) = $${paramIndex++}`;
        params.push(parseInt(month));
    }
    if (budget_code_id) {
        query += ` AND budget_code_id = $${paramIndex++}`;
        params.push(budget_code_id);
    }
    query += ' ORDER BY tanggal DESC';

    try {
        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching realizations:', error);
        res.status(500).json({ message: 'Internal server error fetching realizations.' });
    }
};

exports.updateRealization = async (req, res) => {
    const { id } = req.params;
    const { tanggal, nominal, jenis_data, produk, nama_pemasukan, catatan, budget_code_id } = req.body;
    if (req.user.role.toLowerCase() !== 'keuangan' && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Hanya role Keuangan atau Admin yang dapat memperbarui realisasi.' });
    }

    try {
        if (!['Realisasi', 'Expenses'].includes(jenis_data)) {
            return res.status(400).json({ message: 'Jenis data tidak valid untuk realisasi. Harus "Realisasi" atau "Expenses".' });
        }

        const result = await pool.query(
            'UPDATE sales SET tanggal = $1, nominal = $2, jenis_data = $3, produk = $4, nama_pemasukan = $5, catatan = $6, budget_code_id = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
            [tanggal, nominal, jenis_data, produk, nama_pemasukan, catatan, budget_code_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Realization data not found.' });
        }
        res.status(200).json({ message: 'Realization data updated successfully', realization: result.rows[0] });
    } catch (error) {
        console.error('Error updating realization:', error);
        res.status(500).json({ message: 'Internal server error updating realization.' });
    }
};

exports.deleteRealization = async (req, res) => {
    const { id } = req.params;
    if (req.user.role.toLowerCase() !== 'keuangan' && req.user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Hanya role Keuangan atau Admin yang dapat menghapus realisasi.' });
    }

    try {
        const result = await pool.query('DELETE FROM sales WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Realization data not found.' });
        }
        res.status(200).json({ message: 'Realization data deleted successfully' });
    } catch (error) {
        console.error('Error deleting realization:', error);
        res.status(500).json({ message: 'Internal server error deleting realization.' });
    }
};