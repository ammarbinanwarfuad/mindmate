import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import api from '../../utils/api';

const SOSButton = ({ matchId }) => {
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSOS = async () => {
    setSending(true);
    try {
      await api.post('/buddies/sos', {
        matchId,
        message: 'I need support right now. Can we talk?'
      });
      
      alert('SOS alert sent to your buddy! They will be notified immediately. 💙');
      setShowConfirm(false);
    } catch (error) {
      console.error('Error sending SOS:', error);
      alert('Failed to send SOS alert');
    } finally {
      setSending(false);
    }
  };

  if (showConfirm) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Send SOS to Your Buddy?</h3>
            <p className="text-gray-600">
              This will immediately notify your buddy that you need support.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleSOS}
              disabled={sending}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              {sending ? 'Sending...' : 'Yes, Send SOS'}
            </Button>
            <Button
              onClick={() => setShowConfirm(false)}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-900">
              <strong>In crisis?</strong> Call 988 for immediate help
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={() => setShowConfirm(true)}
      className="flex-col h-auto py-4 border-red-300 hover:bg-red-50"
    >
      <AlertCircle className="w-6 h-6 mb-2 text-red-600" />
      <span className="text-sm text-red-600">SOS Alert</span>
    </Button>
  );
};

export default SOSButton;
