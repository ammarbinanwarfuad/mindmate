import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Heart, Brain, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import BreathingExercise from './BreathingExercise';

const QuickRelief = ({ onClose }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);

  const exercises = [
    {
      id: 'box',
      name: 'Box Breathing',
      description: 'Quick 2-minute stress relief',
      icon: <Wind className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      duration: '2 min'
    },
    {
      id: '478',
      name: '4-7-8 Breathing',
      description: 'Calm anxiety instantly',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-pink-500 to-rose-500',
      duration: '2 min'
    },
    {
      id: 'calm',
      name: 'Calm Breathing',
      description: 'Simple deep breathing',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-purple-500 to-indigo-500',
      duration: '3 min'
    }
  ];

  const groundingTechnique = {
    name: '5-4-3-2-1 Grounding',
    steps: [
      { sense: 'See', instruction: 'Name 5 things you can see', icon: '👁️' },
      { sense: 'Touch', instruction: 'Name 4 things you can touch', icon: '✋' },
      { sense: 'Hear', instruction: 'Name 3 things you can hear', icon: '👂' },
      { sense: 'Smell', instruction: 'Name 2 things you can smell', icon: '👃' },
      { sense: 'Taste', instruction: 'Name 1 thing you can taste', icon: '👅' }
    ]
  };

  const affirmations = [
    "I am safe right now",
    "This feeling will pass",
    "I am stronger than my anxiety",
    "I can handle this moment",
    "I choose peace over worry",
    "I am in control of my breath",
    "This too shall pass",
    "I am doing my best"
  ];

  const [currentAffirmation] = useState(
    affirmations[Math.floor(Math.random() * affirmations.length)]
  );

  if (selectedExercise) {
    return (
      <BreathingExercise
        type={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    );
  }

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
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary-500 to-secondary-600 text-white p-8 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/20 rounded-full">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Quick Relief</h2>
                <p className="text-primary-100">Instant calm when you need it most</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Affirmation */}
            <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <p className="text-center text-2xl font-semibold text-gray-900 italic">
                "{currentAffirmation}"
              </p>
            </div>

            {/* Breathing Exercises */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Breathing Exercises</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exercises.map((exercise) => (
                  <motion.button
                    key={exercise.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedExercise(exercise.id)}
                    className={`p-6 bg-gradient-to-br ${exercise.color} text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-3">{exercise.icon}</div>
                      <h4 className="font-bold text-lg mb-1">{exercise.name}</h4>
                      <p className="text-sm opacity-90 mb-2">{exercise.description}</p>
                      <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                        {exercise.duration}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Grounding Technique */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {groundingTechnique.name}
              </h3>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-4">
                  Use your five senses to ground yourself in the present moment:
                </p>
                <div className="space-y-3">
                  {groundingTechnique.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg"
                    >
                      <span className="text-3xl">{step.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{step.sense}</p>
                        <p className="text-sm text-gray-600">{step.instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Splash cold water on your face to activate the dive reflex</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Hold an ice cube to ground yourself in the present</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Count backwards from 100 by 7s to distract your mind</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Progressive muscle relaxation: tense and release each muscle group</span>
                </li>
              </ul>
            </div>

            {/* Crisis Resources */}
            <div className="mt-6 p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <p className="text-sm text-red-900 font-semibold mb-2">
                🆘 In Crisis? Get Immediate Help
              </p>
              <p className="text-xs text-red-700">
                National Crisis Hotline: <a href="tel:988" className="underline font-bold">988</a> or{' '}
                <a href="tel:1-800-273-8255" className="underline">1-800-273-8255</a>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickRelief;
