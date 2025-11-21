import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import api from '../utils/api';

const AssessmentTest = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const [timeframe, setTimeframe] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [type]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/assessments/questions/${type}`);
      setQuestions(response.data.questions);
      setOptions(response.data.options);
      setTimeframe(response.data.timeframe);
      setResponses(new Array(response.data.questions.length).fill(null));
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Failed to load assessment');
      navigate('/assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = {
      question: questions[currentQuestion],
      questionIndex: currentQuestion,
      answer: value
    };
    setResponses(newResponses);

    // Auto-advance to next question
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    }
  };

  const handleSubmit = async () => {
    if (responses.some(r => r === null)) {
      alert('Please answer all questions');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/assessments', {
        type,
        responses
      });
      setResult(response.data.assessment);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const getProgress = () => {
    const answered = responses.filter(r => r !== null).length;
    return (answered / questions.length) * 100;
  };

  const getAssessmentTitle = () => {
    switch (type) {
      case 'phq9': return 'PHQ-9 Depression Screening';
      case 'gad7': return 'GAD-7 Anxiety Screening';
      case 'stress': return 'Stress Assessment';
      case 'burnout': return 'Burnout Assessment';
      default: return 'Assessment';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'none':
      case 'minimal':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'mild':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'moderate':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'moderately-severe':
      case 'severe':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl border-2 border-gray-200 p-8"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Assessment Complete
              </h1>
              <p className="text-gray-600">
                Here are your results
              </p>
            </div>

            <div className="space-y-6">
              {/* Score */}
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {result.totalScore}
                </div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>

              {/* Severity */}
              <div className={`p-6 rounded-xl border-2 ${getSeverityColor(result.severity)}`}>
                <h3 className="font-bold text-lg mb-2">Severity Level</h3>
                <p className="text-2xl font-bold capitalize">{result.severity.replace('-', ' ')}</p>
              </div>

              {/* Interpretation */}
              <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">Interpretation</h3>
                <p className="text-blue-800">{result.interpretation}</p>
              </div>

              {/* Recommendations */}
              <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
                <h3 className="font-bold text-purple-900 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-purple-800">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => navigate('/assessments')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back to Assessments
              </button>
              <button
                onClick={() => navigate(`/assessments/${type}/history`)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                View History
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/assessments')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getAssessmentTitle()}
          </h1>
          <p className="text-gray-600">
            Over the {timeframe}, how often have you been bothered by the following?
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(getProgress())}% Complete
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgress()}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {questions[currentQuestion]}
          </h2>

          <div className="space-y-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  responses[currentQuestion]?.answer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{option}</span>
                  {responses[currentQuestion]?.answer === index && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={responses[currentQuestion] === null}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              Next Question
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={responses.some(r => r === null) || submitting}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentTest;
