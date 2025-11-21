import { useState, useEffect } from 'react';
import { Search, Filter, Heart, Clock, TrendingUp, Star, Play } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ActivityPlayer from '../components/wellness/ActivityPlayer';
import api from '../utils/api';

const WellnessLibrary = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, searchTerm, selectedType, selectedDifficulty, selectedCategory, showFavoritesOnly]);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/wellness/activities');
      setActivities(response.data.activities);
      setFilteredActivities(response.data.activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedType);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(activity => activity.difficulty === selectedDifficulty);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(activity => activity.userProgress?.isFavorite);
    }

    setFilteredActivities(filtered);
  };

  const handleStartActivity = (activity) => {
    setSelectedActivity(activity);
    setShowPlayer(true);
  };

  const handleToggleFavorite = async (activityId, isFavorite) => {
    try {
      if (isFavorite) {
        await api.delete(`/wellness/favorites/${activityId}`);
      } else {
        await api.post(`/wellness/favorites/${activityId}`);
      }
      
      // Update local state
      setActivities(activities.map(activity =>
        activity._id === activityId
          ? {
              ...activity,
              userProgress: {
                ...activity.userProgress,
                isFavorite: !isFavorite
              }
            }
          : activity
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      meditation: '🧘',
      breathing: '🌬️',
      sleep: '😴',
      yoga: '🤸',
      mindfulness: '🧠',
      relaxation: '😌'
    };
    return icons[type] || '✨';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Wellness Library</h1>
          <p className="text-xl text-gray-600">Guided activities for your mental wellness journey</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="meditation">Meditation</option>
              <option value="breathing">Breathing</option>
              <option value="sleep">Sleep</option>
              <option value="yoga">Yoga</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="relaxation">Relaxation</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              <option value="stress-relief">Stress Relief</option>
              <option value="sleep">Sleep</option>
              <option value="anxiety">Anxiety</option>
              <option value="focus">Focus</option>
              <option value="energy">Energy</option>
              <option value="calm">Calm</option>
            </select>
          </div>

          {/* Favorites Toggle */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFavoritesOnly
                  ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favorites Only
            </button>
            <span className="text-sm text-gray-600">
              Showing {filteredActivities.length} of {activities.length} activities
            </span>
          </div>
        </Card>

        {/* Activities Grid */}
        {filteredActivities.length === 0 ? (
          <Card className="p-12 text-center">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <Card
                key={activity._id}
                className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Activity Header */}
                <div className="relative h-48 bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
                  <span className="text-6xl">{getTypeIcon(activity.type)}</span>
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => handleToggleFavorite(activity._id, activity.userProgress?.isFavorite)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        activity.userProgress?.isFavorite
                          ? 'fill-pink-500 text-pink-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>

                  {/* Difficulty Badge */}
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                    {activity.difficulty}
                  </span>
                </div>

                {/* Activity Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{activity.description}</p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {activity.duration} min
                    </div>
                    {activity.userProgress && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {activity.userProgress.totalCompletions}x
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activity.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Benefits */}
                  {activity.benefits && activity.benefits.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Benefits:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {activity.benefits.slice(0, 2).map((benefit, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-green-500">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Start Button */}
                  <Button
                    onClick={() => handleStartActivity(activity)}
                    className="w-full"
                  >
                    <Play className="w-4 h-4" />
                    Start Activity
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Activity Player Modal */}
      {showPlayer && selectedActivity && (
        <ActivityPlayer
          activity={selectedActivity}
          onClose={() => {
            setShowPlayer(false);
            setSelectedActivity(null);
            fetchActivities(); // Refresh to update progress
          }}
        />
      )}
    </div>
  );
};

export default WellnessLibrary;
