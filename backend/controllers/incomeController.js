const Car = require('../models/Car');
const activityLogger = require('../utils/activityLogger');
const notificationService = require('../utils/notificationService');

const generateReference = async () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const prefix = `INC-${dateStr}-`;
  const latestCar = await Car.findOne(
    { 'incomeHistory.referenceNumber': { $regex: `^${prefix}` } },
    { 'incomeHistory.$': 1 }
  ).sort({ 'incomeHistory.recordedAt': -1 });
  let nextNum = 1;
  if (latestCar && latestCar.incomeHistory.length > 0) {
    const latestRef = latestCar.incomeHistory[0].referenceNumber;
    const numPart = parseInt(latestRef.split('-').pop());
    if (!isNaN(numPart)) nextNum = numPart + 1;
  }
  return `${prefix}${String(nextNum).padStart(4, '0')}`;
};

exports.addIncome = async (req, res) => {
  try {
    const { date, amount, paymentMethod, note } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const referenceNumber = await generateReference();

    car.incomeHistory.push({
      date: date || new Date(), amount: Number(amount),
      paymentMethod: paymentMethod || 'cash', referenceNumber,
      note: note || '', recordedAt: new Date()
    });
    await car.save();

    await activityLogger.log(req.auth.userId, 'income_added',
      activityLogger.incomeAdded(req.auth.userId, car, amount)
    );

    await notificationService.create(req.auth.userId,
      notificationService.incomeAdded(req.auth.userId, car, amount, referenceNumber)
    );

    const savedEntry = car.incomeHistory[car.incomeHistory.length - 1];
    res.status(201).json({ entry: savedEntry, car: { _id: car._id, plateNumber: car.plateNumber, driverName: car.driverName } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllIncome = async (req, res) => {
  try {
    const { search, vehicle, startDate, endDate, paymentMethod, sort, page = 1, limit = 20 } = req.query;
    const cars = await Car.find({ clerkUserId: req.auth.userId });
    let allIncome = [];
    cars.forEach(car => {
      car.incomeHistory.forEach(entry => {
        allIncome.push({
          _id: entry._id, carId: car._id, plateNumber: car.plateNumber,
          driverName: car.driverName, date: entry.date, amount: entry.amount,
          paymentMethod: entry.paymentMethod, referenceNumber: entry.referenceNumber,
          note: entry.note, recordedAt: entry.recordedAt, updatedAt: entry.updatedAt
        });
      });
    });

    if (search) {
      const s = search.toLowerCase();
      allIncome = allIncome.filter(i => i.plateNumber.toLowerCase().includes(s) || i.driverName.toLowerCase().includes(s) || (i.referenceNumber && i.referenceNumber.toLowerCase().includes(s)));
    }
    if (vehicle) allIncome = allIncome.filter(i => i.carId === vehicle);
    if (startDate) allIncome = allIncome.filter(i => new Date(i.date) >= new Date(startDate));
    if (endDate) allIncome = allIncome.filter(i => new Date(i.date) <= new Date(endDate));
    if (paymentMethod) allIncome = allIncome.filter(i => i.paymentMethod === paymentMethod);

    if (sort === 'oldest') allIncome.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sort === 'highest') allIncome.sort((a, b) => b.amount - a.amount);
    else if (sort === 'lowest') allIncome.sort((a, b) => a.amount - b.amount);
    else allIncome.sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = allIncome.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedIncome = allIncome.slice(startIndex, startIndex + Number(limit));

    res.json({ income: paginatedIncome, pagination: { page: Number(page), limit: Number(limit), total, totalPages } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIncomeSummary = async (req, res) => {
  try {
    const cars = await Car.find({ clerkUserId: req.auth.userId });
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayIncome = 0, weeklyIncome = 0, monthlyIncome = 0, totalIncome = 0;
    const chartData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const monthLabel = d.toLocaleDateString('en', { month: 'short' });
      let monthIncome = 0;
      cars.forEach(car => { monthIncome += car.incomeHistory.filter(e => { const ed = new Date(e.date); return ed >= monthStart && ed <= monthEnd; }).reduce((s, e) => s + e.amount, 0); });
      chartData.push({ month: monthLabel, income: monthIncome });
    }

    cars.forEach(car => {
      car.incomeHistory.forEach(entry => {
        const entryDate = new Date(entry.date);
        totalIncome += entry.amount;
        if (entryDate >= startOfToday) todayIncome += entry.amount;
        if (entryDate >= startOfWeek) weeklyIncome += entry.amount;
        if (entryDate >= startOfMonth) monthlyIncome += entry.amount;
      });
    });

    res.json({ todayIncome, weeklyIncome, monthlyIncome, totalIncome, chartData });
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
    const filtered = car.incomeHistory.filter(e => { const d = new Date(e.date); return (!start || d >= new Date(start)) && (!end || d <= new Date(end)); });
    const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateIncome = async (req, res) => {
  try {
    const { amount, paymentMethod, note } = req.body;
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const income = car.incomeHistory.id(req.params.incomeId);
    if (!income) return res.status(404).json({ message: 'Income entry not found' });
    if (amount) income.amount = amount;
    if (paymentMethod) income.paymentMethod = paymentMethod;
    if (note !== undefined) income.note = note;
    income.updatedAt = new Date();
    await car.save();
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    car.incomeHistory.pull(req.params.incomeId);
    await car.save();
    res.json({ message: 'Income entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};