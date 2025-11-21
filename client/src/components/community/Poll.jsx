import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Poll = ({ poll, onVote }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [voting, setVoting] = useState(false);

  const handleVote = async (optionIndex) => {
    if (voting) return;
    
    try {
      setVoting(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/community/poll/${poll._id}/vote`,
        { optionIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedOption(optionIndex);
      if (onVote) onVote();
    } catch (error) {
      console.error('Error voting:', error);
      alert(error.response?.data?.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const getPercentage = (votes) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">📊</div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">{poll.question}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
            {isExpired && <span className="text-red-600 ml-2">• Expired</span>}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const percentage = getPercentage(option.votes);
          const isSelected = selectedOption === index;

          return (
            <motion.button
              key={index}
              onClick={() => !isExpired && handleVote(index)}
              disabled={isExpired || voting}
              whileHover={{ scale: isExpired ? 1 : 1.02 }}
              whileTap={{ scale: isExpired ? 1 : 0.98 }}
              className={`w-full text-left relative overflow-hidden rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-100'
                  : 'border-gray-300 bg-white hover:border-purple-300'
              } ${isExpired ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="relative z-10 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{option.text}</span>
                  <span className="text-sm font-bold text-purple-600">{percentage}%</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{option.votes} votes</div>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-200 to-pink-200 opacity-50"
              />
            </motion.button>
          );
        })}
      </div>

      {poll.expiresAt && (
        <p className="text-xs text-gray-500 mt-4">
          {isExpired
            ? `Expired on ${new Date(poll.expiresAt).toLocaleDateString()}`
            : `Expires on ${new Date(poll.expiresAt).toLocaleDateString()}`}
        </p>
      )}
    </div>
  );
};

export default Poll;
