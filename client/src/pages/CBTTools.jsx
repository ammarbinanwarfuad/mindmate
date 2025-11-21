import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, Activity, Heart, BookOpen, Sparkles } from 'lucide-react';
import ThoughtRecordForm from '../components/cbt/ThoughtRecordForm';
import DistortionChecker from '../components/cbt/DistortionChecker';
import BehavioralActivationPlanner from '../components/cbt/BehavioralActivationPlanner';
import GratitudePractice from '../components/cbt/GratitudePractice';
import AffirmationsDisplay from '../components/cbt/AffirmationsDisplay';
import CBTCourse from '../components/cbt/CBTCourse';

const CBTTools = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tools = [
    {
      id: 'thought-record',
      title: 'Thought Record',
      description: 'Challenge negative thoughts with structured CBT exercises',
      icon: <FileText className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      component: <ThoughtRecordForm />
    },
    {
      id: 'distortion-checker',
      title: 'Distortion Checker',
      description: 'Identify cognitive distortions in your thinking patterns',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      component: <DistortionChecker />
    },
    {
      id: 'behavioral-activation',
      title: 'Behavioral Activation',
      description: 'Plan and track activities to improve your mood',
      icon: <Activity className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      component: <BehavioralActivationPlanner />
    },
    {
      id: 'gratitude',
      title: 'Gratitude Practice',
      description: 'Cultivate positivity through daily gratitude journaling',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-pink-500 to-pink-600',
      component: <GratitudePractice />
    },
    {
      id: 'affirmations',
      title: 'Affirmations',
      description: 'Positive affirmations to boost your self-esteem',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-yellow-500 to-orange-600',
      component: <AffirmationsDisplay />
    },
    {
      id: 'course',
      title: 'CBT Course',
      description: '8-week structured CBT program for lasting change',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-indigo-500 to-indigo-600',
      component: <CBTCourse />
    }
  ];

  const activeTool = tools.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧠 CBT Tools
          </h1>
          <p className="text-gray-600">
            Evidence-based cognitive behavioral therapy techniques
          </p>
        </motion.div>

        {activeTab === 'overview' ? (
          /* Overview Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveTab(tool.id)}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white mb-4`}>
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {tool.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {tool.description}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Active Tool */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            {/* Back Button */}
            <button
              onClick={() => setActiveTab('overview')}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Tools
            </button>

            {/* Tool Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${activeTool.color} flex items-center justify-center text-white`}>
                {activeTool.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTool.title}
                </h2>
                <p className="text-gray-600">
                  {activeTool.description}
                </p>
              </div>
            </div>

            {/* Tool Component */}
            {activeTool.component}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CBTTools;
