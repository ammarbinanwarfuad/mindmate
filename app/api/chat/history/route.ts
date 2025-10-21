import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import Conversation from '@/lib/db/models/Conversation';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const conversations = await Conversation.find({
      participants: session.user.id,
    })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

