
const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authController = require('../controllers/AuthController');

// Middleware untuk melindungi semua rute budget
router.use(authController.verifyToken);

// Budget Codes (Master Data)
router.post('/budget-codes', budgetController.createBudgetCode);
router.get('/budget-codes', budgetController.getBudgetCodes);
router.put('/budget-codes/:id', budgetController.updateBudgetCode);
router.delete('/budget-codes/:id', budgetController.deleteBudgetCode);

// Product Contributions
router.post('/product-contributions', budgetController.createProductContribution);
router.get('/product-contributions/:budgetCodeId', budgetController.getProductContributions);
router.put('/product-contributions/:id', budgetController.updateProductContribution);
router.delete('/product-contributions/:id', budgetController.deleteProductContribution);

// Budget Targets
router.post('/budget-targets', budgetController.createBudgetTarget);
router.get('/budget-targets/:budgetCodeId', budgetController.getBudgetTargets);
router.put('/budget-targets/:id', budgetController.updateBudgetTarget);
router.delete('/budget-targets/:id', budgetController.deleteBudgetTarget);

// Realizations (menggunakan tabel sales)
router.post('/realizations', budgetController.createRealization);
router.get('/realizations', budgetController.getRealizations);
router.put('/realizations/:id', budgetController.updateRealization);
router.delete('/realizations/:id', budgetController.deleteRealization);

module.exports = router;