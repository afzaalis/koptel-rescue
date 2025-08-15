const pool = require('../db');

/**
 * @description Mengambil data agregat penjualan dan target dari database.
 * @param {number} year - Tahun yang akan diambil datanya.
 * @returns {Promise<{dataByMonth: object[], productList: object[]}>}
 */
const getAggregatedSalesData = async (year) => {
    try {
        // Ambil data Realisasi dari tabel 'sales'
        const realizationResult = await pool.query(`
            SELECT
                EXTRACT(MONTH FROM tanggal)::int AS bulan,
                produk AS produk_name,
                SUM(nominal)::float AS total
            FROM sales
            WHERE
                EXTRACT(YEAR FROM tanggal)::int = $1
                AND jenis_data = 'Realisasi'
            GROUP BY bulan, produk_name
        `, [year]);

        // Ambil data Target dari tabel 'sales'
        const targetResult = await pool.query(`
            SELECT
                EXTRACT(MONTH FROM tanggal)::int AS bulan,
                produk AS produk_name,
                SUM(nominal)::float AS total
            FROM sales
            WHERE
                EXTRACT(YEAR FROM tanggal)::int = $1
                AND jenis_data = 'Target'
            GROUP BY bulan, produk_name
        `, [year]);

        const dataByMonth = Array(12).fill(null).map(() => ({
            totalTarget: 0,
            totalRealisasi: 0,
            products: []
        }));

        const productMap = {};

        // Proses data realisasi
        for (const row of realizationResult.rows) {
            const monthIdx = row.bulan - 1;
            const produk = row.produk_name;
            if (!productMap[produk]) productMap[produk] = Array(12).fill(null).map(() => ({ target: 0, realisasi: 0 }));
            productMap[produk][monthIdx].realisasi = row.total;
            dataByMonth[monthIdx].totalRealisasi += row.total;
        }

        // Proses data target
        for (const row of targetResult.rows) {
            const monthIdx = row.bulan - 1;
            const produk = row.produk_name;
            if (!productMap[produk]) productMap[produk] = Array(12).fill(null).map(() => ({ target: 0, realisasi: 0 }));
            productMap[produk][monthIdx].target = row.total;
            dataByMonth[monthIdx].totalTarget += row.total;
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
        throw error;
    }
};

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

// --- REVENUE CONTROLLERS ---
exports.getRevenueSummary = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        const totalRevenueResult = await pool.query(
            "SELECT COALESCE(SUM(nominal), 0) AS total_revenue FROM sales WHERE EXTRACT(YEAR FROM tanggal) = $1 AND jenis_data = 'Realisasi'",
            [currentYear]
        );
        const totalRevenue = parseFloat(totalRevenueResult.rows[0]?.total_revenue || 0);

        // Ambil data target dari tabel 'sales'
        const totalTargetResult = await pool.query(
            "SELECT COALESCE(SUM(nominal), 0) AS total_target FROM sales WHERE EXTRACT(YEAR FROM tanggal) = $1 AND jenis_data = 'Target'",
            [currentYear]
        );
        const totalTarget = parseFloat(totalTargetResult.rows[0]?.total_target || 0);

        const targetAchievement = totalTarget > 0 ? (totalRevenue / totalTarget) * 100 : 0;

        res.status(200).json({
            totalRevenue,
            totalTarget,
            targetAchievement: parseFloat(targetAchievement.toFixed(2))
        });

    } catch (error) {
        console.error('Error in getRevenueSummary:', error.message || error);
        if (error.stack) {
            console.error(error.stack);
        }
        res.status(500).json({ message: 'Internal server error fetching revenue summary.' });
    }
};

