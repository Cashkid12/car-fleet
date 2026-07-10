const Car = require('../models/Car');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const UserSettings = require('../models/UserSettings');

// POST /api/sync — receive batch of offline records
exports.syncData = async (req, res) => {
  try {
    const { operations, clientId, deviceId } = req.body;
    const clerkUserId = req.auth.userId;
    const results = { synced: [], failed: [], conflicts: [] };

    for (const op of operations) {
      try {
        switch (op.type) {
          case 'create_income': {
            const car = await Car.findOne({ _id: op.carId, clerkUserId });
            if (!car) { results.failed.push({ ...op, reason: 'Car not found' }); break; }
            
            // Check for duplicate by reference number
            const exists = car.incomeHistory.some(e => e.referenceNumber === op.payload.referenceNumber);
            if (exists) { results.synced.push({ ...op, status: 'already_synced' }); break; }

            car.incomeHistory.push({
              date: op.payload.date, amount: op.payload.amount,
              paymentMethod: op.payload.paymentMethod || 'cash',
              referenceNumber: op.payload.referenceNumber,
              note: op.payload.note || '', recordedAt: op.payload.recordedAt || new Date()
            });
            await car.save();
            results.synced.push({ ...op, status: 'synced', serverId: car.incomeHistory[car.incomeHistory.length - 1]._id });
            break;
          }

          case 'create_expense': {
            const car = await Car.findOne({ _id: op.carId, clerkUserId });
            if (!car) { results.failed.push({ ...op, reason: 'Car not found' }); break; }

            const exists = car.expenseHistory.some(e => e.referenceNumber === op.payload.referenceNumber);
            if (exists) { results.synced.push({ ...op, status: 'already_synced' }); break; }

            car.expenseHistory.push({
              date: op.payload.date, type: op.payload.type,
              description: op.payload.description || '', cost: op.payload.cost,
              referenceNumber: op.payload.referenceNumber,
              note: op.payload.note || '', recordedAt: op.payload.recordedAt || new Date()
            });
            await car.save();
            results.synced.push({ ...op, status: 'synced', serverId: car.expenseHistory[car.expenseHistory.length - 1]._id });
            break;
          }

          case 'create_damage': {
            const car = await Car.findOne({ _id: op.carId, clerkUserId });
            if (!car) { results.failed.push({ ...op, reason: 'Car not found' }); break; }

            const exists = car.damageHistory.some(e => e.referenceNumber === op.payload.referenceNumber);
            if (exists) { results.synced.push({ ...op, status: 'already_synced' }); break; }

            car.damageHistory.push({
              date: op.payload.date, damageType: op.payload.damageType,
              description: op.payload.description || '', estimatedCost: op.payload.estimatedCost,
              driverAtFault: op.payload.driverAtFault || false,
              referenceNumber: op.payload.referenceNumber,
              note: op.payload.note || '', status: 'reported', recordedAt: op.payload.recordedAt || new Date()
            });
            car.status = 'damaged';
            await car.save();
            results.synced.push({ ...op, status: 'synced', serverId: car.damageHistory[car.damageHistory.length - 1]._id });
            break;
          }

          case 'create_car': {
            const exists = await Car.findOne({ plateNumber: op.payload.plateNumber, clerkUserId });
            if (exists) { results.synced.push({ ...op, status: 'already_synced', serverId: exists._id }); break; }

            const car = await Car.create({
              plateNumber: op.payload.plateNumber,
              passengerCapacity: op.payload.passengerCapacity,
              driverName: op.payload.driverName,
              driverPhone: op.payload.driverPhone,
              clerkUserId
            });
            results.synced.push({ ...op, status: 'synced', serverId: car._id });
            break;
          }

          case 'update_settings': {
            await UserSettings.findOneAndUpdate(
              { clerkUserId },
              op.payload,
              { upsert: true }
            );
            results.synced.push({ ...op, status: 'synced' });
            break;
          }

          default:
            results.failed.push({ ...op, reason: 'Unknown operation type' });
        }
      } catch (err) {
        results.failed.push({ ...op, reason: err.message });
      }
    }

    // Get updated data to return
    const cars = await Car.find({ clerkUserId });
    const activities = await Activity.find({ clerkUserId }).sort({ createdAt: -1 }).limit(20);
    const notifications = await Notification.find({ clerkUserId }).sort({ createdAt: -1 }).limit(20);
    const settings = await UserSettings.findOne({ clerkUserId });

    res.json({
      results,
      updatedData: { cars, activities, notifications, settings },
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sync/status
exports.getSyncStatus = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const cars = await Car.find({ clerkUserId });
    const totalRecords = cars.reduce((s, c) => s + c.incomeHistory.length + c.expenseHistory.length + c.damageHistory.length, 0);

    res.json({
      lastSync: new Date().toISOString(),
      totalCars: cars.length,
      totalRecords,
      serverVersion: '2.0.0',
      status: 'ready'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};