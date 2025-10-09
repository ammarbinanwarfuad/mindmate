import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/mongodb';
import MoodEntry from '@/lib/db/models/MoodEntry';
import { subDays, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '14');

    await connectDB();

    const startDate = subDays(new Date(), days);
    
    const entries = await MoodEntry.find({
      userId: session.user.id,
      date: { $gte: startDate }
    })
    .sort({ date: 1 })
    .lean();

    // Fill in missing dates with null values
    const data = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - i - 1);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const entry = entries.find(e => 
        format(new Date(e.date), 'yyyy-MM-dd') === dateStr
      );
      
      data.push({
        date: dateStr,
        moodScore: entry ? entry.moodScore : null
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Trend calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate trend' }, { status: 500 });
  }
}