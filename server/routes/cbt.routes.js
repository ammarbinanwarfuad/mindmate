import express from 'express';
import { authenticate } from '../middleware/auth.js';
import ThoughtRecord from '../models/ThoughtRecord.model.js';
import CognitiveDistortion from '../models/CognitiveDistortion.model.js';
import BehavioralActivation from '../models/BehavioralActivation.model.js';
import GratitudeEntry from '../models/GratitudeEntry.model.js';
import { CBTModule, UserCBTProgress } from '../models/CBTModule.model.js';

const router = express.Router();

// ============ THOUGHT RECORDS ============

/**
 * @route   POST /api/cbt/thought-record
 * @desc    Create a new thought record
 * @access  Private
 */
router.post('/thought-record', authenticate, async (req, res) => {
  try {
    const thoughtRecord = await ThoughtRecord.create({
      userId: req.user.id,
      ...req.body
    });
    
    res.status(201).json(thoughtRecord);
  } catch (error) {
    console.error('Create thought record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/cbt/thought-records
 * @desc    Get user's thought records
 * @access  Private
 */
router.get('/thought-records', authenticate, async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    
    const thoughtRecords = await ThoughtRecord.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await ThoughtRecord.countDocuments({ userId: req.user.id });
    
    res.json({ thoughtRecords, total });
  } catch (error) {
    console.error('Get thought records error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/cbt/thought-record/:id
 * @desc    Get a specific thought record
 * @access  Private
 */
router.get('/thought-record/:id', authenticate, async (req, res) => {
  try {
    const thoughtRecord = await ThoughtRecord.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!thoughtRecord) {
      return res.status(404).json({ message: 'Thought record not found' });
    }
    
    res.json(thoughtRecord);
  } catch (error) {
    console.error('Get thought record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/cbt/thought-record/:id
 * @desc    Update a thought record
 * @access  Private
 */
router.put('/thought-record/:id', authenticate, async (req, res) => {
  try {
    const thoughtRecord = await ThoughtRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!thoughtRecord) {
      return res.status(404).json({ message: 'Thought record not found' });
    }
    
    res.json(thoughtRecord);
  } catch (error) {
    console.error('Update thought record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/cbt/thought-record/:id
 * @desc    Delete a thought record
 * @access  Private
 */
router.delete('/thought-record/:id', authenticate, async (req, res) => {
  try {
    const thoughtRecord = await ThoughtRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!thoughtRecord) {
      return res.status(404).json({ message: 'Thought record not found' });
    }
    
    res.json({ message: 'Thought record deleted successfully' });
  } catch (error) {
    console.error('Delete thought record error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ COGNITIVE DISTORTIONS ============

/**
 * @route   GET /api/cbt/distortions
 * @desc    Get all cognitive distortions
 * @access  Private
 */
router.get('/distortions', authenticate, async (req, res) => {
  try {
    const distortions = await CognitiveDistortion.find().sort({ name: 1 });
    res.json(distortions);
  } catch (error) {
    console.error('Get distortions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/cbt/distortions/check
 * @desc    Check text for cognitive distortions using AI
 * @access  Private
 */
router.post('/distortions/check', authenticate, async (req, res) => {
  try {
    const { thought } = req.body;
    
    if (!thought) {
      return res.status(400).json({ message: 'Thought text is required' });
    }
    
    // Get all distortions
    const allDistortions = await CognitiveDistortion.find();
    
    // Simple keyword-based detection (can be enhanced with AI)
    const detectedDistortions = [];
    
    const thoughtLower = thought.toLowerCase();
    
    // All-or-nothing thinking
    if (thoughtLower.match(/\b(always|never|every|all|none|nothing|everyone|no one)\b/)) {
      const distortion = allDistortions.find(d => d.key === 'all-or-nothing');
      if (distortion) detectedDistortions.push(distortion);
    }
    
    // Overgeneralization
    if (thoughtLower.match(/\b(always happens|never works|every time|typical)\b/)) {
      const distortion = allDistortions.find(d => d.key === 'overgeneralization');
      if (distortion) detectedDistortions.push(distortion);
    }
    
    // Should statements
    if (thoughtLower.match(/\b(should|must|ought|have to|need to)\b/)) {
      const distortion = allDistortions.find(d => d.key === 'should-statements');
      if (distortion) detectedDistortions.push(distortion);
    }
    
    // Labeling
    if (thoughtLower.match(/\b(i am|i'm|he is|she is|they are).*(loser|failure|stupid|idiot|worthless)\b/)) {
      const distortion = allDistortions.find(d => d.key === 'labeling');
      if (distortion) detectedDistortions.push(distortion);
    }
    
    // Emotional reasoning
    if (thoughtLower.match(/\b(i feel|feels like).*(therefore|so|means)\b/)) {
      const distortion = allDistortions.find(d => d.key === 'emotional-reasoning');
      if (distortion) detectedDistortions.push(distortion);
    }
    
    res.json({
      thought,
      detectedDistortions,
      count: detectedDistortions.length
    });
  } catch (error) {
    console.error('Check distortions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ BEHAVIORAL ACTIVATION ============

/**
 * @route   POST /api/cbt/behavioral-activation
 * @desc    Create a behavioral activation plan
 * @access  Private
 */
router.post('/behavioral-activation', authenticate, async (req, res) => {
  try {
    const activity = await BehavioralActivation.create({
      userId: req.user.id,
      ...req.body
    });
    
    res.status(201).json(activity);
  } catch (error) {
    console.error('Create behavioral activation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/cbt/behavioral-activations
 * @desc    Get user's behavioral activation plans
 * @access  Private
 */
router.get('/behavioral-activations', authenticate, async (req, res) => {
  try {
    const { completed, startDate, endDate } = req.query;
    
    const query = { userId: req.user.id };
    
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }
    
    const activities = await BehavioralActivation.find(query)
      .sort({ scheduledDate: 1 });
    
    res.json(activities);
  } catch (error) {
    console.error('Get behavioral activations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/cbt/behavioral-activation/:id
 * @desc    Update a behavioral activation plan
 * @access  Private
 */
router.put('/behavioral-activation/:id', authenticate, async (req, res) => {
  try {
    const activity = await BehavioralActivation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    res.json(activity);
  } catch (error) {
    console.error('Update behavioral activation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/cbt/behavioral-activation/:id/complete
 * @desc    Mark activity as completed
 * @access  Private
 */
router.post('/behavioral-activation/:id/complete', authenticate, async (req, res) => {
  try {
    const { actualEnjoyment, actualAccomplishment, actualDifficulty, moodAfter, notes } = req.body;
    
    const activity = await BehavioralActivation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        completed: true,
        completedDate: new Date(),
        actualEnjoyment,
        actualAccomplishment,
        actualDifficulty,
        moodAfter,
        notes
      },
      { new: true }
    );
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    res.json(activity);
  } catch (error) {
    console.error('Complete activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ GRATITUDE ============

/**
 * @route   POST /api/cbt/gratitude
 * @desc    Create a gratitude entry
 * @access  Private
 */
router.post('/gratitude', authenticate, async (req, res) => {
  try {
    // Check if entry exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingEntry = await GratitudeEntry.findOne({
      userId: req.user.id,
      date: { $gte: today }
    });
    
    if (existingEntry) {
      // Update existing entry
      existingEntry.entries = req.body.entries;
      existingEntry.mood = req.body.mood;
      existingEntry.reflection = req.body.reflection;
      existingEntry.photos = req.body.photos;
      await existingEntry.save();
      
      return res.json(existingEntry);
    }
    
    // Calculate streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayEntry = await GratitudeEntry.findOne({
      userId: req.user.id,
      date: { $gte: yesterday, $lt: today }
    });
    
    const streak = yesterdayEntry ? yesterdayEntry.streak + 1 : 1;
    
    const gratitudeEntry = await GratitudeEntry.create({
      userId: req.user.id,
      ...req.body,
      streak
    });
    
    res.status(201).json(gratitudeEntry);
  } catch (error) {
    console.error('Create gratitude entry error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/cbt/gratitude
 * @desc    Get user's gratitude entries
 * @access  Private
 */
router.get('/gratitude', authenticate, async (req, res) => {
  try {
    const { limit = 30, skip = 0 } = req.query;
    
    const entries = await GratitudeEntry.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await GratitudeEntry.countDocuments({ userId: req.user.id });
    
    // Get current streak
    const latestEntry = entries[0];
    const currentStreak = latestEntry?.streak || 0;
    
    res.json({ entries, total, currentStreak });
  } catch (error) {
    console.error('Get gratitude entries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/cbt/gratitude/stats
 * @desc    Get gratitude statistics
 * @access  Private
 */
router.get('/gratitude/stats', authenticate, async (req, res) => {
  try {
    const entries = await GratitudeEntry.find({ userId: req.user.id });
    
    const totalEntries = entries.length;
    const totalItems = entries.reduce((sum, entry) => sum + entry.entries.length, 0);
    
    // Category breakdown
    const categoryCount = {};
    entries.forEach(entry => {
      entry.entries.forEach(item => {
        if (item.category) {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        }
      });
    });
    
    // Current streak
    const latestEntry = entries.sort((a, b) => b.date - a.date)[0];
    const currentStreak = latestEntry?.streak || 0;
    
    // Longest streak
    const longestStreak = Math.max(...entries.map(e => e.streak), 0);
    
    res.json({
      totalEntries,
      totalItems,
      currentStreak,
      longestStreak,
      categoryBreakdown: categoryCount
    });
  } catch (error) {
    console.error('Get gratitude stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ CBT MODULES ============

/**
 * @route   GET /api/cbt/modules
 * @desc    Get all CBT modules
 * @access  Private
 */
router.get('/modules', authenticate, async (req, res) => {
  try {
    const modules = await CBTModule.find().sort({ order: 1 });
    
    // Get user progress
    let progress = await UserCBTProgress.findOne({ userId: req.user.id });
    
    if (!progress) {
      progress = await UserCBTProgress.create({
        userId: req.user.id,
        currentModule: 1
      });
    }
    
    const modulesWithProgress = modules.map(module => {
      const completed = progress.completedModules.some(
        cm => cm.moduleId.toString() === module._id.toString()
      );
      
      const isUnlocked = module.moduleNumber === 1 || 
        module.prerequisites.every(prereq => 
          progress.completedModules.some(cm => {
            const completedModule = modules.find(m => m._id.toString() === cm.moduleId.toString());
            return completedModule && completedModule.moduleNumber === prereq;
          })
        );
      
      return {
        ...module.toObject(),
        completed,
        isUnlocked
      };
    });
    
    res.json({
      modules: modulesWithProgress,
      progress: {
        currentModule: progress.currentModule,
        completedCount: progress.completedModules.length,
        totalTimeSpent: progress.totalTimeSpent
      }
    });
  } catch (error) {
    console.error('Get CBT modules error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/cbt/module/:moduleNumber
 * @desc    Get a specific CBT module
 * @access  Private
 */
router.get('/module/:moduleNumber', authenticate, async (req, res) => {
  try {
    const module = await CBTModule.findOne({ moduleNumber: req.params.moduleNumber });
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    const progress = await UserCBTProgress.findOne({ userId: req.user.id });
    
    res.json({
      module,
      progress: progress?.completedModules.find(
        cm => cm.moduleId.toString() === module._id.toString()
      )
    });
  } catch (error) {
    console.error('Get CBT module error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/cbt/module/:moduleNumber/complete
 * @desc    Mark a module as completed
 * @access  Private
 */
router.post('/module/:moduleNumber/complete', authenticate, async (req, res) => {
  try {
    const { score, timeSpent } = req.body;
    
    const module = await CBTModule.findOne({ moduleNumber: req.params.moduleNumber });
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    const progress = await UserCBTProgress.findOne({ userId: req.user.id });
    
    // Check if already completed
    const alreadyCompleted = progress.completedModules.some(
      cm => cm.moduleId.toString() === module._id.toString()
    );
    
    if (!alreadyCompleted) {
      progress.completedModules.push({
        moduleId: module._id,
        completedAt: new Date(),
        score,
        timeSpent
      });
      
      progress.totalTimeSpent += timeSpent || 0;
      progress.currentModule = module.moduleNumber + 1;
      progress.lastAccessedAt = new Date();
      
      await progress.save();
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Complete module error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
