import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Award, Mic, Globe } from 'lucide-react';
import api from '../utils/api';

const AIInsights = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get active tab from URL query parameter
  const getActiveTabFromUrl = () => {
    return searchParams.get('tab') || 'insights';
  };
  
  const [insights, setInsights] = useState(null);
  const [crisisAssessment, setcrisisAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Sync tab with URL on location change
  useEffect(() => {
    const tabFromUrl = getActiveTabFromUrl();
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [insightsRes, crisisRes] = await Promise.all([
        api.get('/ai/user-insights'),
        api.get('/ai/crisis-assessment')
      ]);
      setInsights(insightsRes.data.insights);
      setcrisisAssessment(crisisRes.data.assessment);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'none': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 AI Insights
          </h1>
          <p className="text-gray-600">
            Personalized insights powered by advanced AI analysis
          </p>
        </div>

        {/* Language & Voice Controls */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Globe className="w-6 h-6 text-blue-600" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              voiceEnabled
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <Mic className="w-5 h-5" />
            Voice {voiceEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Crisis Assessment Alert */}
        {crisisAssessment && crisisAssessment.level !== 'none' && (
          <div className={`rounded-xl border-2 p-6 mb-6 ${getRiskColor(crisisAssessment.level)}`}>
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">
                  Crisis Risk Assessment: {crisisAssessment.level.toUpperCase()}
                </h3>
                <p className="mb-4">
                  Based on your recent activity, our AI has detected some concerning patterns.
                </p>
                {crisisAssessment.requiresIntervention && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                    <p className="font-semibold mb-2">⚠️ Immediate Action Recommended</p>
                    <p className="text-sm">
                      Please consider reaching out to a mental health professional or crisis helpline.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="font-semibold">Recommendations:</p>
                  <ul className="space-y-1">
                    {crisisAssessment.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span>•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {['insights', 'mood', 'behavior', 'mental-health'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                navigate(`/ai-insights?tab=${tab}`);
              }}
              className={`px-6 py-3 font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'insights' && insights && (
          <div className="space-y-6">
            {/* Strengths */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Your Strengths</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Growth */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Areas for Growth</h3>
              </div>
              <div className="space-y-3">
                {insights.areasForGrowth.map((area, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl font-bold text-gray-900">Personalized Recommendations</h3>
              </div>
              <div className="space-y-4">
                {insights.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rec.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{rec.action}</h4>
                    <p className="text-sm text-gray-600">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mood' && insights && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Mood Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {insights.moodInsights.average.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Average Mood</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1 capitalize">
                  {insights.moodInsights.trend}
                </div>
                <div className="text-sm text-gray-600">Trend</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {insights.moodInsights.volatility.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Volatility</div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-700">{insights.moodInsights.interpretation}</p>
            </div>
          </div>
        )}

        {activeTab === 'behavior' && insights && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Behavior Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {insights.behaviorInsights.journalingFrequency}
                </div>
                <div className="text-sm text-gray-600">Journal Entries</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1 capitalize">
                  {insights.behaviorInsights.activityLevel}
                </div>
                <div className="text-sm text-gray-600">Activity Level</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1 capitalize">
                  {insights.behaviorInsights.socialEngagement}
                </div>
                <div className="text-sm text-gray-600">Social Engagement</div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-gray-700">{insights.behaviorInsights.interpretation}</p>
            </div>
          </div>
        )}

        {activeTab === 'mental-health' && insights && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">Mental Health Insights</h3>
            </div>
            <div className="space-y-4 mb-6">
              {Object.entries(insights.mentalHealthInsights.assessmentScores).map(([type, score]) => (
                <div key={type} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 uppercase">{type}</span>
                    <span className="text-2xl font-bold text-gray-900">{score.totalScore}</span>
                  </div>
                  <div className="text-sm text-gray-600">{score.severity}</div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-gray-700">{insights.mentalHealthInsights.interpretation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
