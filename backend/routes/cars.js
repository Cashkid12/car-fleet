const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const incomeController = require('../controllers/incomeController');
const damageController = require('../controllers/damageController');
const expenseController = require('../controllers/expenseController');

// Car CRUD
router.get('/', carController.getAllCars);
router.get('/:id', carController.getCar);
router.post('/', carController.createCar);
router.put('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);

// Car Summary & Timeline
router.get('/:id/summary', carController.getCarSummary);
router.get('/:id/timeline', carController.getCarTimeline);

// Income — global
router.get('/income/all', incomeController.getAllIncome);
router.get('/income/summary', incomeController.getIncomeSummary);

// Income — per car
router.post('/:id/income', incomeController.addIncome);
router.get('/:id/income', incomeController.getIncome);
router.get('/:id/income/range', incomeController.getIncomeRange);
router.put('/:id/income/:incomeId', incomeController.updateIncome);
router.delete('/:id/income/:incomeId', incomeController.deleteIncome);

// Damages — global
router.get('/damages/all', damageController.getAllDamages);
router.get('/maintenance/summary', damageController.getMaintenanceSummary);

// Damages — per car
router.post('/:id/damage', damageController.addDamage);
router.put('/:id/damage/:damageId', damageController.updateDamage);
router.delete('/:id/damage/:damageId', damageController.deleteDamage);
router.get('/:id/damages', damageController.getDamages);

// Expenses — global
router.get('/expenses/all', expenseController.getAllExpenses);

// Expenses — per car
router.post('/:id/expense', expenseController.addExpense);
router.put('/:id/expense/:expenseId', expenseController.updateExpense);
router.delete('/:id/expense/:expenseId', expenseController.deleteExpense);
router.get('/:id/expenses', expenseController.getExpenses);

module.exports = router;