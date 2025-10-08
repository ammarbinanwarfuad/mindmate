import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import MoodEntry from '@/lib/db/models/MoodEntry';
import Conversation from '@/lib/db/models/Conversation';
import ForumPost from '@/lib/db/models/ForumPost';
import Match from '@/lib/db/models/Match';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Delete all user data
    await Promise.all([
      User.findByIdAndDelete(session.user.id),
      MoodEntry.deleteMany({ userId: session.user.id }),
      Conversation.deleteMany({ userId: session.user.id }),
      ForumPost.deleteMany({ authorId: session.user.id }),
      Match.deleteMany({
        $or: [
          { user1Id: session.user.id },
          { user2Id: session.user.id },
        ],
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}