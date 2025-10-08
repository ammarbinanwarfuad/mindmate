import { connectDB } from '@/lib/db/mongodb';
import Notification from '@/lib/db/models/Notification';

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  actionUrl?: string,
  metadata?: Record<string, any>
) {
  await connectDB();
  
  return await Notification.create({
    userId,
    type,
    title,
    message,
    actionUrl,
    metadata,
  });
}

export async function getUserNotifications(userId: string, unreadOnly = false) {
  await connectDB();
  
  const query: any = { userId };
  if (unreadOnly) {
    query.read = false;
  }
  
  return await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
}

export async function markAsRead(notificationId: string) {
  await connectDB();
  
  return await Notification.findByIdAndUpdate(
    notificationId,
    { read: true },
    { new: true }
  );
}

export async function markAllAsRead(userId: string) {
  await connectDB();
  
  return await Notification.updateMany(
    { userId, read: false },
    { read: true }
  );
}