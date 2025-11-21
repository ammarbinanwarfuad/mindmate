import { useGamification } from '../context/GamificationContext';

/**
 * Custom hook for easy gamification tracking in components
 * 
 * Usage example:
 * 
 * import useGamificationTracking from '../hooks/useGamificationTracking';
 * 
 * const MyComponent = () => {
 *   const { trackMoodLog, trackJournalEntry, trackMeditation } = useGamificationTracking();
 *   
 *   const handleMoodSubmit = async () => {
 *     // ... your mood submission logic
 *     await trackMoodLog(); // Awards XP and updates challenges
 *   };
 * };
 */
const useGamificationTracking = () => {
  const { trackAction } = useGamification();

  return {
    // Mood tracking
    trackMoodLog: () => trackAction('mood_log'),
    trackPositiveMood: () => trackAction('positive_mood'),
    trackMoodWithNotes: () => trackAction('mood_with_notes'),

    // Journal tracking
    trackJournalEntry: () => trackAction('journal_entry'),
    trackVoiceJournal: () => trackAction('voice_journal'),
    trackPhotoJournal: () => trackAction('photo_journal'),
    trackGratitudeJournal: () => trackAction('gratitude_journal'),

    // Wellness tracking
    trackMeditation: () => trackAction('meditation_complete'),
    trackBreathingExercise: () => trackAction('breathing_exercise'),
    trackYoga: () => trackAction('yoga_complete'),
    trackSoundTherapy: () => trackAction('sound_therapy'),

    // Goals tracking
    trackGoalCreated: () => trackAction('goal_created'),
    trackGoalCompleted: () => trackAction('goal_completed'),
    trackGoalProgress: () => trackAction('goal_progress'),

    // Social tracking
    trackBuddyMatched: () => trackAction('buddy_matched'),
    trackMessageSent: () => trackAction('message_sent'),
    trackCheckIn: () => trackAction('check_in'),
    trackSharedActivity: () => trackAction('shared_activity'),
    trackSharedGoal: () => trackAction('shared_goal'),

    // Safety tracking
    trackSafetyPlanCreated: () => trackAction('safety_plan_created'),
    trackResourceShared: () => trackAction('resource_shared'),

    // Generic tracking
    track: (action, amount) => trackAction(action, amount)
  };
};

export default useGamificationTracking;
