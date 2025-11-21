import { TrendingUp, Check } from 'lucide-react';
import Button from '../ui/Button';
import api from '../../utils/api';

const SharedActivityCard = ({ activity, onUpdate }) => {
  const handleLogProgress = async () => {
    try {
      await api.post(`/buddies/shared-activity/${activity._id}/progress`);
      onUpdate();
    } catch (error) {
      console.error('Error logging progress:', error);
      alert('Failed to log progress');
    }
  };

  const myProgress = activity.participants.find(
    p => p.userId._id === localStorage.getItem('userId')
  );

  const buddyProgress = activity.participants.find(
    p => p.userId._id !== localStorage.getItem('userId')
  );

  return (
    <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-gray-900">{activity.title}</h4>
          <p className="text-sm text-gray-600">{activity.description}</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          {activity.activityType}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Your Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${(myProgress?.progress / activity.targetCount) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-900">
              {myProgress?.progress || 0}/{activity.targetCount}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-1">Buddy's Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(buddyProgress?.progress / activity.targetCount) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-900">
              {buddyProgress?.progress || 0}/{activity.targetCount}
            </span>
          </div>
        </div>
      </div>

      {!myProgress?.completed && (
        <Button
          onClick={handleLogProgress}
          size="sm"
          className="w-full"
        >
          <Check className="w-4 h-4" />
          Log Progress
        </Button>
      )}

      {myProgress?.completed && (
        <div className="text-center py-2 bg-green-100 rounded-lg">
          <span className="text-green-700 font-semibold">✓ You completed this!</span>
        </div>
      )}
    </div>
  );
};

export default SharedActivityCard;
