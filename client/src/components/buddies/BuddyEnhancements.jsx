import { useState, useEffect } from 'react';
import { Calendar, Target, MessageCircle, AlertCircle, Video, Phone } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import CheckInScheduler from './CheckInScheduler';
import SharedActivityCard from './SharedActivityCard';
import BuddyGoalCard from './BuddyGoalCard';
import IcebreakerPrompts from './IcebreakerPrompts';
import SOSButton from './SOSButton';
import api from '../../utils/api';

const BuddyEnhancements = ({ match, buddy }) => {
  const [checkIns, setCheckIns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [match]);

  const fetchData = async () => {
    try {
      const [checkInsRes, activitiesRes, goalsRes] = await Promise.all([
        api.get('/buddies/check-ins'),
        api.get('/buddies/shared-activities'),
        api.get('/buddies/goals')
      ]);

      // Filter for this specific match
      setCheckIns(checkInsRes.data.checkIns.filter(c => c.matchId._id === match._id));
      setActivities(activitiesRes.data.activities.filter(a => a.matchId._id === match._id));
      setGoals(goalsRes.data.goals.filter(g => g.matchId._id === match._id));
    } catch (error) {
      console.error('Error fetching buddy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInCreated = () => {
    setShowScheduler(false);
    fetchData();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={() => setShowScheduler(true)}
            className="flex-col h-auto py-4"
          >
            <Calendar className="w-6 h-6 mb-2" />
            <span className="text-sm">Schedule Check-in</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.href = `/messages?buddy=${buddy._id}`}
            className="flex-col h-auto py-4"
          >
            <MessageCircle className="w-6 h-6 mb-2" />
            <span className="text-sm">Send Message</span>
          </Button>

          <SOSButton matchId={match._id} />

          <Button
            variant="outline"
            className="flex-col h-auto py-4"
            disabled
          >
            <Video className="w-6 h-6 mb-2" />
            <span className="text-sm">Video Call</span>
            <span className="text-xs text-gray-500">Coming Soon</span>
          </Button>
        </div>
      </Card>

      {/* Icebreaker Prompts */}
      <IcebreakerPrompts matchId={match._id} />

      {/* Upcoming Check-ins */}
      {checkIns.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Check-ins</h3>
          <div className="space-y-3">
            {checkIns.slice(0, 3).map(checkIn => (
              <div key={checkIn._id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{checkIn.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(checkIn.scheduledFor).toLocaleDateString()} at{' '}
                      {new Date(checkIn.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!checkIn.completed && (
                    <Button
                      size="sm"
                      onClick={async () => {
                        await api.post(`/buddies/check-in/${checkIn._id}/complete`);
                        fetchData();
                      }}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Shared Activities */}
      {activities.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Shared Activities</h3>
          <div className="space-y-4">
            {activities.map(activity => (
              <SharedActivityCard
                key={activity._id}
                activity={activity}
                onUpdate={fetchData}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Buddy Goals */}
      {goals.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Shared Goals</h3>
          <div className="space-y-4">
            {goals.map(goal => (
              <BuddyGoalCard
                key={goal._id}
                goal={goal}
                onUpdate={fetchData}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Check-in Scheduler Modal */}
      {showScheduler && (
        <CheckInScheduler
          matchId={match._id}
          onClose={() => setShowScheduler(false)}
          onCreated={handleCheckInCreated}
        />
      )}
    </div>
  );
};

export default BuddyEnhancements;
