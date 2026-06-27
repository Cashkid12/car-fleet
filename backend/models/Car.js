const mongoose = require('mongoose');

const incomeEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  amount: { type: Number, required: true, min: 0 },
  note: { type: String, default: '' },
  recordedAt: { type: Date, default: Date.now }
});

const damageEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  damageType: { type: String, required: true },
  description: { type: String, default: '' },
  cost: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['fixed', 'still damaged'],
    default: 'still damaged'
  },
  driverAtFault: { type: String, default: '' },
  recordedAt: { type: Date, default: Date.now }
});

const expenseEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  type: {
    type: String,
    required: true,
    enum: ['maintenance', 'fuel', 'insurance', 'tires', 'other']
  },
  description: { type: String, default: '' },
  cost: { type: Number, required: true, min: 0 },
  recordedAt: { type: Date, default: Date.now }
});

const carSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: [true, 'Plate number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  passengerCapacity: {
    type: Number,
    required: [true, 'Passenger capacity is required'],
    min: 1
  },
  driverName: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true
  },
  driverPhone: {
    type: String,
    required: [true, 'Driver phone is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['healthy', 'damaged'],
    default: 'healthy'
  },
  incomeHistory: [incomeEntrySchema],
  damageHistory: [damageEntrySchema],
  expenseHistory: [expenseEntrySchema],
  clerkUserId: {
    type: String,
    required: true,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);