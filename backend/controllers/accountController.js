const UserSettings = require('../models/UserSettings');
const Car = require('../models/Car');

// Get or create settings
const getSettings = async (clerkUserId) => {
  let settings = await UserSettings.findOne({ clerkUserId });
  if (!settings) {
    settings = await UserSettings.create({ clerkUserId });
  }
  return settings;
};

// GET profile with fleet stats
exports.getProfile = async (req, res) => {
  try {
    const settings = await getSettings(req.auth.userId);
    const cars = await Car.find({ clerkUserId: req.auth.userId });

    const totalIncome = cars.reduce((s, c) => s + c.incomeHistory.reduce((ss, e) => ss + e.amount, 0), 0);
    const totalExpenses = cars.reduce((s, c) => s + c.expenseHistory.reduce((ss, e) => ss + e.cost, 0) + c.damageHistory.reduce((ss, e) => ss + (e.actualCost || e.estimatedCost || 0), 0), 0);

    res.json({
      settings,
      fleetStats: {
        totalVehicles: cars.length,
        totalIncome,
        totalProfit: totalIncome - totalExpenses,
        healthyVehicles: cars.filter(c => !c.damageHistory.some(d => d.status !== 'fixed')).length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE profile/business
exports.updateProfile = async (req, res) => {
  try {
    const { businessName, businessAddress, businessPhone, businessEmail } = req.body;
    const settings = await UserSettings.findOneAndUpdate(
      { clerkUserId: req.auth.userId },
      { businessName, businessAddress, businessPhone, businessEmail },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE business settings
exports.updateBusiness = async (req, res) => {
  try {
    const { businessName, businessPhone, businessEmail, businessAddress, currency, timezone } = req.body;
    const update = {};
    if (businessName) update.businessName = businessName;
    if (businessPhone) update.businessPhone = businessPhone;
    if (businessEmail) update.businessEmail = businessEmail;
    if (businessAddress) update.businessAddress = businessAddress;
    if (currency) update.currency = currency;
    if (timezone) update.timezone = timezone;

    const settings = await UserSettings.findOneAndUpdate(
      { clerkUserId: req.auth.userId },
      update,
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await getSettings(req.auth.userId);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE settings
exports.updateSettings = async (req, res) => {
  try {
    const { theme, fontSize, layout, currency, timezone, notificationPreferences } = req.body;
    const update = {};
    if (theme) update.theme = theme;
    if (fontSize) update.fontSize = fontSize;
    if (layout) update.layout = layout;
    if (currency) update.currency = currency;
    if (timezone) update.timezone = timezone;
    if (notificationPreferences) update.notificationPreferences = notificationPreferences;

    const settings = await UserSettings.findOneAndUpdate(
      { clerkUserId: req.auth.userId },
      update,
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE password — handled by Clerk (redirect to Clerk dashboard)
exports.changePassword = async (req, res) => {
  // Password changes are handled by Clerk
  // This endpoint exists for future custom implementation
  res.json({ message: 'Password changes are managed through your account provider', redirect: 'https://accounts.clerk.com/user' });
};

// DELETE account data
exports.deleteData = async (req, res) => {
  try {
    await Car.deleteMany({ clerkUserId: req.auth.userId });
    await UserSettings.findOneAndDelete({ clerkUserId: req.auth.userId });
    res.json({ message: 'All data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EXPORT data as JSON
exports.exportData = async (req, res) => {
  try {
    const cars = await Car.find({ clerkUserId: req.auth.userId });
    const settings = await getSettings(req.auth.userId);

    const exportData = {
      exportedAt: new Date().toISOString(),
      settings,
      cars: cars.map(c => c.toObject()),
      summary: {
        totalVehicles: cars.length,
        totalIncome: cars.reduce((s, c) => s + c.incomeHistory.reduce((ss, e) => ss + e.amount, 0), 0)
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=fleet-manager-backup-${new Date().toISOString().split('T')[0]}.json`);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};