exports.getMonthlyRealization = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const query = `
            SELECT
                EXTRACT(MONTH FROM tanggal) AS month_num,
                TO_CHAR(tanggal, 'Mon') AS month,
                COALESCE(SUM(nominal), 0) AS realization
            FROM sales
            WHERE EXTRACT(YEAR FROM tanggal) = $1 AND jenis_data = 'Realisasi'
            GROUP BY EXTRACT(MONTH FROM tanggal), TO_CHAR(tanggal, 'Mon')
            ORDER BY month_num;
        `;
        const result = await pool.query(query, [currentYear]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyDataMap = new Map(result.rows.map(row => [row.month, row.realization]));

        const formattedData = months.map(month => ({
            month: month,
            realization: monthlyDataMap.get(month) || 0
        }));

        res.status(200).json(formattedData);

    } catch (error) {
        console.error('Error in getMonthlyRealization:', error.message || error);
        if (error.stack) {
            console.error(error.stack);
        }
        res.status(500).json({ message: 'Internal server error fetching monthly realization.' });
    }
};

exports.getYearlyProductComparison = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const query = `
            SELECT
                produk,
                SUM(CASE WHEN EXTRACT(YEAR FROM tanggal) = $1 AND jenis_data = 'Realisasi' THEN nominal ELSE 0 END) AS current_year_revenue,
                SUM(CASE WHEN EXTRACT(YEAR FROM tanggal) = $2 AND jenis_data = 'Realisasi' THEN nominal ELSE 0 END) AS previous_year_revenue
            FROM sales
            WHERE produk IN ('Super', 'Project Financing', 'Project Executing')
            AND (EXTRACT(YEAR FROM tanggal) = $1 OR EXTRACT(YEAR FROM tanggal) = $2)
            GROUP BY produk;
        `;
        const result = await pool.query(query, [currentYear, previousYear]);

        const products = ['Super', 'Project Financing', 'Project Executing'];
        const productDataMap = new Map(result.rows.map(row => [row.produk, {
            currentYearRevenue: parseFloat(row.current_year_revenue),
            previousYearRevenue: parseFloat(row.previous_year_revenue)
        }]));

        const formattedData = products.map(product => ({
            productName: product,
            currentYearRevenue: productDataMap.get(product)?.currentYearRevenue || 0,
            previousYearRevenue: productDataMap.get(product)?.previousYearRevenue || 0
        }));

        res.status(200).json(formattedData);

    } catch (error) {
        console.error('Error in getYearlyProductComparison:', error.message || error);
        if (error.stack) {
            console.error(error.stack);
        }
        res.status(500).json({ message: 'Internal server error fetching yearly product comparison.' });
    }
};

// --- COLLECTION CONTROLLERS ---
exports.getCollectionSummary = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // Bulan saat ini (1-12)

        const totalCollectionThisYearResult = await pool.query(
            "SELECT COALESCE(SUM(nominal), 0) AS total_collection FROM sales WHERE EXTRACT(YEAR FROM tanggal) = $1 AND jenis_data = 'Realisasi'",
            [currentYear]
        );
        const totalCollectionThisYear = parseFloat(totalCollectionThisYearResult.rows[0]?.total_collection || 0);

        // Ambil piutang (target) dari tabel 'sales'
        const receivablesThisMonthResult = await pool.query(
            "SELECT COALESCE(SUM(nominal), 0) AS receivables FROM sales WHERE EXTRACT(YEAR FROM tanggal) = $1 AND EXTRACT(MONTH FROM tanggal) = $2 AND jenis_data = 'Target'",
            [currentYear, currentMonth]
        );
        const receivablesThisMonth = parseFloat(receivablesThisMonthResult.rows[0]?.receivables || 0);

        const realizationThisMonthResult = await pool.query(
            "SELECT COALESCE(SUM(nominal), 0) AS realization FROM sales WHERE EXTRACT(YEAR FROM tanggal) = $1 AND EXTRACT(MONTH FROM tanggal) = $2 AND jenis_data = 'Realisasi'",
            [currentYear, currentMonth]
        );
        const realizationThisMonth = parseFloat(realizationThisMonthResult.rows[0]?.realization || 0);

        let crThisMonthPercentage = 0;
        if (receivablesThisMonth > 0) {
            crThisMonthPercentage = (realizationThisMonth / receivablesThisMonth) * 100;
        } else if (realizationThisMonth > 0) {
            crThisMonthPercentage = 100;
        }

        res.status(200).json({
            totalCollectionThisYear,
            receivablesThisMonth,
            crThisMonthPercentage: parseFloat(crThisMonthPercentage.toFixed(2))
        });

    } catch (error) {
        console.error('Error in getCollectionSummary:', error.message || error);
        if (error.stack) {
            console.error(error.stack);
        }
        res.status(500).json({ message: 'Internal server error fetching collection summary.' });
    }
};

