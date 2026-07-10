const Activity = require('../models/Activity');

const activityLogger = {
  async log(clerkUserId, type, { title, description, carId, plateNumber, amount, metadata = {} }) {
    try {
      await Activity.create({
        clerkUserId,
        type,
        title,
        description,
        carId,
        plateNumber: plateNumber || '',
        amount: amount || null,
        metadata
      });
    } catch (error) {
      console.error('Activity log failed:', error.message);
    }
  },

  incomeAdded: (clerkUserId, car, amount) => ({
    clerkUserId,
    type: 'income_added',
    title: 'Income Added',
    description: `KES ${amount.toLocaleString()}`,
    carId: car._id,
    plateNumber: car.plateNumber,
    amount
  }),

  expenseAdded: (clerkUserId, car, type, cost) => ({
    clerkUserId,
    type: 'expense_added',
    title: 'Expense Added',
    description: `${type} — KES ${cost.toLocaleString()}`,
    carId: car._id,
    plateNumber: car.plateNumber,
    amount: cost
  }),

  damageReported: (clerkUserId, car, damageType, cost) => ({
    clerkUserId,
    type: 'damage_reported',
    title: 'Damage Reported',
    description: `${damageType} — KES ${cost.toLocaleString()}`,
    carId: car._id,
    plateNumber: car.plateNumber,
    amount: cost
  }),

  damageFixed: (clerkUserId, car, damageType) => ({
    clerkUserId,
    type: 'damage_fixed',
    title: 'Damage Fixed',
    description: damageType,
    carId: car._id,
    plateNumber: car.plateNumber
  }),

  carAdded: (clerkUserId, car) => ({
    clerkUserId,
    type: 'car_added',
    title: 'New Car Added',
    description: `${car.plateNumber} — ${car.driverName}`,
    carId: car._id,
    plateNumber: car.plateNumber
  }),

  carUpdated: (clerkUserId, car) => ({
    clerkUserId,
    type: 'car_updated',
    title: 'Car Updated',
    description: car.plateNumber,
    carId: car._id,
    plateNumber: car.plateNumber
  }),

  carDeleted: (clerkUserId, plateNumber) => ({
    clerkUserId,
    type: 'car_deleted',
    title: 'Car Deleted',
    description: plateNumber,
    plateNumber
  })
};

module.exports = activityLogger;