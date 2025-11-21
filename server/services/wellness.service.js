import WellnessActivity from '../models/WellnessActivity.model.js';
import ActivityProgress from '../models/ActivityProgress.model.js';
import MoodEntry from '../models/MoodEntry.model.js';

/**
 * Get AI-powered activity recommendations based on user's mood
 */
export const getRecommendations = async (userId) => {
  try {
    // Get user's recent mood entries
    const recentMoods = await MoodEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(7);

    if (recentMoods.length === 0) {
      // No mood data, return popular activities
      return await WellnessActivity.find({ isActive: true })
        .sort({ popularity: -1 })
        .limit(6);
    }

    // Calculate average mood
    const avgMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;
    
    // Get user's activity history
    const userProgress = await ActivityProgress.find({ userId })
      .populate('activityId')
      .sort({ totalCompletions: -1 });

    const completedActivityIds = userProgress.map(p => p.activityId?._id.toString());

    let recommendedCategories = [];
    let recommendedTypes = [];

    // Recommend based on mood
    if (avgMood < 4) {
      // Low mood - recommend stress relief, calm activities
      recommendedCategories = ['stress-relief', 'calm', 'anxiety'];
      recommendedTypes = ['meditation', 'breathing', 'relaxation'];
    } else if (avgMood < 6) {
      // Medium mood - balanced recommendations
      recommendedCategories = ['stress-relief', 'focus', 'calm'];
      recommendedTypes = ['meditation', 'breathing', 'mindfulness'];
    } else {
      // Good mood - maintain with energy and focus
      recommendedCategories = ['energy', 'focus', 'calm'];
      recommendedTypes = ['yoga', 'meditation', 'mindfulness'];
    }

    // Check for sleep issues
    const sleepIssues = recentMoods.filter(m => m.sleep && m.sleep < 6).length;
    if (sleepIssues >= 3) {
      recommendedCategories.unshift('sleep');
      recommendedTypes.unshift('sleep');
    }

    // Find activities matching recommendations
    const recommendations = await WellnessActivity.find({
      isActive: true,
      $or: [
        { category: { $in: recommendedCategories } },
        { type: { $in: recommendedTypes } }
      ]
    })
      .sort({ popularity: -1 })
      .limit(10);

    // Prioritize activities user hasn't tried
    const newActivities = recommendations.filter(
      activity => !completedActivityIds.includes(activity._id.toString())
    );

    const tried = recommendations.filter(
      activity => completedActivityIds.includes(activity._id.toString())
    );

    return [...newActivities, ...tried].slice(0, 6);

  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

/**
 * Get user's overall wellness progress
 */
export const getUserWellnessStats = async (userId) => {
  try {
    const allProgress = await ActivityProgress.find({ userId })
      .populate('activityId');

    const totalMinutes = allProgress.reduce((sum, p) => sum + p.totalMinutes, 0);
    const totalCompletions = allProgress.reduce((sum, p) => sum + p.totalCompletions, 0);
    const favorites = allProgress.filter(p => p.isFavorite).length;

    // Calculate current streak (any activity)
    const recentCompletions = allProgress
      .flatMap(p => p.completions.map(c => ({ ...c, activityId: p.activityId })))
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    let currentStreak = 0;
    if (recentCompletions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastCompletion = new Date(recentCompletions[0].completedAt);
      lastCompletion.setHours(0, 0, 0, 0);
      
      const daysSince = Math.floor((today - lastCompletion) / (1000 * 60 * 60 * 24));
      
      if (daysSince <= 1) {
        currentStreak = 1;
        
        for (let i = 1; i < recentCompletions.length; i++) {
          const current = new Date(recentCompletions[i - 1].completedAt);
          current.setHours(0, 0, 0, 0);
          
          const previous = new Date(recentCompletions[i].completedAt);
          previous.setHours(0, 0, 0, 0);
          
          const dayDiff = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            currentStreak++;
          } else if (dayDiff === 0) {
            continue;
          } else {
            break;
          }
        }
      }
    }

    // Activity type breakdown
    const typeBreakdown = {};
    allProgress.forEach(p => {
      if (p.activityId && p.activityId.type) {
        const type = p.activityId.type;
        if (!typeBreakdown[type]) {
          typeBreakdown[type] = { completions: 0, minutes: 0 };
        }
        typeBreakdown[type].completions += p.totalCompletions;
        typeBreakdown[type].minutes += p.totalMinutes;
      }
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = recentCompletions.filter(
      c => new Date(c.completedAt) >= sevenDaysAgo
    );

    return {
      totalMinutes,
      totalCompletions,
      favorites,
      currentStreak,
      typeBreakdown,
      recentActivity: recentActivity.length,
      activitiesTried: allProgress.length,
      averageRating: calculateAverageRating(allProgress)
    };

  } catch (error) {
    console.error('Error getting wellness stats:', error);
    throw error;
  }
};

/**
 * Seed initial wellness activities
 */
export const seedWellnessActivities = async () => {
  try {
    const count = await WellnessActivity.countDocuments();
    if (count > 0) {
      console.log('Wellness activities already seeded');
      return;
    }

    const activities = [
      // Breathing Exercises
      {
        title: 'Box Breathing',
        description: 'A powerful stress-relief technique used by Navy SEALs. Breathe in for 4, hold for 4, out for 4, hold for 4.',
        type: 'breathing',
        duration: 5,
        difficulty: 'beginner',
        category: 'stress-relief',
        tags: ['anxiety', 'quick', 'stress'],
        benefits: ['Reduces stress', 'Calms nervous system', 'Improves focus'],
        instructions: [
          { step: 1, text: 'Sit comfortably with your back straight' },
          { step: 2, text: 'Breathe in through your nose for 4 counts' },
          { step: 3, text: 'Hold your breath for 4 counts' },
          { step: 4, text: 'Exhale through your mouth for 4 counts' },
          { step: 5, text: 'Hold empty for 4 counts' },
          { step: 6, text: 'Repeat for 5 minutes' }
        ],
        popularity: 100
      },
      {
        title: '4-7-8 Breathing',
        description: 'Dr. Weil\'s relaxation breath. Perfect for falling asleep and reducing anxiety.',
        type: 'breathing',
        duration: 5,
        difficulty: 'beginner',
        category: 'sleep',
        tags: ['sleep', 'anxiety', 'relaxation'],
        benefits: ['Promotes sleep', 'Reduces anxiety', 'Lowers blood pressure'],
        instructions: [
          { step: 1, text: 'Place tongue behind upper front teeth' },
          { step: 2, text: 'Exhale completely through mouth' },
          { step: 3, text: 'Breathe in through nose for 4 counts' },
          { step: 4, text: 'Hold breath for 7 counts' },
          { step: 5, text: 'Exhale through mouth for 8 counts' },
          { step: 6, text: 'Repeat 4 times' }
        ],
        popularity: 95
      },
      {
        title: 'Calm Breathing',
        description: 'Simple deep breathing to quickly reduce stress and anxiety.',
        type: 'breathing',
        duration: 3,
        difficulty: 'beginner',
        category: 'anxiety',
        tags: ['anxiety', 'quick', 'calm'],
        benefits: ['Quick stress relief', 'Calms mind', 'Easy to do anywhere'],
        instructions: [
          { step: 1, text: 'Breathe in slowly through nose for 4 counts' },
          { step: 2, text: 'Hold for 2 counts' },
          { step: 3, text: 'Exhale slowly through mouth for 6 counts' },
          { step: 4, text: 'Repeat for 3 minutes' }
        ],
        popularity: 90
      },

      // Meditation
      {
        title: 'Body Scan Meditation',
        description: 'Progressive relaxation technique that releases tension throughout your body.',
        type: 'meditation',
        duration: 15,
        difficulty: 'beginner',
        category: 'stress-relief',
        tags: ['relaxation', 'sleep', 'mindfulness'],
        benefits: ['Releases physical tension', 'Improves body awareness', 'Promotes relaxation'],
        instructions: [
          { step: 1, text: 'Lie down or sit comfortably' },
          { step: 2, text: 'Close your eyes and take deep breaths' },
          { step: 3, text: 'Focus on your toes, notice any sensations' },
          { step: 4, text: 'Slowly move attention up through each body part' },
          { step: 5, text: 'Release tension as you scan each area' },
          { step: 6, text: 'End at the top of your head' }
        ],
        popularity: 85
      },
      {
        title: 'Loving-Kindness Meditation',
        description: 'Cultivate compassion for yourself and others through guided meditation.',
        type: 'meditation',
        duration: 10,
        difficulty: 'beginner',
        category: 'calm',
        tags: ['compassion', 'self-love', 'positivity'],
        benefits: ['Increases self-compassion', 'Reduces negative emotions', 'Improves relationships'],
        instructions: [
          { step: 1, text: 'Sit comfortably and close your eyes' },
          { step: 2, text: 'Think of someone you love' },
          { step: 3, text: 'Repeat: "May you be happy, may you be healthy"' },
          { step: 4, text: 'Extend these wishes to yourself' },
          { step: 5, text: 'Extend to neutral people, then difficult people' },
          { step: 6, text: 'End with wishes for all beings' }
        ],
        popularity: 80
      },
      {
        title: 'Mindful Breathing',
        description: 'Simple meditation focusing on the breath. Perfect for beginners.',
        type: 'meditation',
        duration: 10,
        difficulty: 'beginner',
        category: 'focus',
        tags: ['mindfulness', 'focus', 'beginner'],
        benefits: ['Improves focus', 'Reduces mind wandering', 'Builds meditation habit'],
        instructions: [
          { step: 1, text: 'Sit in a comfortable position' },
          { step: 2, text: 'Close your eyes or soften your gaze' },
          { step: 3, text: 'Notice your natural breath' },
          { step: 4, text: 'When mind wanders, gently return to breath' },
          { step: 5, text: 'Continue for 10 minutes' }
        ],
        popularity: 88
      },

      // Sleep
      {
        title: 'Sleep Story: Forest Walk',
        description: 'A calming narrative to help you drift off to sleep peacefully.',
        type: 'sleep',
        duration: 20,
        difficulty: 'beginner',
        category: 'sleep',
        tags: ['sleep', 'relaxation', 'story'],
        benefits: ['Promotes sleep', 'Calms racing thoughts', 'Creates peaceful imagery'],
        instructions: [
          { step: 1, text: 'Get comfortable in bed' },
          { step: 2, text: 'Close your eyes' },
          { step: 3, text: 'Listen to the calming story' },
          { step: 4, text: 'Let yourself drift off naturally' }
        ],
        popularity: 75
      },
      {
        title: 'Progressive Muscle Relaxation',
        description: 'Systematically tense and relax muscle groups for deep relaxation.',
        type: 'relaxation',
        duration: 15,
        difficulty: 'beginner',
        category: 'sleep',
        tags: ['sleep', 'relaxation', 'tension-relief'],
        benefits: ['Releases physical tension', 'Promotes deep sleep', 'Reduces anxiety'],
        instructions: [
          { step: 1, text: 'Lie down comfortably' },
          { step: 2, text: 'Tense your toes for 5 seconds, then release' },
          { step: 3, text: 'Move up to calves, thighs, etc.' },
          { step: 4, text: 'Tense and release each muscle group' },
          { step: 5, text: 'End with facial muscles' },
          { step: 6, text: 'Notice the deep relaxation' }
        ],
        popularity: 78
      },

      // Mindfulness
      {
        title: '5-4-3-2-1 Grounding',
        description: 'Grounding technique using your five senses to calm anxiety.',
        type: 'mindfulness',
        duration: 5,
        difficulty: 'beginner',
        category: 'anxiety',
        tags: ['anxiety', 'grounding', 'quick'],
        benefits: ['Stops panic attacks', 'Grounds you in present', 'Reduces anxiety'],
        instructions: [
          { step: 1, text: 'Name 5 things you can see' },
          { step: 2, text: 'Name 4 things you can touch' },
          { step: 3, text: 'Name 3 things you can hear' },
          { step: 4, text: 'Name 2 things you can smell' },
          { step: 5, text: 'Name 1 thing you can taste' }
        ],
        popularity: 92
      },
      {
        title: 'Mindful Walking',
        description: 'Walking meditation to connect with your body and surroundings.',
        type: 'mindfulness',
        duration: 15,
        difficulty: 'beginner',
        category: 'calm',
        tags: ['mindfulness', 'movement', 'outdoor'],
        benefits: ['Combines movement and mindfulness', 'Improves mood', 'Connects with nature'],
        instructions: [
          { step: 1, text: 'Find a quiet place to walk' },
          { step: 2, text: 'Walk slowly and deliberately' },
          { step: 3, text: 'Notice each step and movement' },
          { step: 4, text: 'Observe your surroundings' },
          { step: 5, text: 'Return attention to walking when mind wanders' }
        ],
        popularity: 70
      },

      // Energy & Focus
      {
        title: 'Energizing Breath',
        description: 'Quick breathing technique to boost energy and alertness.',
        type: 'breathing',
        duration: 3,
        difficulty: 'intermediate',
        category: 'energy',
        tags: ['energy', 'focus', 'quick'],
        benefits: ['Increases alertness', 'Boosts energy', 'Improves focus'],
        instructions: [
          { step: 1, text: 'Sit up straight' },
          { step: 2, text: 'Take quick, forceful inhales through nose' },
          { step: 3, text: 'Passive exhales' },
          { step: 4, text: 'Do 30 breaths rapidly' },
          { step: 5, text: 'Rest and notice increased energy' }
        ],
        popularity: 65
      },
      {
        title: 'Focus Meditation',
        description: 'Sharpen your concentration and mental clarity.',
        type: 'meditation',
        duration: 12,
        difficulty: 'intermediate',
        category: 'focus',
        tags: ['focus', 'productivity', 'concentration'],
        benefits: ['Improves concentration', 'Enhances productivity', 'Reduces distractions'],
        instructions: [
          { step: 1, text: 'Choose a focal point (breath, sound, or object)' },
          { step: 2, text: 'Maintain attention on this point' },
          { step: 3, text: 'When distracted, gently return focus' },
          { step: 4, text: 'Build concentration muscle over time' }
        ],
        popularity: 72
      }
    ];

    await WellnessActivity.insertMany(activities);
    console.log('✅ Wellness activities seeded successfully');
    
  } catch (error) {
    console.error('Error seeding wellness activities:', error);
    throw error;
  }
};

// Helper function
function calculateAverageRating(progressArray) {
  const allRatings = progressArray.flatMap(p => 
    p.completions.filter(c => c.rating).map(c => c.rating)
  );
  
  if (allRatings.length === 0) return 0;
  
  return (allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length).toFixed(1);
}
