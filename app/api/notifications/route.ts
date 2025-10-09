import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserNotifications } from '@/lib/services/notifications';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await getUserNotifications(session.user.id);
    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({ 
      notifications,
      unreadCount 
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}