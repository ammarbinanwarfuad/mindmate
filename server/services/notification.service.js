import NotificationSchedule from '../models/NotificationSchedule.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import MoodEntry from '../models/MoodEntry.model.js';

/**
 * Get or create notification schedule for user
 */
export const getUserSchedule = async (userId) => {
  let schedule = await NotificationSchedule.findOne({ userId });
  
  if (!schedule) {
    schedule = await NotificationSchedule.create({
      userId,
      moodReminders: {
        enabled: true,
        frequency: 'twice',
        times: [
          { hour: 10, minute: 0 },
          { hour: 18, minute: 0 }
        ]
      }
    });
  }
  
  return schedule;
};

/**
 * Update notification schedule
 */
export const updateSchedule = async (userId, updates) => {
  let schedule = await NotificationSchedule.findOne({ userId });
  
  if (!schedule) {
    schedule = await NotificationSchedule.create({ userId, ...updates });
  } else {
    Object.assign(schedule, updates);
    await schedule.save();
  }
  
  return schedule;
};

/**
 * Check if current time is within quiet hours
 */
export const isQuietHours = (schedule) => {
  if (!schedule.quietHours.enabled) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  const startTime = schedule.quietHours.startTime.hour * 60 + schedule.quietHours.startTime.minute;
  const endTime = schedule.quietHours.endTime.hour * 60 + schedule.quietHours.endTime.minute;
  
  // Handle overnight quiet hours
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime < endTime;
  }
  
  return currentTime >= startTime && currentTime < endTime;
};

/**
 * Check if today is an active day
 */
export const isActiveDay = (schedule) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  return schedule.activeDays[today];
};

/**
 * Create in-app notification
 */
export const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Send push notification (Firebase Cloud Messaging)
 */
export const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  // This would integrate with Firebase Cloud Messaging
  // For now, it's a placeholder
  try {
    // const admin = require('firebase-admin');
    // const message = {
    //   notification: { title, body },
    //   data,
    //   token: fcmToken
    // };
    // await admin.messaging().send(message);
    
    console.log('Push notification would be sent:', { fcmToken, title, body });
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

/**
 * Send mood reminder
 */
export const sendMoodReminder = async (userId) => {
  const schedule = await getUserSchedule(userId);
  
  if (!schedule.moodReminders.enabled) return;
  if (isQuietHours(schedule)) return;
  if (!isActiveDay(schedule)) return;
  
  await createNotification(
    userId,
    'reminder',
    'Mood Check-In',
    schedule.moodReminders.message,
    { action: 'mood-tracker' }
  );
  
  if (schedule.pushNotifications.enabled && schedule.pushNotifications.fcmToken) {
    await sendPushNotification(
      schedule.pushNotifications.fcmToken,
      'Mood Check-In',
      schedule.moodReminders.message
    );
  }
};

/**
 * Send goal reminder
 */
export const sendGoalReminder = async (userId) => {
  const schedule = await getUserSchedule(userId);
  
  if (!schedule.goalReminders.enabled) return;
  if (isQuietHours(schedule)) return;
  if (!isActiveDay(schedule)) return;
  
  await createNotification(
    userId,
    'reminder',
    'Goal Reminder',
    schedule.goalReminders.message,
    { action: 'goals' }
  );
  
  if (schedule.pushNotifications.enabled && schedule.pushNotifications.fcmToken) {
    await sendPushNotification(
      schedule.pushNotifications.fcmToken,
      'Goal Reminder',
      schedule.goalReminders.message
    );
  }
};

/**
 * Send wellness reminder
 */
export const sendWellnessReminder = async (userId) => {
  const schedule = await getUserSchedule(userId);
  
  if (!schedule.wellnessReminders.enabled) return;
  if (isQuietHours(schedule)) return;
  if (!isActiveDay(schedule)) return;
  
  await createNotification(
    userId,
    'reminder',
    'Wellness Time',
    schedule.wellnessReminders.message,
    { action: 'wellness' }
  );
  
  if (schedule.pushNotifications.enabled && schedule.pushNotifications.fcmToken) {
    await sendPushNotification(
      schedule.pushNotifications.fcmToken,
      'Wellness Time',
      schedule.wellnessReminders.message
    );
  }
};

/**
 * Send journal reminder
 */
export const sendJournalReminder = async (userId) => {
  const schedule = await getUserSchedule(userId);
  
  if (!schedule.journalReminders.enabled) return;
  if (isQuietHours(schedule)) return;
  if (!isActiveDay(schedule)) return;
  
  await createNotification(
    userId,
    'reminder',
    'Journal Time',
    schedule.journalReminders.message,
    { action: 'journal' }
  );
  
  if (schedule.pushNotifications.enabled && schedule.pushNotifications.fcmToken) {
    await sendPushNotification(
      schedule.pushNotifications.fcmToken,
      'Journal Time',
      schedule.journalReminders.message
    );
  }
};

/**
 * Check for inactive users and send reminders
 */
export const checkInactiveUsers = async () => {
  try {
    const schedules = await NotificationSchedule.find({
      'inactivityReminders.enabled': true
    }).populate('userId');
    
    for (const schedule of schedules) {
      const user = schedule.userId;
      if (!user) continue;
      
      // Check last mood entry
      const lastMoodEntry = await MoodEntry.findOne({ userId: user._id })
        .sort({ createdAt: -1 });
      
      if (lastMoodEntry) {
        const daysSinceLastEntry = Math.floor(
          (Date.now() - lastMoodEntry.createdAt) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastEntry >= schedule.inactivityReminders.daysThreshold) {
          await createNotification(
            user._id,
            'reminder',
            'We Miss You!',
            schedule.inactivityReminders.message,
            { action: 'dashboard' }
          );
          
          if (schedule.pushNotifications.enabled && schedule.pushNotifications.fcmToken) {
            await sendPushNotification(
              schedule.pushNotifications.fcmToken,
              'We Miss You!',
              schedule.inactivityReminders.message
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking inactive users:', error);
  }
};

/**
 * Schedule all reminders (called by cron job)
 */
export const processScheduledNotifications = async () => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const schedules = await NotificationSchedule.find();
    
    for (const schedule of schedules) {
      // Check mood reminders
      if (schedule.moodReminders.enabled) {
        for (const time of schedule.moodReminders.times) {
          if (time.hour === currentHour && time.minute === currentMinute) {
            await sendMoodReminder(schedule.userId);
          }
        }
      }
      
      // Check goal reminders
      if (schedule.goalReminders.enabled) {
        const goalTime = schedule.goalReminders.time;
        if (goalTime.hour === currentHour && goalTime.minute === currentMinute) {
          await sendGoalReminder(schedule.userId);
        }
      }
      
      // Check wellness reminders
      if (schedule.wellnessReminders.enabled) {
        const wellnessTime = schedule.wellnessReminders.time;
        if (wellnessTime.hour === currentHour && wellnessTime.minute === currentMinute) {
          await sendWellnessReminder(schedule.userId);
        }
      }
      
      // Check journal reminders
      if (schedule.journalReminders.enabled) {
        const journalTime = schedule.journalReminders.time;
        if (journalTime.hour === currentHour && journalTime.minute === currentMinute) {
          await sendJournalReminder(schedule.userId);
        }
      }
    }
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
  }
};

export default {
  getUserSchedule,
  updateSchedule,
  sendMoodReminder,
  sendGoalReminder,
  sendWellnessReminder,
  sendJournalReminder,
  checkInactiveUsers,
  processScheduledNotifications,
  createNotification,
  sendPushNotification
};
