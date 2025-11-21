import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import api from '../../utils/api';

const ActivityPlayer = ({ activity, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let interval;
    if (isPlaying && !isCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          if (newTime >= activity.duration * 60) {
            setIsPlaying(false);
            setIsCompleted(true);
            return activity.duration * 60;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isCompleted, activity.duration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTimeElapsed(0);
    setCurrentStep(0);
    setIsCompleted(false);
  };

  const handleComplete = async () => {
    try {
      await api.post(`/wellness/activities/${activity._id}/complete`, {
        duration: Math.ceil(timeElapsed / 60),
        rating: rating > 0 ? rating : undefined,
        notes: notes || undefined
      });
      
      // Show success message
      alert('Activity completed! Great job! 🎉');
      onClose();
    } catch (error) {
      console.error('Error completing activity:', error);
      alert('Failed to save completion');
    }
  };

  const progress = (timeElapsed / (activity.duration * 60)) * 100;

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
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary-500 to-secondary-600 text-white p-8 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl font-bold mb-2">{activity.title}</h2>
            <p className="text-primary-100">{activity.description}</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {!isCompleted ? (
              <>
                {/* Timer Display */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-gray-900">
                        {formatTime(timeElapsed)}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        / {activity.duration} min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mb-8">
                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="w-32"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        {timeElapsed > 0 ? 'Resume' : 'Start'}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </Button>
                </div>

                {/* Instructions */}
                {activity.instructions && activity.instructions.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
                    <div className="space-y-3">
                      {activity.instructions.map((instruction, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                            index === currentStep && isPlaying
                              ? 'bg-primary-100 border-2 border-primary-500'
                              : 'bg-white'
                          }`}
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {instruction.step}
                          </span>
                          <p className="text-gray-700">{instruction.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {activity.benefits && activity.benefits.length > 0 && (
                  <div className="mt-6 bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                    <ul className="space-y-2">
                      {activity.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-green-500 mt-1">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              /* Completion Screen */
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-12 h-12 text-green-600" />
                </motion.div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Activity Completed! 🎉
                </h3>
                <p className="text-gray-600 mb-8">
                  Great job! You completed {activity.title}
                </p>

                {/* Rating */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">How was this activity?</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How do you feel? Any insights?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                {/* Complete Button */}
                <Button
                  onClick={handleComplete}
                  size="lg"
                  className="w-full"
                >
                  Save & Continue
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActivityPlayer;
