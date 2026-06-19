require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { requireAuth } = require('@clerk/express');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Health check — NOT protected
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protect all /api routes with Clerk
app.use('/api', requireAuth());

// Routes
app.use('/api/cars', require('./routes/cars'));
app.use('/api/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});