import express from 'express';
import Assessment from '../models/Assessment.model.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Assessment questions data
const assessmentQuestions = {
  phq9: [
    'Little interest or pleasure in doing things',
    'Feeling down, depressed, or hopeless',
    'Trouble falling or staying asleep, or sleeping too much',
    'Feeling tired or having little energy',
    'Poor appetite or overeating',
    'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
    'Trouble concentrating on things, such as reading the newspaper or watching television',
    'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
    'Thoughts that you would be better off dead, or of hurting yourself'
  ],
  gad7: [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'Worrying too much about different things',
    'Trouble relaxing',
    'Being so restless that it is hard to sit still',
    'Becoming easily annoyed or irritable',
    'Feeling afraid, as if something awful might happen'
  ],
  stress: [
    'Feeling overwhelmed by responsibilities',
    'Difficulty concentrating or making decisions',
    'Feeling irritable or short-tempered',
    'Experiencing physical symptoms (headaches, muscle tension)',
    'Having trouble sleeping',
    'Feeling constantly rushed or pressed for time',
    'Difficulty relaxing or unwinding',
    'Feeling emotionally drained',
    'Experiencing changes in appetite',
    'Withdrawing from social activities'
  ]
};

/**
 * @route   GET /api/assessments/questions/:type
 * @desc    Get assessment questions
 * @access  Private
 */
router.get('/questions/:type', authenticate, (req, res) => {
  const { type } = req.params;
  
  if (!assessmentQuestions[type]) {
    return res.status(404).json({ success: false, message: 'Assessment type not found' });
  }

  const options = type === 'stress' 
    ? ['Not at all', 'Rarely', 'Sometimes', 'Often', 'Very often']
    : ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];

  res.json({
    success: true,
    type,
    questions: assessmentQuestions[type],
    options,
    timeframe: type === 'stress' ? 'past month' : 'past 2 weeks'
  });
});

/**
 * @route   POST /api/assessments
 * @desc    Submit assessment
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, responses, notes } = req.body;

    if (!type || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ success: false, message: 'Invalid assessment data' });
    }

    // Calculate score based on type
    let result;
    switch (type) {
      case 'phq9':
        result = Assessment.calculatePHQ9(responses);
        break;
      case 'gad7':
        result = Assessment.calculateGAD7(responses);
        break;
      case 'stress':
      case 'burnout':
        result = Assessment.calculateStress(responses);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid assessment type' });
    }

    const assessment = await Assessment.create({
      userId: req.user._id,
      type,
      responses,
      ...result,
      notes
    });

    res.status(201).json({ success: true, assessment });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/assessments
 * @desc    Get user's assessments
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, limit = 10 } = req.query;
    
    const query = { userId: req.user._id };
    if (type) query.type = type;

    const assessments = await Assessment.find(query)
      .sort({ completedAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, assessments });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/assessments/latest/:type
 * @desc    Get latest assessment of a type
 * @access  Private
 */
router.get('/latest/:type', authenticate, async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      userId: req.user._id,
      type: req.params.type
    }).sort({ completedAt: -1 });

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'No assessment found' });
    }

    res.json({ success: true, assessment });
  } catch (error) {
    console.error('Get latest assessment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/assessments/history/:type
 * @desc    Get assessment history with scores over time
 * @access  Private
 */
router.get('/history/:type', authenticate, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const assessments = await Assessment.find({
      userId: req.user._id,
      type: req.params.type,
      completedAt: { $gte: startDate }
    })
    .sort({ completedAt: 1 })
    .select('totalScore severity completedAt');

    // Calculate statistics
    const scores = assessments.map(a => a.totalScore);
    const stats = {
      count: assessments.length,
      average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      min: scores.length > 0 ? Math.min(...scores) : 0,
      max: scores.length > 0 ? Math.max(...scores) : 0,
      trend: calculateTrend(assessments)
    };

    res.json({ success: true, assessments, stats });
  } catch (error) {
    console.error('Get assessment history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/assessments/stats
 * @desc    Get overall assessment statistics
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id });

    const stats = {
      total: assessments.length,
      byType: {},
      recentScores: {}
    };

    // Group by type
    ['phq9', 'gad7', 'stress', 'burnout'].forEach(type => {
      const typeAssessments = assessments.filter(a => a.type === type);
      stats.byType[type] = {
        count: typeAssessments.length,
        latest: typeAssessments.length > 0 
          ? typeAssessments.sort((a, b) => b.completedAt - a.completedAt)[0]
          : null
      };
    });

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get assessment stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/assessments/:id
 * @desc    Delete an assessment
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    await assessment.deleteOne();

    res.json({ success: true, message: 'Assessment deleted' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to calculate trend
function calculateTrend(assessments) {
  if (assessments.length < 2) return 'insufficient-data';
  
  const recent = assessments.slice(-3);
  const older = assessments.slice(0, Math.min(3, assessments.length - 3));
  
  if (older.length === 0) return 'insufficient-data';
  
  const recentAvg = recent.reduce((sum, a) => sum + a.totalScore, 0) / recent.length;
  const olderAvg = older.reduce((sum, a) => sum + a.totalScore, 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  
  if (Math.abs(diff) < 2) return 'stable';
  return diff > 0 ? 'worsening' : 'improving';
}

export default router;
