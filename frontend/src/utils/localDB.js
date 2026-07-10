import Dexie from 'dexie';

const db = new Dexie('FleetManagerDB');

db.version(1).stores({
  cars: '&_id, plateNumber, driverName, status, clerkUserId',
  income: '&_id, carId, date, amount, referenceNumber',
  expenses: '&_id, carId, date, type, referenceNumber',
  damages: '&_id, carId, date, damageType, referenceNumber',
  activities: '&_id, createdAt',
  notifications: '&_id, createdAt',
  dashboardSummary: '&_id',
  settings: '&clerkUserId',
  syncQueue: '++id, type, status, createdAt'
});

export default db;