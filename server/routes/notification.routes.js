import express from 'express';
import Notification from '../models/Notification.model.js';
import { authenticate } from '../middleware/auth.js';
import { getUserSchedule, updateSchedule } from '../services/notification.service.js';

const router = express.Router();

// Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 20, unreadOnly } = req.query;
    
    const query = { userId: req.user._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });
    
    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({
      success: true,
      notification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ NOTIFICATION SCHEDULE ============

/**
 * @route   GET /api/notifications/schedule
 * @desc    Get user's notification schedule
 * @access  Private
 */
router.get('/schedule', authenticate, async (req, res) => {
  try {
    const schedule = await getUserSchedule(req.user._id);
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/notifications/schedule
 * @desc    Update notification schedule
 * @access  Private
 */
router.post('/schedule', authenticate, async (req, res) => {
  try {
    const schedule = await updateSchedule(req.user._id, req.body);
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/notifications/quiet-hours
 * @desc    Update quiet hours settings
 * @access  Private
 */
router.post('/quiet-hours', authenticate, async (req, res) => {
  try {
    const { enabled, startTime, endTime } = req.body;
    
    const schedule = await updateSchedule(req.user._id, {
      quietHours: {
        enabled,
        startTime,
        endTime
      }
    });
    
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/notifications/push-token
 * @desc    Register FCM token for push notifications
 * @access  Private
 */
router.post('/push-token', authenticate, async (req, res) => {
  try {
    const { fcmToken, platform } = req.body;
    
    const schedule = await updateSchedule(req.user._id, {
      pushNotifications: {
        enabled: true,
        fcmToken,
        platform
      }
    });
    
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/notifications/test
 * @desc    Send a test notification
 * @access  Private
 */
router.post('/test', authenticate, async (req, res) => {
  try {
    const notification = await Notification.create({
      userId: req.user._id,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification. Your notifications are working! 🎉'
    });
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
