import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import MoodEntry from '@/lib/db/models/MoodEntry';
import Match from '@/lib/db/models/Match';

interface MatchCandidate {
  userId: string;
  score: number;
  sharedStruggles: string[];
  reason: string;
}

export async function findMatches(userId: string): Promise<MatchCandidate[]> {
  await connectDB();

  const currentUser = await User.findById(userId);
  if (!currentUser || !currentUser.privacy.visibility.showInMatching) {
    return [];
  }

  // Get user's recent mood entries
  const userMoodEntries = await MoodEntry.find({ 
    userId,
    date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  }).lean();

  const userTriggers = extractTriggers(userMoodEntries);
  const userAvgMood = calculateAvgMood(userMoodEntries);

  // Find potential matches
  const potentialMatches = await User.find({
    _id: { $ne: userId },
    'privacy.visibility.showInMatching': true,
  }).lean();

  const matches: MatchCandidate[] = [];

  for (const candidate of potentialMatches) {
    const candidateMoodEntries = await MoodEntry.find({
      userId: candidate._id,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).lean();

    const candidateTriggers = extractTriggers(candidateMoodEntries);
    const candidateAvgMood = calculateAvgMood(candidateMoodEntries);

    const compatibility = calculateCompatibility(
      userTriggers,
      candidateTriggers,
      userAvgMood,
      candidateAvgMood,
      currentUser.profile.year,
      candidate.profile.year
    );

    if (compatibility.score >= 60) {
      matches.push({
        userId: candidate._id.toString(),
        score: compatibility.score,
        sharedStruggles: compatibility.sharedStruggles,
        reason: compatibility.reason,
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, 5);
}

function extractTriggers(moodEntries: any[]): string[] {
  const triggers: { [key: string]: number } = {};
  
  moodEntries.forEach(entry => {
    if (entry.triggers && Array.isArray(entry.triggers)) {
      entry.triggers.forEach((trigger: string) => {
        triggers[trigger] = (triggers[trigger] || 0) + 1;
      });
    }
  });

  return Object.entries(triggers)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([trigger]) => trigger);
}

function calculateAvgMood(moodEntries: any[]): number {
  if (moodEntries.length === 0) return 5;
  const sum = moodEntries.reduce((acc, entry) => acc + entry.moodScore, 0);
  return sum / moodEntries.length;
}

function calculateCompatibility(
  userTriggers: string[],
  candidateTriggers: string[],
  userAvgMood: number,
  candidateAvgMood: number,
  userYear?: number,
  candidateYear?: number
): { score: number; sharedStruggles: string[]; reason: string } {
  let score = 0;

  // Shared struggles (40% weight)
  const sharedStruggles = userTriggers.filter(t => candidateTriggers.includes(t));
  const struggleScore = sharedStruggles.length > 0 
    ? (sharedStruggles.length / Math.max(userTriggers.length, 1)) * 40 
    : 0;
  score += struggleScore;

  // Similar mood levels (30% weight)
  const moodDiff = Math.abs(userAvgMood - candidateAvgMood);
  const moodScore = Math.max(0, (1 - moodDiff / 10)) * 30;
  score += moodScore;

  // Same year in school (20% weight)
  if (userYear && candidateYear && userYear === candidateYear) {
    score += 20;
  }

  // Activity factor (10% weight)
  score += 10;

  const reason = sharedStruggles.length > 0
    ? `You both experience ${sharedStruggles.slice(0, 2).join(' and ')}`
    : 'Similar experiences and mood patterns';

  return {
    score: Math.round(score),
    sharedStruggles,
    reason,
  };
}