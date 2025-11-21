import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, TrendingUp, Brain, Heart, Zap, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const AssessmentHub = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/assessments/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const assessments = [
    {
      id: 'phq9',
      title: 'PHQ-9',
      subtitle: 'Depression Screening',
      description: 'Patient Health Questionnaire - 9 item depression scale',
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      questions: 9,
      time: '5 min'
    },
    {
      id: 'gad7',
      title: 'GAD-7',
      subtitle: 'Anxiety Screening',
      description: 'Generalized Anxiety Disorder - 7 item anxiety scale',
      icon: Heart,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      questions: 7,
      time: '3 min'
    },
    {
      id: 'stress',
      title: 'Stress Assessment',
      subtitle: 'Stress Level Screening',
      description: 'Evaluate your current stress levels and coping',
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      questions: 10,
      time: '5 min'
    },
    {
      id: 'burnout',
      title: 'Burnout Assessment',
      subtitle: 'Burnout Screening',
      description: 'Assess signs of emotional and physical exhaustion',
      icon: AlertCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      questions: 10,
      time: '5 min'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'none':
      case 'minimal':
        return 'text-green-600';
      case 'mild':
        return 'text-yellow-600';
      case 'moderate':
        return 'text-orange-600';
      case 'moderately-severe':
      case 'severe':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📋 Self-Assessment Tools
          </h1>
          <p className="text-gray-600">
            Track your mental health with validated screening tools
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Important Information</h3>
              <p className="text-sm text-blue-800">
                These assessments are screening tools and not diagnostic instruments. 
                They can help you understand your symptoms, but only a qualified healthcare 
                professional can provide a diagnosis. If you're experiencing severe symptoms, 
                please seek professional help immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Assessment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {assessments.map((assessment, index) => {
            const Icon = assessment.icon;
            const latestScore = stats?.byType[assessment.id]?.latest;

            return (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 ${assessment.bgColor} rounded-xl`}>
                    <Icon className="w-8 h-8 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {assessment.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{assessment.subtitle}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{assessment.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <span>📝 {assessment.questions} questions</span>
                  <span>⏱️ {assessment.time}</span>
                </div>

                {latestScore && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last assessment:</span>
                      <span className={`text-sm font-bold ${getSeverityColor(latestScore.severity)}`}>
                        {latestScore.severity.charAt(0).toUpperCase() + latestScore.severity.slice(1)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(latestScore.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link
                    to={`/assessments/${assessment.id}`}
                    className={`flex-1 px-4 py-2 bg-gradient-to-r ${assessment.color} text-white rounded-lg hover:shadow-lg transition-all text-center font-medium`}
                  >
                    Take Assessment
                  </Link>
                  {stats?.byType[assessment.id]?.count > 0 && (
                    <Link
                      to={`/assessments/${assessment.id}/history`}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <TrendingUp className="w-5 h-5" />
                      History
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Assessments */}
        {stats && stats.total > 0 && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Assessment Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.byType).map(([type, data]) => {
                const assessment = assessments.find(a => a.id === type);
                if (!assessment || data.count === 0) return null;

                return (
                  <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {data.count}
                    </div>
                    <div className="text-sm text-gray-600">
                      {assessment.title} completed
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentHub;
