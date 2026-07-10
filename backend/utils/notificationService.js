const notificationService = {
  async create(clerkUserId, { type, title, message, priority = 'medium', relatedId = null, relatedType = '', plateNumber = '', referenceNumber = '', metadata = {} }) {
    try {
      // Check notification preferences
      const UserSettings = require('../models/UserSettings');
      const settings = await UserSettings.findOne({ clerkUserId });
      if (settings && settings.notificationPreferences) {
        const prefs = settings.notificationPreferences;
        if ((type.includes('income')) && !prefs.income) return;
        if ((type.includes('expense')) && !prefs.expense) return;
        if ((type.includes('damage') || type.includes('repair')) && !prefs.damage) return;
        if ((type.includes('vehicle')) && !prefs.vehicle) return;
        if ((type.includes('report')) && !prefs.reports) return;
        if ((type.includes('system')) && !prefs.system) return;
      }

      const Notification = require('../models/Notification');
      await Notification.create({
        clerkUserId, type, title, message, priority,
        relatedId, relatedType, plateNumber, referenceNumber, metadata
      });
    } catch (error) {
      console.error('Notification creation failed:', error.message);
    }
  },

  incomeAdded: (clerkUserId, car, amount, referenceNumber) => ({
    clerkUserId, type: 'income_added', priority: 'low',
    title: 'Income Recorded',
    message: `KES ${amount.toLocaleString()} collected from ${car.plateNumber}`,
    relatedId: car._id, relatedType: 'car', plateNumber: car.plateNumber, referenceNumber
  }),

  expenseAdded: (clerkUserId, car, type, cost, referenceNumber) => ({
    clerkUserId, type: 'expense_added', priority: 'low',
    title: 'Expense Added',
    message: `${type} — KES ${cost.toLocaleString()} for ${car.plateNumber}`,
    relatedId: car._id, relatedType: 'car', plateNumber: car.plateNumber, referenceNumber
  }),

  damageReported: (clerkUserId, car, damageType, cost, referenceNumber) => ({
    clerkUserId, type: 'damage_reported', priority: 'high',
    title: 'Damage Reported',
    message: `${damageType} on ${car.plateNumber} — KES ${cost.toLocaleString()}`,
    relatedId: car._id, relatedType: 'car', plateNumber: car.plateNumber, referenceNumber
  }),

  repairStarted: (clerkUserId, car, damageType) => ({
    clerkUserId, type: 'repair_started', priority: 'medium',
    title: 'Repair Started',
    message: `${damageType} repair started for ${car.plateNumber}`,
    relatedId: car._id, relatedType: 'car', plateNumber: car.plateNumber
  }),

  repairCompleted: (clerkUserId, car, damageType) => ({
    clerkUserId, type: 'repair_completed', priority: 'medium',
    title: 'Repair Completed',
    message: `${damageType} on ${car.plateNumber} has been fixed`,
    relatedId: car._id, relatedType: 'car', plateNumber: car.plateNumber
  }),

  vehicleAdded: (clerkUserId, car) => ({
    clerkUserId, type: 'vehicle_added', priority: 'medium',
    title: 'Vehicle Added',
    message: `${car.plateNumber} — ${car.driverName} added to your fleet`,
    relatedId: car._id, relatedType: 'car', plateNumber: car.plateNumber
  }),

  vehicleUpdated: (clerkUserId, car) => ({
    clerkUserId, type: 'vehicle_updated', priority: 'low',
    title: 'Vehicle Updated',
    message: `${car.plateNumber} details updated`,
    relatedId: car._id, relatedType: 'car', plateNumber: car.plateNumber
  }),

  vehicleDeleted: (clerkUserId, plateNumber) => ({
    clerkUserId, type: 'vehicle_deleted', priority: 'medium',
    title: 'Vehicle Removed',
    message: `${plateNumber} removed from your fleet`,
    plateNumber
  }),

  reportGenerated: (clerkUserId, reportType) => ({
    clerkUserId, type: 'report_generated', priority: 'low',
    title: 'Report Generated',
    message: `${reportType} report is ready`,
    relatedType: 'report'
  }),
};

module.exports = notificationService;