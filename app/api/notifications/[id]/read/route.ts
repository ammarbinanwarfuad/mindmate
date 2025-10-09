import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { markAsRead } from '@/lib/services/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await markAsRead(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}