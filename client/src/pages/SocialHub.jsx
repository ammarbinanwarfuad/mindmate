import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, UserPlus, Gamepad2 } from 'lucide-react';

const SocialHub = () => {
  const features = [
    {
      id: 'study-buddy',
      title: 'Study Buddy Finder',
      description: 'Find study partners who share your academic goals and interests',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      link: '/social/study-buddy',
      features: [
        'Match by subjects and goals',
        'Schedule study sessions',
        'Share resources',
        'Track progress together'
      ]
    },
    {
      id: 'events',
      title: 'Local Events',
      description: 'Discover and organize local meetups, workshops, and social gatherings',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      link: '/social/events',
      features: [
        'Create and join events',
        'Online and in-person options',
        'RSVP and reminders',
        'Connect with attendees'
      ]
    },
    {
      id: 'groups',
      title: 'Interest Groups',
      description: 'Join communities based on your hobbies, interests, and passions',
      icon: UserPlus,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      link: '/social/groups',
      features: [
        'Topic-based communities',
        'Group discussions',
        'Share resources',
        'Organize group activities'
      ]
    },
    {
      id: 'game-nights',
      title: 'Virtual Game Nights',
      description: 'Join fun online game sessions and connect through play',
      icon: Gamepad2,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      link: '/social/game-nights',
      features: [
        'Scheduled game sessions',
        'Various game types',
        'Voice chat included',
        'Make new friends'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌐 Social Hub
          </h1>
          <p className="text-gray-600">
            Connect, collaborate, and build meaningful relationships
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={feature.link}>
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 ${feature.bgColor} rounded-xl`}>
                        <Icon className="w-8 h-8 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-green-600">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <button className={`w-full px-4 py-2 bg-gradient-to-r ${feature.color} text-white rounded-lg hover:shadow-lg transition-all font-medium`}>
                      Explore {feature.title}
                    </button>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">Why Connect?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <div className="font-semibold mb-1">🤝 Build Support Networks</div>
              <p>Connect with people who understand your journey</p>
            </div>
            <div>
              <div className="font-semibold mb-1">📚 Learn Together</div>
              <p>Share knowledge and grow through collaboration</p>
            </div>
            <div>
              <div className="font-semibold mb-1">🎉 Have Fun</div>
              <p>Enjoy activities and make lasting friendships</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialHub;
