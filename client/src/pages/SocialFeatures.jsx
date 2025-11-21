import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, UserPlus, Gamepad2, Plus, Search, MapPin, Clock } from 'lucide-react';
import api from '../utils/api';

const SocialFeatures = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active tab from URL
  const getActiveTabFromUrl = () => {
    const path = location.pathname;
    if (path.includes('/study-buddy')) return 'study-buddy';
    if (path.includes('/events')) return 'events';
    if (path.includes('/groups')) return 'groups';
    if (path.includes('/game-nights')) return 'game-nights';
    return 'study-buddy'; // default
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
  const [studyBuddies, setStudyBuddies] = useState([]);
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sync tab with URL on location change
  useEffect(() => {
    const tabFromUrl = getActiveTabFromUrl();
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'study-buddy':
          const buddiesRes = await api.get('/social/study-buddy/search');
          setStudyBuddies(buddiesRes.data.buddies || []);
          break;
        case 'events':
          const eventsRes = await api.get('/social/events?upcoming=true');
          setEvents(eventsRes.data.events || []);
          break;
        case 'groups':
          const groupsRes = await api.get('/social/groups');
          setGroups(groupsRes.data.groups || []);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await api.post(`/social/events/${eventId}/join`);
      alert('Successfully joined event!');
      fetchData();
    } catch (error) {
      console.error('Error joining event:', error);
      alert(error.response?.data?.message || 'Failed to join event');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await api.post(`/social/groups/${groupId}/join`);
      alert('Successfully joined group!');
      fetchData();
    } catch (error) {
      console.error('Error joining group:', error);
      alert(error.response?.data?.message || 'Failed to join group');
    }
  };

  const tabs = [
    { id: 'study-buddy', label: 'Study Buddies', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'groups', label: 'Groups', icon: UserPlus },
    { id: 'game-nights', label: 'Game Nights', icon: Gamepad2 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌐 Social Features
          </h1>
          <p className="text-gray-600">
            Connect with others and build your community
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  navigate(`/social/${tab.id}`);
                }}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'study-buddy' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Find Study Buddies</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Create Profile
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : studyBuddies.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No study buddies yet</h3>
                <p className="text-gray-600">Create your profile to start connecting</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studyBuddies.map((buddy, index) => (
                  <motion.div
                    key={buddy._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border-2 border-gray-200 p-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {buddy.userId?.profile?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {buddy.userId?.profile?.name || 'Anonymous'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{buddy.university}</p>
                        <div className="flex flex-wrap gap-2">
                          {buddy.subjects.slice(0, 3).map(subject => (
                            <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">{buddy.bio}</p>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Connect
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No events yet</h3>
                <p className="text-gray-600">Be the first to create an event</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border-2 border-gray-200 p-6"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h3>
                            <p className="text-sm text-gray-600">
                              by {event.organizerId?.profile?.name || 'Anonymous'}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {event.type.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {event.startTime} - {event.endTime}
                          </div>
                          {event.location?.city && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {event.location.city}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleJoinEvent(event._id)}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            Join Event
                          </button>
                          <span className="text-sm text-gray-600">
                            {event.attendees.length} / {event.maxAttendees} attending
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Interest Groups</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-5 h-5" />
                Create Group
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : groups.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No groups yet</h3>
                <p className="text-gray-600">Create the first group</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group, index) => (
                  <motion.div
                    key={group._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-lg transition-all"
                  >
                    <img
                      src={group.imageUrl}
                      alt={group.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2">{group.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">
                          {group.memberCount} members
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {group.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleJoinGroup(group._id)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Join Group
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'game-nights' && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Virtual Game Nights</h3>
            <p className="text-gray-600 mb-6">
              Join scheduled game sessions and connect through play
            </p>
            <button className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium">
              View Game Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeatures;