exports.getMonthlyReceivables = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        // Ambil piutang bulanan (target) dari tabel 'sales'
        const query = `
            SELECT
                EXTRACT(MONTH FROM tanggal) AS month_num,
                TO_CHAR(tanggal, 'Mon') AS month,
                COALESCE(SUM(nominal), 0) AS receivables
            FROM sales
            WHERE EXTRACT(YEAR FROM tanggal) = $1 AND jenis_data = 'Target'
            GROUP BY EXTRACT(MONTH FROM tanggal), TO_CHAR(tanggal, 'Mon')
            ORDER BY month_num;
        `;
        const result = await pool.query(query, [currentYear]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyDataMap = new Map(result.rows.map(row => [row.month, row.receivables]));

        const formattedData = months.map(month => ({
            month: month,
            receivables: monthlyDataMap.get(month) || 0
        }));

        res.status(200).json(formattedData);

    } catch (error) {
        console.error('Error in getMonthlyReceivables:', error.message || error);
        if (error.stack) {
            console.error(error.stack);
        }
        res.status(500).json({ message: 'Internal server error fetching monthly receivables.' });
    }
};

exports.getMonthlySalesCollection = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const query = `
            SELECT
                EXTRACT(MONTH FROM tanggal) AS month_num,
                TO_CHAR(tanggal, 'Mon') AS month,
                COALESCE(SUM(nominal), 0) AS sales_collection
            FROM sales
            WHERE EXTRACT(YEAR FROM tanggal) = $1 AND jenis_data = 'Realisasi'
            GROUP BY EXTRACT(MONTH FROM tanggal), TO_CHAR(tanggal, 'Mon')
            ORDER BY month_num;
        `;
        const result = await pool.query(query, [currentYear]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyDataMap = new Map(result.rows.map(row => [row.month, row.sales_collection]));

        const formattedData = months.map(month => ({
            month: month,
            salesCollection: monthlyDataMap.get(month) || 0
        }));

        res.status(200).json(formattedData);

    } catch (error) {
        console.error('Error in getMonthlySalesCollection:', error.message || error);
        if (error.stack) {
            console.error(error.stack);
        }
        res.status(500).json({ message: 'Internal server error fetching monthly sales collection.' });
    }
};

// --- UTILITY & EXPENSES CONTROLLERS ---
exports.getExpensesSummary = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // Bulan saat ini (1-12)

        const expensesYTDResult = await pool.query(
            "SELECT COALESCE(SUM(nominal), 0) AS total_expenses FROM sales WHERE EXTRACT(YEAR FROM tanggal) = $1 AND jenis_data = 'Expenses'",
            [currentYear]
        );
        const expensesYTD = parseFloat(expensesYTDResult.rows[0]?.total_expenses || 0);

        const expensesCMResult = await pool.query(
            "SELECT COALESCE(SUM(nominal), 0) AS monthly_expenses FROM sales WHERE EXTRACT(YEAR FROM tanggal) = $1 AND EXTRACT(MONTH FROM tanggal) = $2 AND jenis_data = 'Expenses'",
            [currentYear, currentMonth]
        );
        const expensesCM = parseFloat(expensesCMResult.rows[0]?.monthly_expenses || 0);

        res.status(200).json({
            expensesYTD,
            expensesCM
        });

    } catch (error) {
        console.error('Error in getExpensesSummary:', error.message || error);
        if (error.stack) {
            console.error(error.stack);
        }
        res.status(500).json({ message: 'Internal server error fetching expenses summary.' });
    }
};

