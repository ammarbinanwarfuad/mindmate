import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/mongodb';
import MoodEntry from '@/lib/db/models/MoodEntry';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const entries = await MoodEntry.find({ userId: session.user.id })
      .sort({ date: -1 })
      .lean();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (entries.length === 0) {
      return NextResponse.json({ current: 0, longest: 0, lastEntry: null });
    }

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (let i = 0; i < entries.length - 1; i++) {
      const current = new Date(entries[i].date);
      const next = new Date(entries[i + 1].date);
      
      const daysDiff = Math.floor(
        (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak + 1);
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak + 1, currentStreak);

    return NextResponse.json({
      current: currentStreak,
      longest: longestStreak,
      lastEntry: entries[0].date
    });
  } catch (error) {
    console.error('Streak calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate streak' }, { status: 500 });
  }
}