const Car = require('../models/Car');

exports.addExpense = async (req, res) => {
  try {
    const { date, type, description, cost } = req.body;
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    car.expenseHistory.push({ 
      date: date || new Date(), 
      type: type || 'other', 
      description: description || '', 
      cost,
      recordedAt: new Date()
    });
    
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    const sorted = car.expenseHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};