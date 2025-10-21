import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import MoodEntry from '@/lib/db/models/MoodEntry';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '30');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectDB();

    const query: any = { userId: session.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await MoodEntry.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Mood history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mood history' },
      { status: 500 }
    );
  }
}

