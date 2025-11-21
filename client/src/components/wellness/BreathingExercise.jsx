import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';

const BreathingExercise = ({ type = 'box', onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [timeInPhase, setTimeInPhase] = useState(0);

  // Breathing patterns
  const patterns = {
    box: {
      name: 'Box Breathing',
      description: 'Breathe in 4, hold 4, out 4, hold 4',
      phases: [
        { name: 'Breathe In', duration: 4, color: 'from-blue-400 to-blue-600' },
        { name: 'Hold', duration: 4, color: 'from-purple-400 to-purple-600' },
        { name: 'Breathe Out', duration: 4, color: 'from-pink-400 to-pink-600' },
        { name: 'Hold', duration: 4, color: 'from-indigo-400 to-indigo-600' }
      ],
      totalCycles: 5
    },
    '478': {
      name: '4-7-8 Breathing',
      description: 'Breathe in 4, hold 7, out 8',
      phases: [
        { name: 'Breathe In', duration: 4, color: 'from-blue-400 to-blue-600' },
        { name: 'Hold', duration: 7, color: 'from-purple-400 to-purple-600' },
        { name: 'Breathe Out', duration: 8, color: 'from-pink-400 to-pink-600' }
      ],
      totalCycles: 4
    },
    calm: {
      name: 'Calm Breathing',
      description: 'Breathe in 4, hold 2, out 6',
      phases: [
        { name: 'Breathe In', duration: 4, color: 'from-blue-400 to-blue-600' },
        { name: 'Hold', duration: 2, color: 'from-purple-400 to-purple-600' },
        { name: 'Breathe Out', duration: 6, color: 'from-pink-400 to-pink-600' }
      ],
      totalCycles: 6
    }
  };

  const currentPattern = patterns[type];
  const currentPhaseData = currentPattern.phases[phase];

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTimeInPhase(prev => {
          if (prev >= currentPhaseData.duration - 1) {
            // Move to next phase
            setPhase(prevPhase => {
              const nextPhase = (prevPhase + 1) % currentPattern.phases.length;
              if (nextPhase === 0) {
                setCycles(prevCycles => {
                  const newCycles = prevCycles + 1;
                  if (newCycles >= currentPattern.totalCycles) {
                    setIsActive(false);
                    return newCycles;
                  }
                  return newCycles;
                });
              }
              return nextPhase;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, currentPhaseData.duration, currentPattern.phases.length, currentPattern.totalCycles]);

  const handleReset = () => {
    setIsActive(false);
    setPhase(0);
    setCycles(0);
    setTimeInPhase(0);
  };

  const circleScale = () => {
    if (currentPhaseData.name === 'Breathe In') {
      return 1 + (timeInPhase / currentPhaseData.duration) * 0.5;
    } else if (currentPhaseData.name === 'Breathe Out') {
      return 1.5 - (timeInPhase / currentPhaseData.duration) * 0.5;
    }
    return 1.5;
  };

  const isCompleted = cycles >= currentPattern.totalCycles;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-2xl w-full"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-2 text-white hover:bg-white/20 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">{currentPattern.name}</h2>
            <p className="text-white/80">{currentPattern.description}</p>
          </div>

          {/* Breathing Circle */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative w-80 h-80">
              {/* Animated Circle */}
              <motion.div
                animate={{
                  scale: circleScale(),
                }}
                transition={{
                  duration: 1,
                  ease: 'easeInOut'
                }}
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentPhaseData.color} opacity-80 blur-xl`}
              />
              
              <motion.div
                animate={{
                  scale: circleScale(),
                }}
                transition={{
                  duration: 1,
                  ease: 'easeInOut'
                }}
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentPhaseData.color} flex items-center justify-center shadow-2xl`}
              >
                <div className="text-center">
                  <motion.p
                    key={currentPhaseData.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white mb-2"
                  >
                    {currentPhaseData.name}
                  </motion.p>
                  <p className="text-6xl font-bold text-white">
                    {currentPhaseData.duration - timeInPhase}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Progress */}
          <div className="text-center mb-8">
            <p className="text-2xl font-semibold text-white mb-2">
              Cycle {Math.min(cycles + 1, currentPattern.totalCycles)} of {currentPattern.totalCycles}
            </p>
            <div className="w-full max-w-md mx-auto bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((cycles + (phase / currentPattern.phases.length)) / currentPattern.totalCycles) * 100}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Controls */}
          {!isCompleted ? (
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setIsActive(!isActive)}
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 w-32"
              >
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {cycles > 0 ? 'Resume' : 'Start'}
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/20"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </Button>
            </div>
          ) : (
            /* Completion */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-4">
                <p className="text-4xl mb-4">🎉</p>
                <h3 className="text-3xl font-bold text-white mb-2">
                  Exercise Complete!
                </h3>
                <p className="text-white/80 mb-6">
                  Great job! You completed {currentPattern.totalCycles} cycles.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleReset}
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Do Again
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white/20"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tips */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              💡 Tip: Find a quiet space and focus on your breath
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BreathingExercise;
