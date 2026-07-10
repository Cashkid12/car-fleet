const Car = require('../models/Car');
const activityLogger = require('../utils/activityLogger');
const notificationService = require('../utils/notificationService');

// GET all cars with search, filter, sort
exports.getAllCars = async (req, res) => {
  try {
    const { search, status, sort } = req.query;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const query = { clerkUserId: req.auth.userId };

    if (search) {
      query.$or = [
        { plateNumber: { $regex: search, $options: 'i' } },
        { driverName: { $regex: search, $options: 'i' } }
      ];
    }

    let cars = await Car.find(query).sort({ createdAt: -1 });

    let carsWithStats = cars.map(car => {
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
      const hasActiveDamage = carObj.damageHistory.some(d => d.status !== 'fixed');

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
        createdAt: carObj.createdAt,
        updatedAt: carObj.updatedAt
      };
    });

    if (status === 'healthy') carsWithStats = carsWithStats.filter(c => c.status === 'healthy');
    else if (status === 'damaged') carsWithStats = carsWithStats.filter(c => c.status === 'damaged');

    if (sort === 'profit_high') carsWithStats.sort((a, b) => b.profitThisMonth - a.profitThisMonth);
    else if (sort === 'profit_low') carsWithStats.sort((a, b) => a.profitThisMonth - b.profitThisMonth);
    else if (sort === 'oldest') carsWithStats.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

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
    const hasActiveDamage = carObj.damageHistory.some(d => d.status !== 'fixed');
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
      plateNumber, passengerCapacity, driverName, driverPhone,
      clerkUserId: req.auth.userId
    });

    await activityLogger.log(req.auth.userId, 'car_added',
      activityLogger.carAdded(req.auth.userId, car)
    );

    await notificationService.create(req.auth.userId,
      notificationService.vehicleAdded(req.auth.userId, car)
    );

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

    await activityLogger.log(req.auth.userId, 'car_updated',
      activityLogger.carUpdated(req.auth.userId, car)
    );

    await notificationService.create(req.auth.userId,
      notificationService.vehicleUpdated(req.auth.userId, car)
    );

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

    await activityLogger.log(req.auth.userId, 'car_deleted',
      activityLogger.carDeleted(req.auth.userId, car.plateNumber)
    );

    await notificationService.create(req.auth.userId,
      notificationService.vehicleDeleted(req.auth.userId, car.plateNumber)
    );

    res.json({ message: 'Car deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET car summary
exports.getCarSummary = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const totalIncome = car.incomeHistory.reduce((s, e) => s + e.amount, 0);
    const totalDamageCost = car.damageHistory.reduce((s, e) => s + e.cost, 0);
    const totalExpenses = car.expenseHistory.reduce((s, e) => s + e.cost, 0) + totalDamageCost;

    const incomeThisMonth = car.incomeHistory.filter(e => new Date(e.date) >= startOfMonth).reduce((s, e) => s + e.amount, 0);
    const expensesThisMonth = car.expenseHistory.filter(e => new Date(e.date) >= startOfMonth).reduce((s, e) => s + e.cost, 0) +
      car.damageHistory.filter(e => new Date(e.date) >= startOfMonth).reduce((s, e) => s + e.cost, 0);

    const incomeThisYear = car.incomeHistory.filter(e => new Date(e.date) >= startOfYear).reduce((s, e) => s + e.amount, 0);
    const hasActiveDamage = car.damageHistory.some(d => d.status !== 'fixed');
    const activeDamages = car.damageHistory.filter(d => d.status !== 'fixed').length;

    const monthlyBreakdown = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const monthLabel = d.toLocaleDateString('en', { month: 'short' });
      const income = car.incomeHistory.filter(e => { const ed = new Date(e.date); return ed >= monthStart && ed <= monthEnd; }).reduce((s, e) => s + e.amount, 0);
      const expenses = car.expenseHistory.filter(e => { const ed = new Date(e.date); return ed >= monthStart && ed <= monthEnd; }).reduce((s, e) => s + e.cost, 0) +
        car.damageHistory.filter(e => { const ed = new Date(e.date); return ed >= monthStart && ed <= monthEnd; }).reduce((s, e) => s + e.cost, 0);
      monthlyBreakdown.push({ month: monthLabel, income, expenses, profit: income - expenses });
    }

    res.json({
      totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses,
      totalDamageCost, activeDamages, incomeThisMonth, expensesThisMonth,
      profitThisMonth: incomeThisMonth - expensesThisMonth, incomeThisYear,
      status: hasActiveDamage ? 'damaged' : 'healthy', monthlyBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET car timeline
exports.getCarTimeline = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const timeline = [
      ...car.incomeHistory.map(e => ({
        type: 'income', title: 'Income Collected',
        description: e.note || `KES ${e.amount.toLocaleString()}`,
        amount: e.amount, date: e.date, recordedAt: e.recordedAt,
        icon: 'currency-dollar', color: 'success'
      })),
      ...car.damageHistory.map(e => ({
        type: e.status === 'fixed' ? 'damage_fixed' : 'damage',
        title: e.status === 'fixed' ? 'Damage Fixed' : 'Damage Reported',
        description: `${e.damageType} — KES ${e.cost.toLocaleString()}`,
        amount: e.cost, date: e.date, recordedAt: e.recordedAt,
        damageStatus: e.status, damageId: e._id,
        icon: 'exclamation-triangle', color: e.status === 'fixed' ? 'success' : 'danger'
      })),
      ...car.expenseHistory.map(e => ({
        type: 'expense', title: `Expense — ${e.type}`,
        description: e.description || `KES ${e.cost.toLocaleString()}`,
        amount: e.cost, date: e.date, recordedAt: e.recordedAt,
        icon: 'receipt-percent', color: 'danger'
      }))
    ].sort((a, b) => new Date(b.date || b.recordedAt) - new Date(a.date || a.recordedAt));

    res.json(timeline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};