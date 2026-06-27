const Car = require('../models/Car');

exports.addIncome = async (req, res) => {
  try {
    const { date, amount, note } = req.body;
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    car.incomeHistory.push({
      date: date || new Date(),
      amount,
      note: note || '',
      recordedAt: new Date()
    });
    
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIncome = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    const sorted = [...car.incomeHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIncomeRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    const filtered = car.incomeHistory.filter(e => {
      const d = new Date(e.date);
      return (!start || d >= new Date(start)) && (!end || d <= new Date(end));
    });
    
    const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};