const Car = require('../models/Car');
const activityLogger = require('../utils/activityLogger');
const notificationService = require('../utils/notificationService');

const generateDamageRef = async () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const prefix = `DMG-${dateStr}-`;
  const cars = await Car.find({ 'damageHistory.referenceNumber': { $regex: `^${prefix}` } });
  let maxNum = 0;
  cars.forEach(car => { car.damageHistory.forEach(d => { if (d.referenceNumber && d.referenceNumber.startsWith(prefix)) { const num = parseInt(d.referenceNumber.split('-').pop()); if (num > maxNum) maxNum = num; } }); });
  return `${prefix}${String(maxNum + 1).padStart(4, '0')}`;
};

exports.addDamage = async (req, res) => {
  try {
    const { date, damageType, description, estimatedCost, driverAtFault, note } = req.body;
    if (!estimatedCost || estimatedCost < 0) return res.status(400).json({ message: 'Valid cost required' });
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const referenceNumber = await generateDamageRef();

    car.damageHistory.push({
      date: date || new Date(),
      damageType,
      description: description || '',
      estimatedCost: Number(estimatedCost),
      driverAtFault: driverAtFault === true || driverAtFault === 'true',
      referenceNumber,
      note: note || '',
      status: 'reported',
      recordedAt: new Date()
    });
    car.status = 'damaged';
    await car.save();

    await activityLogger.log(req.auth.userId, 'damage_reported',
      activityLogger.damageReported(req.auth.userId, car, damageType, estimatedCost)
    );

    await notificationService.create(req.auth.userId,
      notificationService.damageReported(req.auth.userId, car, damageType, estimatedCost, referenceNumber)
    );

    const savedEntry = car.damageHistory[car.damageHistory.length - 1];
    res.status(201).json({ entry: savedEntry, car: { _id: car._id, plateNumber: car.plateNumber, driverName: car.driverName } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDamage = async (req, res) => {
  try {
    const { status, actualCost, description, note } = req.body;
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const damage = car.damageHistory.id(req.params.damageId);
    if (!damage) return res.status(404).json({ message: 'Damage entry not found' });

    if (status) damage.status = status;
    if (actualCost !== undefined) damage.actualCost = actualCost;
    if (description) damage.description = description;
    if (note !== undefined) damage.note = note;
    damage.updatedAt = new Date();

    const hasActiveDamage = car.damageHistory.some(d => d.status !== 'fixed');
    car.status = hasActiveDamage ? 'damaged' : 'healthy';
    await car.save();

    if (status === 'in_progress') {
      await notificationService.create(req.auth.userId,
        notificationService.repairStarted(req.auth.userId, car, damage.damageType)
      );
    } else if (status === 'fixed') {
      await notificationService.create(req.auth.userId,
        notificationService.repairCompleted(req.auth.userId, car, damage.damageType)
      );
    }

    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDamage = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    car.damageHistory.pull(req.params.damageId);
    const hasActiveDamage = car.damageHistory.some(d => d.status !== 'fixed');
    car.status = hasActiveDamage ? 'damaged' : 'healthy';
    await car.save();
    res.json({ message: 'Damage entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDamages = async (req, res) => {
  try {
    const { search, status, sort, page = 1, limit = 20 } = req.query;
    const cars = await Car.find({ clerkUserId: req.auth.userId });
    let allDamages = [];
    cars.forEach(car => {
      car.damageHistory.forEach(entry => {
        allDamages.push({
          _id: entry._id, carId: car._id, plateNumber: car.plateNumber,
          driverName: car.driverName, date: entry.date, damageType: entry.damageType,
          description: entry.description, estimatedCost: entry.estimatedCost,
          actualCost: entry.actualCost, status: entry.status,
          driverAtFault: entry.driverAtFault, referenceNumber: entry.referenceNumber,
          note: entry.note, recordedAt: entry.recordedAt, updatedAt: entry.updatedAt
        });
      });
    });
    if (search) { const s = search.toLowerCase(); allDamages = allDamages.filter(d => d.plateNumber.toLowerCase().includes(s) || d.damageType.toLowerCase().includes(s) || (d.referenceNumber && d.referenceNumber.toLowerCase().includes(s))); }
    if (status) allDamages = allDamages.filter(d => d.status === status);
    if (sort === 'oldest') allDamages.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sort === 'highest') allDamages.sort((a, b) => b.estimatedCost - a.estimatedCost);
    else allDamages.sort((a, b) => new Date(b.date) - new Date(a.date));
    const total = allDamages.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    res.json({ damages: allDamages.slice(startIndex, startIndex + Number(limit)), pagination: { page: Number(page), limit: Number(limit), total, totalPages } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDamages = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, clerkUserId: req.auth.userId });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const sorted = [...car.damageHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMaintenanceSummary = async (req, res) => {
  try {
    const cars = await Car.find({ clerkUserId: req.auth.userId });
    const healthy = cars.filter(c => !c.damageHistory.some(d => d.status !== 'fixed')).length;
    const damaged = cars.filter(c => c.damageHistory.some(d => d.status !== 'fixed')).length;
    const pendingRepairs = cars.reduce((s, c) => s + c.damageHistory.filter(d => d.status === 'reported' || d.status === 'in_progress').length, 0);
    const totalRepairCost = cars.reduce((s, c) => s + c.damageHistory.reduce((ss, d) => ss + (d.actualCost || d.estimatedCost || 0), 0), 0);
    res.json({ healthyVehicles: healthy, damagedVehicles: damaged, pendingRepairs, totalRepairCost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};