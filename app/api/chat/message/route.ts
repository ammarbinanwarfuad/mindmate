import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/mongodb';
import Conversation from '@/lib/db/models/Conversation';
import { getChatResponse } from '@/lib/services/gemini';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get or create conversation
    let conversation = await Conversation.findOne({ 
      userId: session.user.id 
    }).sort({ lastActive: -1 });

    if (!conversation) {
      conversation = await Conversation.create({
        userId: session.user.id,
        messages: [],
        context: {},
        lastActive: new Date()
      });
    }

    // Get recent history
    const recentHistory = conversation.messages.slice(-10);

    // Get AI response
    const aiResponse = await getChatResponse(
      recentHistory as any,
      message
    );

    // Save messages
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      sentiment: aiResponse.sentiment
    });

    conversation.messages.push({
      role: 'assistant',
      content: aiResponse.message,
      timestamp: new Date()
    });

    conversation.lastActive = new Date();
    await conversation.save();

    return NextResponse.json({
      response: aiResponse.message,
      crisisDetected: aiResponse.crisisDetected
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}