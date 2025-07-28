
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const salesController2 = require('../controllers/salesTelcoSuperController');
const salesController3 = require('../controllers/projectFinancingController');
const projectExecutingController = require('../controllers/projectExecutingController');
const summaryController = require('../controllers/summaryController');
const dashboardController = require("../controllers/dashboardController");
const authController = require('../controllers/AuthController');

router.get('/dashboard', salesController.getDashboardData);
// router.get('/products', salesController.getProducts);

router.get('/telco-super', salesController2.getTelcoSuperData);
router.post('/telco-super', salesController2.postTelcoSuperData);
router.put("/telco-super", salesController2.putTelcoSuperData);

router.post('/realisasiFinancing', salesController3.insertRealisasiFinancing);
router.get('/realisasiFinancing', salesController3.getProjectFinancingData); 
router.put('/realisasiFinancing',salesController3.putFinancing );

router.get('/project-executing', projectExecutingController.getProjectExecutingData);
router.put('/project-executing', projectExecutingController.putProjectExecutingData);

router.get('/progress-summary', summaryController.getProgressSummary);

router.get("/yearly-progress", dashboardController.getTotalYearlyProgress);


router.get('/revenue-summary', authController.verifyToken, salesController.getRevenueSummary);
router.get('/monthly-realization', authController.verifyToken, salesController.getMonthlyRealization);
router.get('/product-comparison', authController.verifyToken, salesController.getYearlyProductComparison);
router.get('/monthly-receivables', authController.verifyToken, salesController.getMonthlyReceivables);
router.get('/monthly-sales-collection', authController.verifyToken, salesController.getMonthlySalesCollection);
router.get('/collection-summary', authController.verifyToken, salesController.getCollectionSummary);

router.get('/expenses-summary', authController.verifyToken, salesController.getExpensesSummary);
router.get('/monthly-expenses-comparison', authController.verifyToken, salesController.getMonthlyExpensesComparison);

module.exports = router;