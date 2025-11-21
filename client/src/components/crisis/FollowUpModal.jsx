import { useState } from 'react';
import { X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import api from '../../utils/api';

const FollowUpModal = ({ crisisLogId, onClose, onComplete }) => {
  const [formData, setFormData] = useState({
    mood: 5,
    feeling: '',
    needsHelp: false,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/safety/follow-up/${crisisLogId}`, formData);
      if (onComplete) {
        onComplete();
      }
      alert('Thank you for checking in. We\'re here for you. 💙');
      onClose();
    } catch (error) {
      console.error('Error submitting follow-up:', error);
      alert('Failed to submit follow-up');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8" />
              <h2 className="text-3xl font-bold">How Are You Doing?</h2>
            </div>
            <p className="text-white/90">We wanted to check in with you</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Mood Slider */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How are you feeling right now? (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #22c55e 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Very Low</span>
                <span className="text-2xl font-bold text-primary-600">{formData.mood}</span>
                <span>Very High</span>
              </div>
            </div>

            {/* Feeling */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                How would you describe your current state?
              </label>
              <select
                value={formData.feeling}
                onChange={(e) => setFormData({ ...formData, feeling: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select...</option>
                <option value="much_better">Much better</option>
                <option value="better">A bit better</option>
                <option value="same">About the same</option>
                <option value="worse">Worse</option>
                <option value="much_worse">Much worse</option>
              </select>
            </div>

            {/* Needs Help */}
            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.needsHelp}
                  onChange={(e) => setFormData({ ...formData, needsHelp: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-semibold text-gray-700">
                  I still need help or support
                </span>
              </label>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Anything else you'd like to share? (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Your thoughts..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={submitting || !formData.feeling}
                className="w-full"
                size="lg"
              >
                {submitting ? 'Submitting...' : 'Submit Check-in'}
              </Button>

              {formData.needsHelp && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-sm text-red-900 mb-2 font-semibold">
                    We're here for you. Please reach out:
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>📞 Call: <a href="tel:988" className="text-red-600 font-bold">988</a></p>
                    <p>💬 Text HOME to: <span className="font-bold">741741</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FollowUpModal;
