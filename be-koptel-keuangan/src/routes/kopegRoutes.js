const express = require('express');
const kopegController = require('../controllers/kopegController');
const router = express.Router();

router.get('/debt-summary', kopegController.getDebtSummary);

router.get('/monthly-debt-realization', kopegController.getMonthlyDebtRealization);

router.get('/list', kopegController.getKopegList);

router.get('/active-debts', kopegController.getActiveDebts);

router.post('/debt', kopegController.addNewDebt);

router.put('/debt/payment', kopegController.updatePaymentRealization);

module.exports = router;