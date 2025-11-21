import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Calendar, Download, 
  Zap, Target, Activity, Moon, Sun, Flame
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';

const MoodAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [streak, setStreak] = useState(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, calendarRes, insightsRes, reportRes, streakRes] = await Promise.all([
        api.get(`/mood-analytics/analytics?days=${timeRange}`),
        api.get('/mood-analytics/calendar?days=90'),
        api.get('/mood-analytics/insights'),
        api.get('/mood-analytics/report'),
        api.get('/mood-analytics/streak')
      ]);

      setAnalytics(analyticsRes.data.analytics);
      setCalendarData(calendarRes.data.calendarData);
      setInsights(insightsRes.data.insights);
      setWeeklyReport(reportRes.data.report);
      setStreak(streakRes.data.streak);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/mood-analytics/export?format=${format}&days=${timeRange}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mood-data-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const getMoodColor = (mood) => {
    if (mood <= 2) return '#ef4444'; // red
    if (mood <= 4) return '#f97316'; // orange
    if (mood <= 6) return '#eab308'; // yellow
    if (mood <= 8) return '#84cc16'; // lime
    return '#22c55e'; // green
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'declining') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!analytics || analytics.totalEntries === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Mood Analytics</h1>
          <Card className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-gray-600 mb-6">Start logging your mood to see analytics and insights</p>
            <Button onClick={() => window.location.href = '/mood-tracker'}>
              Log Your Mood
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const moodTrendData = analytics.entries.map(entry => ({
    date: new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: entry.moodScore
  }));

  const allDistributionData = [
    { name: 'Very Low (1-2)', value: analytics.moodDistribution.veryLow, color: '#ef4444' },
    { name: 'Low (3-4)', value: analytics.moodDistribution.low, color: '#f97316' },
    { name: 'Medium (5-6)', value: analytics.moodDistribution.medium, color: '#eab308' },
    { name: 'High (7-8)', value: analytics.moodDistribution.high, color: '#84cc16' },
    { name: 'Very High (9-10)', value: analytics.moodDistribution.veryHigh, color: '#22c55e' }
  ];
  
  const distributionData = allDistributionData.filter(item => item.value > 0); // Only show non-zero for pie chart

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mood Analytics</h1>
            <p className="text-gray-600">Understand your emotional patterns and trends</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Average Mood */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Average Mood</h3>
              <Activity className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900">{analytics.averageMood}</p>
              <p className="text-sm text-gray-500 mb-1">/10</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(analytics.moodTrend)}
              <span className="text-sm text-gray-600 capitalize">{analytics.moodTrend}</span>
            </div>
          </Card>

          {/* Total Entries */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Entries Logged</h3>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalEntries}</p>
            <p className="text-sm text-gray-500 mt-2">in last {timeRange} days</p>
          </Card>

          {/* Current Streak */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-900">{streak?.currentStreak || 0}</p>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Longest: {streak?.longestStreak || 0} days</p>
          </Card>

          {/* Weekly Change */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">This Week</h3>
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-900">{weeklyReport?.averageMood || 0}</p>
              {weeklyReport?.changePercent && (
                <span className={`text-sm font-medium ${parseFloat(weeklyReport.changePercent) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(weeklyReport.changePercent) > 0 ? '+' : ''}{weeklyReport.changePercent}%
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">{weeklyReport?.entriesLogged || 0} entries this week</p>
          </Card>
        </div>

        {/* Mood Trend Chart */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Mood Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Mood Distribution */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Mood Distribution</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={allDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6">
                  {allDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Calendar Heatmap */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Mood Calendar</h2>
          <div className="overflow-x-auto">
            <CalendarHeatmap
              startDate={new Date(new Date().setDate(new Date().getDate() - 90))}
              endDate={new Date()}
              values={calendarData}
              classForValue={(value) => {
                if (!value || !value.mood) return 'color-empty';
                if (value.mood <= 3) return 'color-scale-1';
                if (value.mood <= 5) return 'color-scale-2';
                if (value.mood <= 7) return 'color-scale-3';
                return 'color-scale-4';
              }}
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) return {};
                return {
                  'data-tip': `${value.date}: Mood ${value.mood || 'No data'}/10${value.note ? ` - ${value.note}` : ''}`
                };
              }}
              showWeekdayLabels
            />
          </div>
          <style jsx>{`
            .color-empty { fill: #ebedf0; }
            .color-scale-1 { fill: #ef4444; }
            .color-scale-2 { fill: #f97316; }
            .color-scale-3 { fill: #84cc16; }
            .color-scale-4 { fill: #22c55e; }
          `}</style>
        </Card>

        {/* Insights & Triggers */}
        {insights && insights.triggers && insights.triggers.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <Zap className="w-6 h-6 inline mr-2 text-yellow-500" />
              Insights & Triggers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.triggers.map((trigger, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-3">
                    {trigger.type === 'sleep' && <Moon className="w-5 h-5 text-purple-600 mt-1" />}
                    {trigger.type === 'activity' && <Activity className="w-5 h-5 text-blue-600 mt-1" />}
                    {trigger.type === 'day_of_week' && <Calendar className="w-5 h-5 text-green-600 mt-1" />}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{trigger.factor}</h3>
                      <p className="text-sm text-gray-700 mb-2">{trigger.insight}</p>
                      <p className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full inline-block">
                        💡 {trigger.recommendation}
                      </p>
                      <span className={`ml-2 text-xs font-medium px-2 py-1 rounded ${
                        trigger.impact === 'high' ? 'bg-red-100 text-red-700' :
                        trigger.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {trigger.impact} impact
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Correlations */}
        {insights && insights.correlations && insights.correlations.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Correlations</h2>
            <div className="space-y-4">
              {insights.correlations.map((corr, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{corr.factor}</h3>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      corr.strength === 'strong' ? 'bg-green-100 text-green-700' :
                      corr.strength === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {corr.strength} ({corr.correlation})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{corr.insight}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Prediction */}
        {insights && insights.prediction && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              <Sun className="w-6 h-6 inline mr-2 text-yellow-500" />
              Mood Prediction
            </h2>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                {insights.prediction.day}: Expected mood around {insights.prediction.expectedMood}/10
              </p>
              <p className="text-sm text-gray-600 mb-2">{insights.prediction.insight}</p>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                {insights.prediction.confidence} confidence
              </span>
            </div>
          </Card>
        )}

        {/* Best & Worst Days */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Best Days 🌟</h2>
            <div className="space-y-3">
              {analytics.bestDays.map((day, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(day.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-lg font-bold text-green-600">{day.mood}/10</span>
                  </div>
                  {day.note && <p className="text-xs text-gray-600 mt-1">{day.note.substring(0, 50)}...</p>}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Challenging Days 💪</h2>
            <div className="space-y-3">
              {analytics.worstDays.map((day, index) => (
                <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(day.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-lg font-bold text-orange-600">{day.mood}/10</span>
                  </div>
                  {day.note && <p className="text-xs text-gray-600 mt-1">{day.note.substring(0, 50)}...</p>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MoodAnalytics;
