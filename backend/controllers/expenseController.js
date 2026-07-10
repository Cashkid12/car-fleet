const Car = require('../models/Car');
const activityLogger = require('../utils/activityLogger');
const notificationService = require('../utils/notificationService');

const generateExpenseRef = async () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const prefix = `EXP-${dateStr}-`;
  const cars = await Car.find({ 'expenseHistory.referenceNumber': { $regex: `^${prefix}` } });
  let maxNum = 0;
  cars.forEach(car => { car.expenseHistory.forEach(e => { if (e.referenceNumber && e.referenceNumber.startsWith(prefix)) { const num = parseInt(e.referenceNumber.split('-').pop()); if (num > maxNum) maxNum = num; } }); });
  return `${prefix}${String(maxNum + 1).padStart(4, '0')}`;
};

exports.addExpense = async (req, res) => {
  try {
    const { date, type, description, cost, note } = req.body;
    if (!cost || cost < 0) return res.status(400).json({ message: 'Valid cost required' });
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const referenceNumber = await generateExpenseRef();

    car.expenseHistory.push({
      date: date || new Date(), type: type || 'other',
      description: description || '', cost: Number(cost),
      referenceNumber, note: note || '', recordedAt: new Date()
    });
    await car.save();

    await activityLogger.log(req.auth.userId, 'expense_added',
      activityLogger.expenseAdded(req.auth.userId, car, type || 'other', cost)
    );

    await notificationService.create(req.auth.userId,
      notificationService.expenseAdded(req.auth.userId, car, type || 'other', cost, referenceNumber)
    );

    const savedEntry = car.expenseHistory[car.expenseHistory.length - 1];
    res.status(201).json({ entry: savedEntry, car: { _id: car._id, plateNumber: car.plateNumber, driverName: car.driverName } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { type, description, cost, note } = req.body;
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const expense = car.expenseHistory.id(req.params.expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense entry not found' });
    if (type) expense.type = type;
    if (description) expense.description = description;
    if (cost !== undefined) expense.cost = cost;
    if (note !== undefined) expense.note = note;
    expense.updatedAt = new Date();
    await car.save();
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    car.expenseHistory.pull(req.params.expenseId);
    await car.save();
    res.json({ message: 'Expense entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const { search, category, sort, page = 1, limit = 20 } = req.query;
    const cars = await Car.find({ clerkUserId: req.auth.userId });
    let allExpenses = [];
    cars.forEach(car => {
      car.expenseHistory.forEach(entry => {
        allExpenses.push({
          _id: entry._id, carId: car._id, plateNumber: car.plateNumber,
          driverName: car.driverName, date: entry.date, type: entry.type,
          description: entry.description, cost: entry.cost,
          referenceNumber: entry.referenceNumber, note: entry.note,
          recordedAt: entry.recordedAt, updatedAt: entry.updatedAt
        });
      });
    });
    if (search) { const s = search.toLowerCase(); allExpenses = allExpenses.filter(e => e.plateNumber.toLowerCase().includes(s) || e.type.toLowerCase().includes(s) || (e.referenceNumber && e.referenceNumber.toLowerCase().includes(s))); }
    if (category) allExpenses = allExpenses.filter(e => e.type === category);
    if (sort === 'oldest') allExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sort === 'highest') allExpenses.sort((a, b) => b.cost - a.cost);
    else allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    const total = allExpenses.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    res.json({ expenses: allExpenses.slice(startIndex, startIndex + Number(limit)), pagination: { page: Number(page), limit: Number(limit), total, totalPages } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const sorted = [...car.expenseHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};