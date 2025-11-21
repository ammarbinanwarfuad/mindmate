import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DistortionChecker = () => {
  const [thought, setThought] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkDistortions = async () => {
    if (!thought.trim()) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/cbt/distortions/check`,
        { thought },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
    } catch (error) {
      console.error('Error checking distortions:', error);
    } finally {
      setLoading(false);
    }
  };

  const distortionColors = {
    'all-or-nothing': 'bg-red-100 text-red-800',
    'overgeneralization': 'bg-orange-100 text-orange-800',
    'mental-filter': 'bg-yellow-100 text-yellow-800',
    'should-statements': 'bg-green-100 text-green-800',
    'labeling': 'bg-blue-100 text-blue-800',
    'emotional-reasoning': 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Enter a thought to analyze:
        </label>
        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows="4"
          placeholder="e.g., I always mess everything up. Nobody likes me."
        />
        <button
          onClick={checkDistortions}
          disabled={loading || !thought.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Check for Distortions'}
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              {result.count === 0 ? '✅ No distortions detected!' : `Found ${result.count} potential distortion(s)`}
            </h3>
          </div>

          {result.detectedDistortions.length > 0 && (
            <div className="space-y-3">
              {result.detectedDistortions.map((distortion, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${distortionColors[distortion.key] || 'bg-gray-100 text-gray-800'}`}>
                      {distortion.name}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-2">{distortion.description}</p>
                  {distortion.examples && distortion.examples.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-600 mb-1">Examples:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {distortion.examples.map((example, i) => (
                          <li key={i}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {distortion.questions && distortion.questions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-600 mb-1">Questions to ask yourself:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {distortion.questions.map((question, i) => (
                          <li key={i}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default DistortionChecker;
