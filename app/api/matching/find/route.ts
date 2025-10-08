import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { findMatches } from '@/lib/services/matching';
import User from '@/lib/db/models/User';
import { connectDB } from '@/lib/db/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const matchCandidates = await findMatches(session.user.id);

    // Fetch full user data for matches
    const matches = await Promise.all(
      matchCandidates.map(async (candidate) => {
        const user = await User.findById(candidate.userId).select('profile').lean();
        return {
          userId: candidate.userId,
          name: user?.profile.name || 'Anonymous',
          university: user?.profile.university || '',
          year: user?.profile.year || 1,
          score: candidate.score,
          sharedStruggles: candidate.sharedStruggles,
          reason: candidate.reason,
        };
      })
    );

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Matching error:', error);
    return NextResponse.json({ error: 'Failed to find matches' }, { status: 500 });
  }
}