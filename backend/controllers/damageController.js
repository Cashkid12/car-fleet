const Car = require('../models/Car');

exports.addDamage = async (req, res) => {
  try {
    const { date, damageType, description, cost, status, driverAtFault } = req.body;
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    car.damageHistory.push({ date, damageType, description, cost, status, driverAtFault });
    
    // Update car status
    const hasActiveDamage = car.damageHistory.some(d => d.status === 'still damaged');
    car.status = hasActiveDamage ? 'damaged' : 'healthy';
    
    await car.save();
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDamage = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    const damage = car.damageHistory.id(req.params.damageId);
    if (!damage) return res.status(404).json({ message: 'Damage entry not found' });
    
    damage.status = 'fixed';
    
    // Update car status
    const hasActiveDamage = car.damageHistory.some(d => d.status === 'still damaged');
    car.status = hasActiveDamage ? 'damaged' : 'healthy';
    
    await car.save();
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDamages = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car.damageHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};