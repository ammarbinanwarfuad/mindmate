import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import useGamificationTracking from '../../hooks/useGamificationTracking';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ThoughtRecordForm = () => {
  const { track } = useGamificationTracking();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    situation: '',
    date: new Date().toISOString().split('T')[0],
    emotions: [{ emotion: '', intensity: 50 }],
    automaticThoughts: [{ thought: '', belief: 50 }],
    evidenceFor: [''],
    evidenceAgainst: [''],
    alternativeThoughts: [{ thought: '', belief: 50 }],
    outcomeEmotions: [{ emotion: '', intensity: 50 }],
    distortions: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalSteps = 6;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/cbt/thought-record`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await track('journal_entry', 15);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setFormData({
          situation: '',
          date: new Date().toISOString().split('T')[0],
          emotions: [{ emotion: '', intensity: 50 }],
          automaticThoughts: [{ thought: '', belief: 50 }],
          evidenceFor: [''],
          evidenceAgainst: [''],
          alternativeThoughts: [{ thought: '', belief: 50 }],
          outcomeEmotions: [{ emotion: '', intensity: 50 }],
          distortions: [],
          notes: ''
        });
      }, 2000);
    } catch (error) {
      console.error('Error saving thought record:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEmotion = () => {
    setFormData({
      ...formData,
      emotions: [...formData.emotions, { emotion: '', intensity: 50 }]
    });
  };

  const addThought = () => {
    setFormData({
      ...formData,
      automaticThoughts: [...formData.automaticThoughts, { thought: '', belief: 50 }]
    });
  };

  const addEvidence = (type) => {
    setFormData({
      ...formData,
      [type]: [...formData[type], '']
    });
  };

  const addAlternative = () => {
    setFormData({
      ...formData,
      alternativeThoughts: [...formData.alternativeThoughts, { thought: '', belief: 50 }]
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Step 1: Describe the Situation</h3>
            <p className="text-gray-600">What happened? When and where did it occur?</p>
            <textarea
              value={formData.situation}
              onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="Describe the situation in detail..."
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Step 2: Identify Your Emotions</h3>
            <p className="text-gray-600">What emotions did you feel? Rate their intensity (0-100)</p>
            {formData.emotions.map((emotion, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  value={emotion.emotion}
                  onChange={(e) => {
                    const newEmotions = [...formData.emotions];
                    newEmotions[index].emotion = e.target.value;
                    setFormData({ ...formData, emotions: newEmotions });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Anxious, Sad, Angry"
                />
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={emotion.intensity}
                    onChange={(e) => {
                      const newEmotions = [...formData.emotions];
                      newEmotions[index].intensity = parseInt(e.target.value);
                      setFormData({ ...formData, emotions: newEmotions });
                    }}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold text-gray-900 w-12">{emotion.intensity}</span>
                </div>
              </div>
            ))}
            <button
              onClick={addEmotion}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Another Emotion
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Step 3: Automatic Thoughts</h3>
            <p className="text-gray-600">What thoughts went through your mind? How much did you believe them?</p>
            {formData.automaticThoughts.map((thought, index) => (
              <div key={index} className="space-y-2">
                <textarea
                  value={thought.thought}
                  onChange={(e) => {
                    const newThoughts = [...formData.automaticThoughts];
                    newThoughts[index].thought = e.target.value;
                    setFormData({ ...formData, automaticThoughts: newThoughts });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="What thought came to mind?"
                />
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Belief:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={thought.belief}
                    onChange={(e) => {
                      const newThoughts = [...formData.automaticThoughts];
                      newThoughts[index].belief = parseInt(e.target.value);
                      setFormData({ ...formData, automaticThoughts: newThoughts });
                    }}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold text-gray-900 w-12">{thought.belief}%</span>
                </div>
              </div>
            ))}
            <button
              onClick={addThought}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Another Thought
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Step 4: Examine the Evidence</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 mb-2">Evidence FOR the thought:</p>
                {formData.evidenceFor.map((evidence, index) => (
                  <input
                    key={index}
                    type="text"
                    value={evidence}
                    onChange={(e) => {
                      const newEvidence = [...formData.evidenceFor];
                      newEvidence[index] = e.target.value;
                      setFormData({ ...formData, evidenceFor: newEvidence });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                    placeholder="What supports this thought?"
                  />
                ))}
                <button
                  onClick={() => addEvidence('evidenceFor')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  + Add More
                </button>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Evidence AGAINST the thought:</p>
                {formData.evidenceAgainst.map((evidence, index) => (
                  <input
                    key={index}
                    type="text"
                    value={evidence}
                    onChange={(e) => {
                      const newEvidence = [...formData.evidenceAgainst];
                      newEvidence[index] = e.target.value;
                      setFormData({ ...formData, evidenceAgainst: newEvidence });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                    placeholder="What contradicts this thought?"
                  />
                ))}
                <button
                  onClick={() => addEvidence('evidenceAgainst')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  + Add More
                </button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Step 5: Alternative Thoughts</h3>
            <p className="text-gray-600">What's a more balanced way of thinking about this?</p>
            {formData.alternativeThoughts.map((alt, index) => (
              <div key={index} className="space-y-2">
                <textarea
                  value={alt.thought}
                  onChange={(e) => {
                    const newAlts = [...formData.alternativeThoughts];
                    newAlts[index].thought = e.target.value;
                    setFormData({ ...formData, alternativeThoughts: newAlts });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="A more balanced thought..."
                />
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Belief:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={alt.belief}
                    onChange={(e) => {
                      const newAlts = [...formData.alternativeThoughts];
                      newAlts[index].belief = parseInt(e.target.value);
                      setFormData({ ...formData, alternativeThoughts: newAlts });
                    }}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold text-gray-900 w-12">{alt.belief}%</span>
                </div>
              </div>
            ))}
            <button
              onClick={addAlternative}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Another Alternative
            </button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Step 6: Outcome</h3>
            <p className="text-gray-600">How do you feel now? Rate your emotions again.</p>
            {formData.outcomeEmotions.map((emotion, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  value={emotion.emotion}
                  onChange={(e) => {
                    const newEmotions = [...formData.outcomeEmotions];
                    newEmotions[index].emotion = e.target.value;
                    setFormData({ ...formData, outcomeEmotions: newEmotions });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Emotion"
                />
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={emotion.intensity}
                    onChange={(e) => {
                      const newEmotions = [...formData.outcomeEmotions];
                      newEmotions[index].intensity = parseInt(e.target.value);
                      setFormData({ ...formData, outcomeEmotions: newEmotions });
                    }}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold text-gray-900 w-12">{emotion.intensity}</span>
                </div>
              </div>
            ))}
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Any additional notes or reflections..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thought Record Saved!</h3>
        <p className="text-gray-600">Great work challenging your thoughts.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {step < totalSteps ? (
          <button
            onClick={() => setStep(Math.min(totalSteps, step + 1))}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Complete'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ThoughtRecordForm;
