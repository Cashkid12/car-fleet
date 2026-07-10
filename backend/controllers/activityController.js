const Activity = require('../models/Activity');

exports.getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ clerkUserId: req.auth.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};