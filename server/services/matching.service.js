import User from '../models/User.model.js';
import MoodEntry from '../models/MoodEntry.model.js';
import Match from '../models/Match.model.js';

export const findMatches = async (userId) => {
  try {
    const currentUser = await User.findById(userId);
    
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Get user's recent mood entries
    const userMoods = await MoodEntry.find({ userId })
      .sort({ date: -1 })
      .limit(7);

    const avgMoodScore = userMoods.length > 0
      ? userMoods.reduce((sum, entry) => sum + entry.moodScore, 0) / userMoods.length
      : 5;

    // Find potential matches
    const potentialMatches = await User.find({
      _id: { $ne: userId },
      'privacy.visibility.showInMatching': true
    }).limit(20);

    const matchScores = await Promise.all(
      potentialMatches.map(async (user) => {
        const score = await calculateMatchScore(currentUser, user, avgMoodScore);
        return {
          user,
          score
        };
      })
    );

    // Sort by score and return top matches
    return matchScores
      .filter(m => m.score > 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(m => ({
        userId: m.user._id,
        name: m.user.profile.anonymous ? 'Anonymous User' : m.user.profile.name,
        university: m.user.profile.university,
        year: m.user.profile.year,
        bio: m.user.profile.bio,
        matchScore: Math.round(m.score),
        profilePicture: m.user.profile.profilePicture
      }));
  } catch (error) {
    console.error('Match finding error:', error);
    throw error;
  }
};

const calculateMatchScore = async (user1, user2, user1AvgMood) => {
  let score = 0;

  // University match (30 points)
  if (user1.profile.university && user1.profile.university === user2.profile.university) {
    score += 30;
  }

  // Year of study proximity (20 points)
  if (user1.profile.year && user2.profile.year) {
    const yearDiff = Math.abs(user1.profile.year - user2.profile.year);
    score += Math.max(0, 20 - (yearDiff * 5));
  }

  // Mood similarity (30 points)
  const user2Moods = await MoodEntry.find({ userId: user2._id })
    .sort({ date: -1 })
    .limit(7);

  if (user2Moods.length > 0) {
    const user2AvgMood = user2Moods.reduce((sum, entry) => sum + entry.moodScore, 0) / user2Moods.length;
    const moodDiff = Math.abs(user1AvgMood - user2AvgMood);
    score += Math.max(0, 30 - (moodDiff * 3));
  }

  // Activity level (20 points)
  const daysSinceActive = (Date.now() - new Date(user2.lastActive).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceActive < 1) score += 20;
  else if (daysSinceActive < 7) score += 10;

  return score;
};
