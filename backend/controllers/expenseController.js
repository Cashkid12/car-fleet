const Car = require('../models/Car');

exports.addExpense = async (req, res) => {
  try {
    const { date, type, description, cost } = req.body;
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    car.expenseHistory.push({ date, type, description, cost });
    await car.save();
    
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car.expenseHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};