import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, BookOpen, Play } from 'lucide-react';

const CBTCourse = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);

  // Mock data for 8-week CBT course
  const mockModules = [
    {
      moduleNumber: 1,
      title: "Introduction to CBT",
      description: "Learn the basics of Cognitive Behavioral Therapy and how it can help you",
      icon: "📚",
      duration: "1 week",
      isUnlocked: true,
      completed: false,
      lessons: [
        { title: "What is CBT?", duration: 15 },
        { title: "The CBT Model", duration: 20 },
        { title: "Setting Goals", duration: 10 }
      ]
    },
    {
      moduleNumber: 2,
      title: "Understanding Thoughts",
      description: "Identify and examine your automatic thoughts",
      icon: "💭",
      duration: "1 week",
      isUnlocked: true,
      completed: false,
      lessons: [
        { title: "Automatic Thoughts", duration: 15 },
        { title: "Thought Patterns", duration: 20 },
        { title: "Thought Monitoring", duration: 15 }
      ]
    },
    {
      moduleNumber: 3,
      title: "Cognitive Distortions",
      description: "Learn to recognize thinking errors that affect your mood",
      icon: "🧠",
      duration: "1 week",
      isUnlocked: false,
      completed: false,
      lessons: [
        { title: "Common Distortions", duration: 20 },
        { title: "Identifying Your Patterns", duration: 15 },
        { title: "Challenging Distortions", duration: 20 }
      ]
    },
    {
      moduleNumber: 4,
      title: "Challenging Negative Thoughts",
      description: "Develop skills to question and reframe unhelpful thoughts",
      icon: "⚡",
      duration: "1 week",
      isUnlocked: false,
      completed: false,
      lessons: [
        { title: "Evidence Examination", duration: 20 },
        { title: "Alternative Perspectives", duration: 15 },
        { title: "Balanced Thinking", duration: 20 }
      ]
    },
    {
      moduleNumber: 5,
      title: "Behavioral Activation",
      description: "Use activity to improve your mood and energy",
      icon: "🎯",
      duration: "1 week",
      isUnlocked: false,
      completed: false,
      lessons: [
        { title: "Activity and Mood", duration: 15 },
        { title: "Activity Scheduling", duration: 20 },
        { title: "Overcoming Avoidance", duration: 20 }
      ]
    },
    {
      moduleNumber: 6,
      title: "Core Beliefs",
      description: "Explore and modify deep-seated beliefs about yourself",
      icon: "🔍",
      duration: "1 week",
      isUnlocked: false,
      completed: false,
      lessons: [
        { title: "What are Core Beliefs?", duration: 15 },
        { title: "Identifying Your Beliefs", duration: 20 },
        { title: "Modifying Core Beliefs", duration: 25 }
      ]
    },
    {
      moduleNumber: 7,
      title: "Problem Solving",
      description: "Learn effective strategies for tackling life's challenges",
      icon: "🛠️",
      duration: "1 week",
      isUnlocked: false,
      completed: false,
      lessons: [
        { title: "Problem-Solving Steps", duration: 15 },
        { title: "Generating Solutions", duration: 20 },
        { title: "Decision Making", duration: 15 }
      ]
    },
    {
      moduleNumber: 8,
      title: "Maintaining Progress",
      description: "Develop a plan to maintain your gains and prevent relapse",
      icon: "🌟",
      duration: "1 week",
      isUnlocked: false,
      completed: false,
      lessons: [
        { title: "Reviewing Your Progress", duration: 20 },
        { title: "Relapse Prevention", duration: 20 },
        { title: "Your Ongoing Plan", duration: 15 }
      ]
    }
  ];

  useEffect(() => {
    setModules(mockModules);
  }, []);

  if (selectedModule) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedModule(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Modules
        </button>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-8">
          <div className="text-5xl mb-4">{selectedModule.icon}</div>
          <h2 className="text-3xl font-bold mb-2">Module {selectedModule.moduleNumber}: {selectedModule.title}</h2>
          <p className="text-indigo-100 mb-4">{selectedModule.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span>📅 {selectedModule.duration}</span>
            <span>📚 {selectedModule.lessons.length} lessons</span>
            <span>⏱️ {selectedModule.lessons.reduce((sum, l) => sum + l.duration, 0)} min total</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900">Lessons</h3>
          {selectedModule.lessons.map((lesson, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                  <p className="text-sm text-gray-600">{lesson.duration} minutes</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Start
              </button>
            </motion.div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">📝 Module Exercise</h4>
          <p className="text-yellow-800 text-sm mb-3">
            Complete a thought record this week focusing on the techniques you've learned.
          </p>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm">
            Start Exercise
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-2">8-Week CBT Program</h3>
        <p className="text-indigo-100">
          A structured course to help you master cognitive behavioral therapy techniques
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module, index) => (
          <motion.div
            key={module.moduleNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => module.isUnlocked && setSelectedModule(module)}
            className={`relative bg-white border-2 rounded-xl p-6 transition-all ${
              module.isUnlocked
                ? 'border-gray-200 hover:border-indigo-300 cursor-pointer hover:shadow-lg'
                : 'border-gray-200 opacity-60'
            }`}
          >
            {!module.isUnlocked && (
              <div className="absolute top-4 right-4">
                <Lock className="w-6 h-6 text-gray-400" />
              </div>
            )}
            {module.completed && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            )}

            <div className="text-4xl mb-3">{module.icon}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Module {module.moduleNumber}: {module.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{module.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {module.lessons.length} lessons
              </span>
              <span>📅 {module.duration}</span>
            </div>

            {module.isUnlocked && !module.completed && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                  Start Module →
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 How It Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Complete modules in order to unlock the next one</li>
          <li>• Each module takes about 1 week to complete</li>
          <li>• Watch lessons, complete exercises, and practice skills</li>
          <li>• Track your progress and earn badges</li>
        </ul>
      </div>
    </div>
  );
};

export default CBTCourse;
