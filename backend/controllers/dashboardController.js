const Car = require('../models/Car');

exports.getSummary = async (req, res) => {
  try {
    const cars = await Car.find({ clerkUserId: req.auth.userId });
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let incomeThisMonth = 0;
    let expensesThisMonth = 0;
    
    cars.forEach(car => {
      incomeThisMonth += car.incomeHistory
        .filter(e => new Date(e.date) >= startOfMonth)
        .reduce((s, e) => s + e.amount, 0);
      
      expensesThisMonth += car.expenseHistory
        .filter(e => new Date(e.date) >= startOfMonth)
        .reduce((s, e) => s + e.cost, 0);
      
      expensesThisMonth += car.damageHistory
        .filter(e => new Date(e.date) >= startOfMonth)
        .reduce((s, e) => s + e.cost, 0);
    });
    
    res.json({
      incomeThisMonth,
      expensesThisMonth,
      profitThisMonth: incomeThisMonth - expensesThisMonth,
      activeCars: cars.length,
      damagedCars: cars.filter(c => c.damageHistory.some(d => d.status === 'still damaged')).length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};