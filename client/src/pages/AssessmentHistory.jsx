import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

const AssessmentHistory = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [type]);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/assessments/history/${type}`);
      setHistory(response.data.assessments);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentTitle = () => {
    switch (type) {
      case 'phq9': return 'PHQ-9 Depression';
      case 'gad7': return 'GAD-7 Anxiety';
      case 'stress': return 'Stress';
      case 'burnout': return 'Burnout';
      default: return 'Assessment';
    }
  };

  const getTrendIcon = () => {
    if (!stats) return null;
    switch (stats.trend) {
      case 'improving':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      case 'worsening':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTrendText = () => {
    if (!stats) return '';
    switch (stats.trend) {
      case 'improving':
        return 'Your scores are improving';
      case 'worsening':
        return 'Your scores are increasing';
      case 'stable':
        return 'Your scores are stable';
      default:
        return 'Insufficient data for trend';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'none':
      case 'minimal':
        return 'bg-green-100 text-green-700';
      case 'mild':
        return 'bg-yellow-100 text-yellow-700';
      case 'moderate':
        return 'bg-orange-100 text-orange-700';
      case 'moderately-severe':
      case 'severe':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const chartData = history.map(assessment => ({
    date: new Date(assessment.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: assessment.totalScore
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/assessments')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Assessments
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getAssessmentTitle()} History
          </h1>
          <p className="text-gray-600">
            Track your progress over time
          </p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No history yet</h3>
            <p className="text-gray-600 mb-6">
              Take your first {getAssessmentTitle()} assessment to start tracking
            </p>
            <button
              onClick={() => navigate(`/assessments/${type}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Take Assessment
            </button>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.count}
                </div>
                <div className="text-sm text-gray-600">Total Assessments</div>
              </div>
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.average.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {stats.min}
                </div>
                <div className="text-sm text-gray-600">Lowest Score</div>
              </div>
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {stats.max}
                </div>
                <div className="text-sm text-gray-600">Highest Score</div>
              </div>
            </div>

            {/* Trend */}
            {stats.trend !== 'insufficient-data' && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-8">
                <div className="flex items-center gap-3">
                  {getTrendIcon()}
                  <div>
                    <h3 className="font-bold text-gray-900">Trend Analysis</h3>
                    <p className="text-gray-600">{getTrendText()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-6">Score Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Assessment List */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Assessment History</h3>
              <div className="space-y-4">
                {history.map((assessment, index) => (
                  <motion.div
                    key={assessment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-bold text-gray-900 mb-1">
                        {new Date(assessment.completedAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(assessment.completedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {assessment.totalScore}
                        </div>
                        <div className="text-xs text-gray-600">Score</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(assessment.severity)}`}>
                        {assessment.severity.charAt(0).toUpperCase() + assessment.severity.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssessmentHistory;
