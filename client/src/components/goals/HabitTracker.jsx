import { useState, useEffect } from 'react';
import { X, Calendar, TrendingUp, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import Button from '../ui/Button';

const HabitTracker = ({ goal, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completedDates, setCompletedDates] = useState([]);

  useEffect(() => {
    setCompletedDates(goal.completedDates.map(d => new Date(d)));
  }, [goal]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const isDateCompleted = (date) => {
    return completedDates.some(completedDate => 
      isSameDay(new Date(completedDate), date)
    );
  };

  const getCompletionRate = () => {
    const daysCompleted = completedDates.filter(date => {
      const d = new Date(date);
      return d >= monthStart && d <= monthEnd;
    }).length;
    
    const totalDays = daysInMonth.length;
    return Math.round((daysCompleted / totalDays) * 100);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div 
            className="relative p-8 rounded-t-2xl text-white"
            style={{ 
              background: `linear-gradient(135deg, ${goal.color} 0%, ${goal.color}dd 100%)`
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-6xl">{goal.icon}</span>
              <div>
                <h2 className="text-3xl font-bold">{goal.title}</h2>
                <p className="text-white/90">{goal.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">Progress</span>
                </div>
                <p className="text-2xl font-bold">{goal.progressPercentage}%</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-5 h-5" />
                  <span className="text-sm font-medium">Streak</span>
                </div>
                <p className="text-2xl font-bold">{goal.streak} days</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">This Month</span>
                </div>
                <p className="text-2xl font-bold">{getCompletionRate()}%</p>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}

              {/* Calendar days */}
              {daysInMonth.map(day => {
                const completed = isDateCompleted(day);
                const today = isToday(day);
                
                return (
                  <motion.div
                    key={day.toISOString()}
                    whileHover={{ scale: 1.1 }}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                      transition-all cursor-pointer
                      ${completed 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : today
                        ? 'bg-gray-200 text-gray-900 border-2 border-primary-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    <div className="text-center">
                      <div>{format(day, 'd')}</div>
                      {completed && <div className="text-xs">✓</div>}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <span className="text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 border-2 border-primary-500 rounded"></div>
                <span className="text-gray-600">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 rounded"></div>
                <span className="text-gray-600">Pending</span>
              </div>
            </div>

            {/* Goal Info */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Goal Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Target:</span>
                  <span className="ml-2 font-semibold text-gray-900">{goal.target} completions</span>
                </div>
                <div>
                  <span className="text-gray-600">Current:</span>
                  <span className="ml-2 font-semibold text-gray-900">{goal.currentProgress} completions</span>
                </div>
                <div>
                  <span className="text-gray-600">Frequency:</span>
                  <span className="ml-2 font-semibold text-gray-900 capitalize">{goal.frequency}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-semibold text-gray-900 capitalize">{goal.status}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HabitTracker;
