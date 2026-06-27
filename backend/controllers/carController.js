const Car = require('../models/Car');

// GET all cars for the authenticated user
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find({ clerkUserId: req.auth.userId }).sort({ createdAt: -1 });
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const carsWithStats = cars.map(car => {
      const carObj = car.toObject();
      
      const incomeThisMonth = carObj.incomeHistory
        .filter(e => new Date(e.date) >= startOfMonth)
        .reduce((s, e) => s + e.amount, 0);
      
      const damageCostThisMonth = carObj.damageHistory
        .filter(e => new Date(e.date) >= startOfMonth)
        .reduce((s, e) => s + e.cost, 0);
      
      const expensesThisMonth = carObj.expenseHistory
        .filter(e => new Date(e.date) >= startOfMonth)
        .reduce((s, e) => s + e.cost, 0) + damageCostThisMonth;
      
      const hasActiveDamage = carObj.damageHistory.some(d => d.status === 'still damaged');
      
      return {
        _id: carObj._id,
        plateNumber: carObj.plateNumber,
        passengerCapacity: carObj.passengerCapacity,
        driverName: carObj.driverName,
        driverPhone: carObj.driverPhone,
        status: hasActiveDamage ? 'damaged' : 'healthy',
        incomeThisMonth,
        expensesThisMonth,
        profitThisMonth: incomeThisMonth - expensesThisMonth,
        createdAt: carObj.createdAt
      };
    });
    
    res.json(carsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single car with FULL history
exports.getCar = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    const carObj = car.toObject();
    
    // Update status based on current damages
    const hasActiveDamage = carObj.damageHistory.some(d => d.status === 'still damaged');
    carObj.status = hasActiveDamage ? 'damaged' : 'healthy';
    
    res.json(carObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE car
exports.createCar = async (req, res) => {
  try {
    const { plateNumber, passengerCapacity, driverName, driverPhone } = req.body;
    
    const car = await Car.create({
      plateNumber,
      passengerCapacity,
      driverName,
      driverPhone,
      clerkUserId: req.auth.userId
    });
    
    res.status(201).json(car);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A car with this plate number already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// UPDATE car
exports.updateCar = async (req, res) => {
  try {
    const { plateNumber, passengerCapacity, driverName, driverPhone } = req.body;
    
    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, clerkUserId: req.auth.userId },
      { plateNumber, passengerCapacity, driverName, driverPhone },
      { new: true, runValidators: true }
    );
    
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A car with this plate number already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// DELETE car
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findOneAndDelete({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json({ message: 'Car deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};