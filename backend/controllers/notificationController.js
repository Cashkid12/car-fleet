const Notification = require('../models/Notification');

// Get all notifications with filters
exports.getNotifications = async (req, res) => {
  try {
    const { search, type, isRead, page = 1, limit = 30 } = req.query;
    const query = { clerkUserId: req.auth.userId };

    if (type && type !== 'all') query.type = type;
    if (isRead === 'unread') query.isRead = false;
    else if (isRead === 'read') query.isRead = true;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { plateNumber: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Notification.countDocuments(query);
    const totalUnread = await Notification.countDocuments({ clerkUserId: req.auth.userId, isRead: false });
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayCount = await Notification.countDocuments({ clerkUserId: req.auth.userId, createdAt: { $gte: todayStart } });

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Group by date
    const grouped = {};
    notifications.forEach(n => {
      const d = new Date(n.createdAt);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const weekStart = new Date(today); weekStart.setDate(weekStart.getDate() - 7);

      let group;
      if (d >= today) group = 'Today';
      else if (d >= yesterday) group = 'Yesterday';
      else if (d >= weekStart) group = 'This Week';
      else group = 'Older';

      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(n);
    });

    res.json({
      notifications: grouped,
      unreadCount: totalUnread,
      todayCount,
      totalCount: total,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count only
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ clerkUserId: req.auth.userId, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark single as read
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, clerkUserId: req.auth.userId },
      { isRead: true }
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { clerkUserId: req.auth.userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete single
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, clerkUserId: req.auth.userId });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear all
exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ clerkUserId: req.auth.userId });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};