const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const incomeController = require('../controllers/incomeController');
const damageController = require('../controllers/damageController');
const expenseController = require('../controllers/expenseController');

// All routes are protected globally by ClerkExpressRequireAuth in server.js

// Car CRUD
router.get('/', carController.getAllCars);
router.get('/:id', carController.getCar);
router.post('/', carController.createCar);
router.put('/:id', carController.updateCar);
router.delete('/:id', carController.deleteCar);

// Income within a car
router.post('/:id/income', incomeController.addIncome);
router.get('/:id/income', incomeController.getIncome);
router.get('/:id/income/range', incomeController.getIncomeRange);

// Damages within a car
router.post('/:id/damage', damageController.addDamage);
router.put('/:id/damage/:damageId', damageController.updateDamage);
router.get('/:id/damages', damageController.getDamages);

// Expenses within a car
router.post('/:id/expense', expenseController.addExpense);
router.get('/:id/expenses', expenseController.getExpenses);

module.exports = router;
