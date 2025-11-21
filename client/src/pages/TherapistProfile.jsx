import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Star, MapPin, Phone, Mail, Globe, Video, 
  MessageSquare, User, Calendar, Clock, DollarSign, Award, Languages
} from 'lucide-react';
import api from '../utils/api';

const TherapistProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    type: 'video',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchTherapist();
  }, [id]);

  const fetchTherapist = async () => {
    try {
      const response = await api.get(`/professional/therapists/${id}`);
      setTherapist(response.data.therapist);
    } catch (error) {
      console.error('Error fetching therapist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/professional/appointments', {
        therapistId: id,
        ...bookingData,
        endTime: calculateEndTime(bookingData.startTime)
      });
      
      if (response.data.success) {
        alert('Appointment booked successfully!');
        navigate('/appointments');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':');
    const endHour = parseInt(hours) + 1;
    return `${endHour.toString().padStart(2, '0')}:${minutes}`;
  };

  const getSessionIcon = (type) => {
    switch (type) {
      case 'video': return Video;
      case 'phone': return Phone;
      case 'chat': return MessageSquare;
      case 'in-person': return User;
      default: return User;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Therapist not found</h2>
          <button
            onClick={() => navigate('/therapists')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/therapists')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Directory
          </button>
          <button
            onClick={() => navigate('/appointments')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Calendar className="w-5 h-5" />
            My Appointments
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={therapist.photo}
              alt={therapist.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {therapist.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-3">{therapist.credentials}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-lg font-bold text-gray-900">
                        {therapist.rating.average.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      ({therapist.rating.count} reviews)
                    </span>
                  </div>
                  {therapist.verified && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <Award className="w-4 h-4" />
                      Verified Professional
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ${therapist.pricing.individual}
                  </div>
                  <div className="text-sm text-gray-600">per session</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {therapist.specializations.map(spec => (
                  <span
                    key={spec}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {spec.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                ))}
              </div>

              {therapist.acceptingNewClients && (
                <button
                  onClick={() => setShowBooking(true)}
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Book Appointment
                </button>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 whitespace-pre-line">{therapist.bio}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Experience */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-gray-900">Experience</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{therapist.experience} years</p>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Languages className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-gray-900">Languages</h3>
            </div>
            <p className="text-gray-700">{therapist.languages.join(', ')}</p>
          </div>

          {/* Session Types */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-3">Session Types</h3>
            <div className="flex flex-wrap gap-2">
              {therapist.sessionTypes.map(type => {
                const Icon = getSessionIcon(type);
                return (
                  <div
                    key={type}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                  >
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700 capitalize">
                      {type.replace('-', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-gray-900">Location</h3>
            </div>
            <p className="text-gray-700">
              {therapist.location.address}<br />
              {therapist.location.city}, {therapist.location.state} {therapist.location.zipCode}
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <a href={`mailto:${therapist.contact.email}`} className="text-blue-600 hover:text-blue-700">
                {therapist.contact.email}
              </a>
            </div>
            {therapist.contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-600" />
                <a href={`tel:${therapist.contact.phone}`} className="text-blue-600 hover:text-blue-700">
                  {therapist.contact.phone}
                </a>
              </div>
            )}
            {therapist.contact.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <a href={therapist.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                  {therapist.contact.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Appointment</h2>
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={bookingData.startTime}
                  onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Type
                </label>
                <select
                  required
                  value={bookingData.type}
                  onChange={(e) => setBookingData({ ...bookingData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {therapist.sessionTypes.map(type => (
                    <option key={type} value={type}>
                      {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <textarea
                  required
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of what you'd like to discuss..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBooking(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TherapistProfile;
