import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import MoodEntry from '@/lib/db/models/MoodEntry';
import Conversation from '@/lib/db/models/Conversation';
import ForumPost from '@/lib/db/models/ForumPost';
import Match from '@/lib/db/models/Match';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const [moodEntries, conversations, posts, matches] = await Promise.all([
      MoodEntry.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Conversation.find({ userId: session.user.id })
        .sort({ lastActive: -1 })
        .limit(5)
        .lean(),
      ForumPost.find({ authorId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Match.find({
        $or: [{ user1Id: session.user.id }, { user2Id: session.user.id }]
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const activities: any[] = [];

    moodEntries.forEach((entry: any) => {
      activities.push({
        _id: entry._id.toString(),
        type: 'mood',
        description: `Logged mood: ${entry.moodScore}/10 ${entry.emoji}`,
        timestamp: entry.createdAt,
        link: '/mood'
      });
    });

    conversations.forEach((conv: any) => {
      if (conv.messages.length > 0) {
        activities.push({
          _id: conv._id.toString(),
          type: 'chat',
          description: `Chatted with MindMate`,
          timestamp: conv.lastActive,
          link: '/chat'
        });
      }
    });

    posts.forEach((post: any) => {
      activities.push({
        _id: post._id.toString(),
        type: 'post',
        description: `Posted in ${post.category}: "${post.title}"`,
        timestamp: post.createdAt,
        link: `/community/post/${post._id}`
      });
    });

    matches.forEach((match: any) => {
      if (match.status === 'accepted') {
        activities.push({
          _id: match._id.toString(),
          type: 'match',
          description: `Connected with a peer match`,
          timestamp: match.createdAt,
          link: '/matches'
        });
      }
    });

    // Sort by timestamp and return top 20
    activities.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({ activities: activities.slice(0, 20) });
  } catch (error) {
    console.error('Activity feed error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}