exports.getMonthlyExpensesComparison = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const query = `
            SELECT
                EXTRACT(MONTH FROM tanggal) AS month_num,
                TO_CHAR(tanggal, 'Mon') AS month,
                COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM tanggal) = $1 THEN nominal ELSE 0 END), 0) AS current_year_expenses,
                COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM tanggal) = $2 THEN nominal ELSE 0 END), 0) AS previous_year_expenses
            FROM sales
            WHERE jenis_data = 'Expenses'
            AND (EXTRACT(YEAR FROM tanggal) = $1 OR EXTRACT(YEAR FROM tanggal) = $2)
            GROUP BY EXTRACT(MONTH FROM tanggal), TO_CHAR(tanggal, 'Mon')
            ORDER BY month_num;
        `;
        const result = await pool.query(query, [currentYear, previousYear]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyDataMap = new Map(result.rows.map(row => [row.month, {
            currentYearExpenses: parseFloat(row.current_year_expenses),
            previousYearExpenses: parseFloat(row.previous_year_expenses)
        }]));

        const formattedData = months.map(month => ({
            month: month,
            currentYearExpenses: monthlyDataMap.get(month)?.currentYearExpenses || 0,
            previousYearExpenses: monthlyDataMap.get(month)?.previousYearExpenses || 0
        }));

        res.status(200).json(formattedData);

    } catch (error) {
        console.error('Error in getMonthlyExpensesComparison:', error.message || error);
        if (error.stack) {
            console.error(error.stack);
        }
        res.status(500).json({ message: 'Internal server error fetching monthly expenses comparison.' });
    }
};

const createMonthlyArray = () => Array(12).fill(0);

// Endpoint baru untuk mengambil data Telco Super
exports.getTelcoSuperData = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const productName = 'Super';

        // --- Ambil data target dari sales ---
        const targetResult = await pool.query(`
            SELECT
                EXTRACT(MONTH FROM tanggal)::int AS month,
                SUM(nominal) AS total_target
            FROM sales
            WHERE
                EXTRACT(YEAR FROM tanggal) = $1 AND
                produk = $2 AND
                jenis_data = 'Target'
            GROUP BY month
            ORDER BY month ASC
        `, [currentYear, productName]);

        const targetData = createMonthlyArray();
        targetResult.rows.forEach(row => {
            if (row.month > 0 && row.month <= 12) {
                targetData[row.month - 1] = parseFloat(row.total_target);
            }
        });

        // --- Ambil data realisasi tahun ini dari sales ---
        const realizationResult = await pool.query(`
            SELECT
                EXTRACT(MONTH FROM tanggal)::int AS month,
                SUM(nominal) AS total_realisasi
            FROM sales
            WHERE
                EXTRACT(YEAR FROM tanggal) = $1 AND
                produk = $2 AND
                jenis_data = 'Realisasi'
            GROUP BY month
            ORDER BY month ASC
        `, [currentYear, productName]);

        const realizationData = createMonthlyArray();
        realizationResult.rows.forEach(row => {
            realizationData[row.month - 1] = parseFloat(row.total_realisasi);
        });

        // --- Ambil data realisasi tahun lalu dari sales ---
        const realizationPrevResult = await pool.query(`
            SELECT
                EXTRACT(MONTH FROM tanggal)::int AS month,
                SUM(nominal) AS total_realisasi
            FROM sales
            WHERE
                EXTRACT(YEAR FROM tanggal) = $1 AND
                produk = $2 AND
                jenis_data = 'Realisasi'
            GROUP BY month
            ORDER BY month ASC
        `, [previousYear, productName]);

        const realizationPrevData = createMonthlyArray();
        realizationPrevResult.rows.forEach(row => {
            realizationPrevData[row.month - 1] = parseFloat(row.total_realisasi);
        });

        res.status(200).json({
            target: targetData,
            realisasi: realizationData,
            realisasiPrev: realizationPrevData,
        });

    } catch (error) {
        console.error('Error in getTelcoSuperData:', error.message || error);
        res.status(500).json({ message: 'Internal server error fetching Telco Super data.' });
    }
};
