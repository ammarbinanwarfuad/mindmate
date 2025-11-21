import { useState } from 'react';
import { X, Phone, MessageSquare, Shield, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import api from '../../utils/api';

const CrisisIntervention = ({ severity = 'high', crisisLogId, onClose, onRespond }) => {
  const [responding, setResponding] = useState(false);

  const handleResponse = async (response) => {
    setResponding(true);
    try {
      if (crisisLogId) {
        await api.post(`/safety/crisis/${crisisLogId}/respond`, { response });
      }
      if (onRespond) {
        onRespond(response);
      }
      if (response === 'contacted_help') {
        setTimeout(onClose, 2000);
      }
    } catch (error) {
      console.error('Error recording response:', error);
    } finally {
      setResponding(false);
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'critical': return 'from-red-600 to-red-700';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getMessage = () => {
    switch (severity) {
      case 'critical':
        return {
          title: '🆘 We\'re Here for You',
          message: 'We detected that you may be in crisis. Your safety is our top priority. Please reach out for immediate help. You are not alone.'
        };
      case 'high':
        return {
          title: '💙 We\'re Concerned About You',
          message: 'We noticed some concerning signs in what you shared. You don\'t have to go through this alone. Help is available right now.'
        };
      case 'medium':
        return {
          title: '🤝 Support is Available',
          message: 'It sounds like you\'re going through a difficult time. Would you like to access support resources?'
        };
      default:
        return {
          title: '💚 We\'re Here to Help',
          message: 'Remember, support is always available if you need it.'
        };
    }
  };

  const content = getMessage();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            // Don't allow closing by clicking outside for critical severity
            if (severity !== 'critical') {
              onClose();
            }
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className={`relative bg-gradient-to-br ${getSeverityColor()} text-white p-8 rounded-t-2xl`}>
            {severity !== 'critical' && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
            
            <h2 className="text-3xl font-bold mb-2">{content.title}</h2>
            <p className="text-white/90 text-lg">{content.message}</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Immediate Help */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Immediate Help Available</h3>
              
              <div className="space-y-3">
                <a
                  href="tel:988"
                  className="block p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-red-600" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Call 988</p>
                      <p className="text-sm text-gray-600">Suicide & Crisis Lifeline - 24/7</p>
                    </div>
                    <span className="text-red-600 font-bold">→</span>
                  </div>
                </a>

                <a
                  href="sms:741741&body=HOME"
                  className="block p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Text HOME to 741741</p>
                      <p className="text-sm text-gray-600">Crisis Text Line - 24/7</p>
                    </div>
                    <span className="text-blue-600 font-bold">→</span>
                  </div>
                </a>

                <a
                  href="tel:911"
                  className="block p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Call 911</p>
                      <p className="text-sm text-gray-600">Emergency Services</p>
                    </div>
                    <span className="text-orange-600 font-bold">→</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Safety Plan */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Safety Resources</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    window.location.href = '/safety-plan';
                  }}
                  className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="font-bold text-gray-900">Safety Plan</p>
                      <p className="text-sm text-gray-600">View your plan</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    window.location.href = '/wellness';
                  }}
                  className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-bold text-gray-900">Wellness Activities</p>
                      <p className="text-sm text-gray-600">Calm exercises</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Grounding Exercise */}
            <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">🧘 Quick Grounding Exercise</h3>
              <p className="text-sm text-gray-700 mb-3">
                Take a moment to ground yourself using your five senses:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold">👁️</span>
                  <span>Name 5 things you can see</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">✋</span>
                  <span>Name 4 things you can touch</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">👂</span>
                  <span>Name 3 things you can hear</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">👃</span>
                  <span>Name 2 things you can smell</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">👅</span>
                  <span>Name 1 thing you can taste</span>
                </li>
              </ul>
            </div>

            {/* Response Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleResponse('contacted_help')}
                disabled={responding}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                ✓ I've Contacted Help
              </Button>
              
              <Button
                onClick={() => handleResponse('acknowledged')}
                disabled={responding}
                variant="outline"
                className="w-full"
                size="lg"
              >
                I Understand, Show Me Resources
              </Button>

              {severity !== 'critical' && (
                <Button
                  onClick={() => {
                    handleResponse('dismissed');
                    onClose();
                  }}
                  disabled={responding}
                  variant="ghost"
                  className="w-full"
                >
                  Close
                </Button>
              )}
            </div>

            {/* Important Message */}
            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-900 text-center">
                <strong>You are not alone.</strong> Crisis counselors are available 24/7 to help you through this.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CrisisIntervention;
