import { Target, Flame } from 'lucide-react';

const BuddyGoalCard = ({ goal, onUpdate }) => {
  const myProgress = goal.participants.find(
    p => p.userId._id === localStorage.getItem('userId')
  );

  const buddyProgress = goal.participants.find(
    p => p.userId._id !== localStorage.getItem('userId')
  );

  const calculateStreak = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return 0;
    
    const sorted = completedDates
      .map(d => new Date(d))
      .sort((a, b) => b - a);
    
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastDate = new Date(sorted[0]);
    lastDate.setHours(0, 0, 0, 0);
    
    const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (daysSince > 1) return 0;
    
    for (let i = 1; i < sorted.length; i++) {
      const current = new Date(sorted[i - 1]);
      current.setHours(0, 0, 0, 0);
      
      const previous = new Date(sorted[i]);
      previous.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        streak++;
      } else if (diff === 0) {
        continue;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const myStreak = calculateStreak(myProgress?.completedDates);
  const buddyStreak = calculateStreak(buddyProgress?.completedDates);

  return (
    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          <div>
            <h4 className="font-bold text-gray-900">{goal.title}</h4>
            <p className="text-sm text-gray-600">{goal.description}</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full capitalize">
          {goal.type}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center p-3 bg-white rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Your Progress</p>
          <p className="text-2xl font-bold text-gray-900">
            {myProgress?.currentProgress || 0}/{goal.targetCount}
          </p>
          {myStreak > 0 && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">{myStreak} day streak</span>
            </div>
          )}
        </div>

        <div className="text-center p-3 bg-white rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Buddy's Progress</p>
          <p className="text-2xl font-bold text-gray-900">
            {buddyProgress?.currentProgress || 0}/{goal.targetCount}
          </p>
          {buddyStreak > 0 && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">{buddyStreak} day streak</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="capitalize">{goal.frequency}</span>
        <span>Ends: {new Date(goal.endDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default BuddyGoalCard;
