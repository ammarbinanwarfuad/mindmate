import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db/mongodb';
import MoodEntry from '@/lib/db/models/MoodEntry';
import Conversation from '@/lib/db/models/Conversation';
import { subDays } from 'date-fns';
import MoodStreakWidget from '@/components/dashboard/MoodStreakWidget';
import QuickMoodEntry from '@/components/dashboard/QuickMoodEntry';
import MoodTrendChart from '@/components/dashboard/MoodTrendChart';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import Link from 'next/link';

async function getDashboardData(userId: string) {
  await connectDB();

  const thirtyDaysAgo = subDays(new Date(), 30);

  const [moodEntries, conversations] = await Promise.all([
    MoodEntry.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 }).limit(7).lean(),
    Conversation.find({ userId }).lean()
  ]);

  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
  const avgMood = moodEntries.length > 0
    ? moodEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / moodEntries.length
    : 0;

  return {
    moodEntries,
    avgMood: avgMood.toFixed(1),
    totalEntries: moodEntries.length,
    totalMessages,
  };
}

export default async function EnhancedDashboard() {
  const session = await getServerSession(authOptions);
  const data = await getDashboardData(session!.user!.id);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session!.user!.name}!
        </h1>
        <p className="text-purple-100">
          Your wellness journey at a glance
        </p>
      </div>

      {/* Interactive Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MoodStreakWidget />
        
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white shadow-lg">
          <h3 className="font-semibold mb-2">Average Mood</h3>
          <p className="text-5xl font-bold">{data.avgMood}</p>
          <p className="text-blue-100 mt-2">Last 30 days</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white shadow-lg">
          <h3 className="font-semibold mb-2">Conversations</h3>
          <p className="text-5xl font-bold">{data.totalMessages}</p>
          <p className="text-green-100 mt-2">Messages with MindMate</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <QuickMoodEntry />
          <MoodTrendChart />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <ActivityFeed />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/mood/new"
          className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500"
        >
          <span className="text-4xl block mb-3">📝</span>
          <h3 className="font-bold text-gray-900 mb-2">Detailed Mood Entry</h3>
          <p className="text-gray-600 text-sm">Track your mood with journal</p>
        </Link>

        <Link
          href="/chat"
          className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
        >
          <span className="text-4xl block mb-3">💬</span>
          <h3 className="font-bold text-gray-900 mb-2">Talk to MindMate</h3>
          <p className="text-gray-600 text-sm">Get support anytime</p>
        </Link>

        <Link
          href="/resources"
          className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500"
        >
          <span className="text-4xl block mb-3">🧘</span>
          <h3 className="font-bold text-gray-900 mb-2">Wellness Tools</h3>
          <p className="text-gray-600 text-sm">Meditation, breathing & more</p>
        </Link>
      </div>
    </div>
  );
}