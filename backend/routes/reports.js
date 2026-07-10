const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

router.get('/summary', reportsController.getSummary);
router.get('/charts', reportsController.getCharts);
router.get('/vehicles', reportsController.getVehiclePerformance);
router.get('/expenses', reportsController.getExpenseBreakdown);
router.get('/insights', reportsController.getInsights);
router.get('/income-analysis', reportsController.getIncomeAnalysis);

module.exports = router;