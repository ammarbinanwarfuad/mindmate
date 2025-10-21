import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/auth';
import { connectDB } from '@/lib/db/mongodb';
import MoodEntry from '@/lib/db/models/MoodEntry';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const days = parseInt(searchParams.get('days') || '30');

        await connectDB();

        const startDate = subDays(new Date(), days);

        const entries = await MoodEntry.find({
            userId: session.user.id,
            date: { $gte: startDate },
        }).lean();

        if (entries.length === 0) {
            return NextResponse.json({
                averageMood: 0,
                totalEntries: 0,
                moodDistribution: {},
                topTriggers: [],
                topActivities: [],
            });
        }

        // Calculate average mood
        const totalMood = entries.reduce((sum, entry) => sum + entry.moodScore, 0);
        const averageMood = Math.round((totalMood / entries.length) * 10) / 10;

        // Mood distribution
        const moodDistribution: { [key: number]: number } = {};
        entries.forEach((entry) => {
            moodDistribution[entry.moodScore] =
                (moodDistribution[entry.moodScore] || 0) + 1;
        });

        // Top triggers
        const triggerCounts: { [key: string]: number } = {};
        entries.forEach((entry) => {
            entry.triggers?.forEach((trigger: string) => {
                triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
            });
        });
        const topTriggers = Object.entries(triggerCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([trigger, count]) => ({ trigger, count }));

        // Top activities
        const activityCounts: { [key: string]: number } = {};
        entries.forEach((entry) => {
            entry.activities?.forEach((activity: string) => {
                activityCounts[activity] = (activityCounts[activity] || 0) + 1;
            });
        });
        const topActivities = Object.entries(activityCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([activity, count]) => ({ activity, count }));

        return NextResponse.json({
            averageMood,
            totalEntries: entries.length,
            moodDistribution,
            topTriggers,
            topActivities,
        });
    } catch (error) {
        console.error('Stats calculation error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate stats' },
            { status: 500 }
        );
    }
}

