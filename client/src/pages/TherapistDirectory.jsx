import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Video, Phone, MessageSquare, User, Filter, DollarSign, Calendar } from 'lucide-react';
import api from '../utils/api';

const TherapistDirectory = () => {
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
    sessionType: '',
    minRating: '',
    maxPrice: '',
    acceptingClients: false
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTherapists();
  }, [filters]);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await api.get(`/professional/therapists?${params}`);
      setTherapists(response.data.therapists || []);
    } catch (error) {
      console.error('Error fetching therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    'anxiety', 'depression', 'trauma', 'relationships', 'addiction', 
    'eating-disorders', 'grief', 'stress', 'bipolar', 'ocd', 'ptsd', 'general'
  ];

  const sessionTypes = [
    { value: 'video', icon: Video, label: 'Video' },
    { value: 'phone', icon: Phone, label: 'Phone' },
    { value: 'chat', icon: MessageSquare, label: 'Chat' },
    { value: 'in-person', icon: User, label: 'In-Person' }
  ];

  const getSessionIcon = (type) => {
    const session = sessionTypes.find(s => s.value === type);
    return session ? session.icon : User;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              👨‍⚕️ Find a Therapist
            </h1>
            <p className="text-gray-600">
              Connect with licensed mental health professionals
            </p>
          </div>
          <button
            onClick={() => navigate('/appointments')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Calendar className="w-5 h-5" />
            My Appointments
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <select
                  value={filters.specialization}
                  onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>
                      {spec.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder="Enter city"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Type
                </label>
                <select
                  value={filters.sessionType}
                  onChange={(e) => setFilters({ ...filters, sessionType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {sessionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="Max price per session"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.acceptingClients}
                    onChange={(e) => setFilters({ ...filters, acceptingClients: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Accepting new clients</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Therapist Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading therapists...</p>
          </div>
        ) : therapists.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No therapists found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapists.map((therapist, index) => (
              <motion.div
                key={therapist._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={therapist.photo}
                    alt={therapist.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{therapist.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{therapist.credentials}</p>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-semibold text-gray-900">
                        {therapist.rating.average.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-600">
                        ({therapist.rating.count})
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {therapist.bio}
                </p>

                <div className="space-y-2 mb-4">
                  {therapist.specializations.slice(0, 3).map(spec => (
                    <span
                      key={spec}
                      className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mr-2"
                    >
                      {spec.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{therapist.location.city}, {therapist.location.state}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {therapist.sessionTypes.map(type => {
                    const Icon = getSessionIcon(type);
                    return (
                      <div
                        key={type}
                        className="p-2 bg-gray-100 rounded-lg"
                        title={type}
                      >
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-1 text-gray-900">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-bold">${therapist.pricing.individual}</span>
                    <span className="text-sm text-gray-600">/session</span>
                  </div>
                  <Link
                    to={`/therapists/${therapist._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Profile
                  </Link>
                </div>

                {therapist.acceptingNewClients && (
                  <div className="mt-3 text-center">
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Accepting new clients
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistDirectory;
