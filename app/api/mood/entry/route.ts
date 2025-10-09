import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/mongodb';
import MoodEntry from '@/lib/db/models/MoodEntry';
import { encryptText } from '@/lib/services/encryption';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { moodScore, emoji, journalEntry, triggers, activities, sleepHours } = await request.json();

    await connectDB();

    // Encrypt journal if provided
    let encryptedJournal;
    if (journalEntry) {
      encryptedJournal = encryptText(journalEntry);
    }

    const moodEntry = await MoodEntry.create({
      userId: session.user.id,
      date: new Date(),
      moodScore,
      emoji,
      journalEntry: encryptedJournal,
      triggers: triggers || [],
      activities: activities || [],
      sleepHours,
      analyzedSentiment: 0 // Implement sentiment analysis
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: moodEntry._id,
        date: moodEntry.date,
        moodScore: moodEntry.moodScore
      }
    });

  } catch (error) {
    console.error('Mood entry error:', error);
    return NextResponse.json(
      { error: 'Failed to save mood entry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const entries = await MoodEntry.find({ 
      userId: session.user.id 
    })
    .sort({ date: -1 })
    .limit(30)
    .select('-journalEntry'); // Don't send encrypted data

    return NextResponse.json({ entries });

  } catch (error) {
    console.error('Mood fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mood entries' },
      { status: 500 }
    );
  }
}