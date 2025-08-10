const pool = require('../db'); 

const getDebtSummary = async (req, res) => {
  try {
    const queryText = `
      SELECT
        SUM(total_amount) AS "totalDebt",
        (SELECT SUM(amount) FROM payments WHERE EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)) AS "paidThisMonth",
        (SELECT SUM(total_amount) FROM debts) - (SELECT COALESCE(SUM(amount), 0) FROM payments) AS "remainingDebt"
      FROM debts;
    `;
    const result = await pool.query(queryText);
    const summary = result.rows[0];

    const totalDebt = parseFloat(summary.totalDebt) || 0;
    const remainingDebt = parseFloat(summary.remainingDebt) || 0;
    const remainingDebtPercentage = totalDebt > 0 ? (remainingDebt / totalDebt) * 100 : 0;

    res.status(200).json({
      totalDebt: totalDebt,
      paidThisMonth: parseFloat(summary.paidThisMonth) || 0,
      remainingDebtPercentage: remainingDebtPercentage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMonthlyDebtRealization = async (req, res) => {
  try {
    const queryText = `
      WITH monthly_targets AS (
          SELECT
              EXTRACT(MONTH FROM (start_date + (n * interval '1 month'))) AS month,
              SUM(total_amount / target_duration_months) AS target
          FROM debts,
               generate_series(0, target_duration_months - 1) as n
          GROUP BY month
      ), monthly_realizations AS (
          SELECT
              EXTRACT(MONTH FROM payment_date) AS month,
              SUM(amount) AS realization
          FROM payments
          GROUP BY month
      )
      SELECT
          TO_CHAR(TO_DATE(T.month::text, 'MM'), 'Month') AS month,
          COALESCE(T.target, 0) AS target,
          COALESCE(R.realization, 0) AS realization
      FROM monthly_targets AS T
      FULL OUTER JOIN monthly_realizations AS R ON T.month = R.month
      ORDER BY T.month;
    `;
    const result = await pool.query(queryText);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getKopegList = async (req, res) => {
  try {
    const result = await pool.query('SELECT kopeg_id as id, name FROM kopeg ORDER BY name');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getActiveDebts = async (req, res) => {
  try {
    const queryText = `
      SELECT
          d.debt_id as id,
          d.description,
          k.name as kopegName,
          d.total_amount - COALESCE(SUM(p.amount), 0) AS remaining
      FROM debts d
      JOIN kopeg k ON d.kopeg_id = k.kopeg_id
      LEFT JOIN payments p ON d.debt_id = p.debt_id
      GROUP BY d.debt_id, k.name, d.description
      HAVING d.total_amount > COALESCE(SUM(p.amount), 0)
      ORDER BY k.name;
    `;
    const result = await pool.query(queryText);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addNewDebt = async (req, res) => {
  const { kopegName, description, totalDebt, durationInMonths } = req.body;
  
  try {
    // 1. Cek apakah Kopeg sudah ada
    let kopegResult = await pool.query('SELECT kopeg_id FROM kopeg WHERE name = $1', [kopegName]);
    let kopegId;

    if (kopegResult.rows.length > 0) {
      // Jika Kopeg sudah ada, gunakan ID-nya
      kopegId = kopegResult.rows[0].kopeg_id;
    } else {
      // Jika Kopeg belum ada, buat Kopeg baru
      const newKopegResult = await pool.query('INSERT INTO kopeg (name) VALUES ($1) RETURNING kopeg_id', [kopegName]);
      kopegId = newKopegResult.rows[0].kopeg_id;
    }

    const queryText = 'INSERT INTO debts (kopeg_id, description, total_amount, target_duration_months, start_date) VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *';
    const result = await pool.query(queryText, [kopegId, description, totalDebt, durationInMonths]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updatePaymentRealization = async (req, res) => {
  const { debtId, amount } = req.body;
  try {
    const queryText = 'INSERT INTO payments (debt_id, amount, payment_date) VALUES ($1, $2, CURRENT_DATE) RETURNING *';
    const result = await pool.query(queryText, [debtId, amount]);

    // Check if debt is paid off and update status
    const checkPaidOffQuery = `
      SELECT
          d.total_amount,
          COALESCE(SUM(p.amount), 0) as total_paid
      FROM debts d
      JOIN payments p ON d.debt_id = p.debt_id
      WHERE d.debt_id = $1
      GROUP BY d.total_amount;
    `;
    const paidOffResult = await pool.query(checkPaidOffQuery, [debtId]);
    if (paidOffResult.rows.length > 0 && paidOffResult.rows[0].total_paid >= paidOffResult.rows[0].total_amount) {
      await pool.query('UPDATE debts SET is_paid_off = TRUE WHERE debt_id = $1', [debtId]);
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDebtSummary,
  getMonthlyDebtRealization,
  getKopegList,
  getActiveDebts,
  addNewDebt,
  updatePaymentRealization
};