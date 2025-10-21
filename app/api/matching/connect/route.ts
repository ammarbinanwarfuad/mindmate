import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import Match from '@/lib/db/models/Match';
import { findMatches } from '@/lib/services/matching';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
    }

    await connectDB();

    // Check if match already exists
    const existingMatch = await Match.findOne({
      $or: [
        { user1Id: session.user.id, user2Id: targetUserId },
        { user1Id: targetUserId, user2Id: session.user.id },
      ],
    });

    if (existingMatch) {
      return NextResponse.json({ error: 'Match already exists' }, { status: 400 });
    }

    // Calculate compatibility score
    const matches = await findMatches(session.user.id);
    const matchData = matches.find(m => m.userId === targetUserId);

    if (!matchData) {
      return NextResponse.json({ error: 'Invalid match' }, { status: 400 });
    }

    // Create match request
    const match = await Match.create({
      user1Id: session.user.id,
      user2Id: targetUserId,
      compatibilityScore: matchData.score,
      sharedStruggles: matchData.sharedStruggles,
      status: 'pending',
    });

    return NextResponse.json({ success: true, matchId: match._id });
  } catch (error) {
    console.error('Connection error:', error);
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
  }
}