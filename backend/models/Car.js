const mongoose = require('mongoose');

const incomeEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  amount: { type: Number, required: true, min: 1 },
  paymentMethod: { type: String, enum: ['cash', 'mpesa', 'bank', 'other'], default: 'cash' },
  referenceNumber: { type: String, unique: true, sparse: true },
  note: { type: String, default: '' },
  recordedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

const damageEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  damageType: { type: String, required: true },
  description: { type: String, default: '' },
  estimatedCost: { type: Number, default: 0, min: 0 },
  actualCost: { type: Number, default: null },
  status: { type: String, enum: ['reported', 'in_progress', 'fixed'], default: 'reported' },
  driverAtFault: { type: Boolean, default: false },
  referenceNumber: { type: String, unique: true, sparse: true },
  note: { type: String, default: '' },
  recordedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

const expenseEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  type: { type: String, required: true, enum: ['maintenance', 'fuel', 'insurance', 'tires', 'repair', 'oil_service', 'inspection', 'fine', 'parking', 'car_wash', 'other'] },
  description: { type: String, default: '' },
  cost: { type: Number, required: true, min: 0 },
  referenceNumber: { type: String, unique: true, sparse: true },
  note: { type: String, default: '' },
  recordedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

const carSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  passengerCapacity: { type: Number, required: true, min: 1 },
  driverName: { type: String, required: true, trim: true },
  driverPhone: { type: String, required: true, trim: true },
  status: { type: String, enum: ['healthy', 'damaged'], default: 'healthy' },
  incomeHistory: [incomeEntrySchema],
  damageHistory: [damageEntrySchema],
  expenseHistory: [expenseEntrySchema],
  clerkUserId: { type: String, required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);