import express from 'express';
import MoodEntry from '../models/MoodEntry.model.js';
import { authenticate } from '../middleware/auth.js';
import { moodValidation, validate } from '../middleware/validation.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { generateMoodInsight } from '../services/gemini.service.js';

const router = express.Router();

// Get mood entries
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 30, startDate, endDate } = req.query;
    
    const query = { userId: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const entries = await MoodEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    // Decrypt journal entries
    const decryptedEntries = entries.map(entry => {
      const entryObj = entry.toObject();
      if (entryObj.journalEntry?.encrypted) {
        try {
          entryObj.journalEntry.decrypted = decrypt(entryObj.journalEntry);
        } catch (error) {
          console.error('Decryption error:', error);
        }
      }
      return entryObj;
    });
    
    res.json({
      success: true,
      entries: decryptedEntries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create mood entry
router.post('/', authenticate, moodValidation, validate, async (req, res) => {
  try {
    const { moodScore, emoji, journalEntry, triggers, activities, sleepHours } = req.body;
    
    const entryData = {
      userId: req.user._id,
      moodScore,
      emoji,
      triggers: triggers || [],
      activities: activities || [],
      sleepHours,
      date: new Date()
    };
    
    // Encrypt journal entry if provided
    if (journalEntry) {
      entryData.journalEntry = encrypt(journalEntry);
    }
    
    const moodEntry = await MoodEntry.create(entryData);
    
    // Generate AI insight asynchronously
    if (journalEntry || triggers?.length > 0) {
      generateMoodInsight({
        moodScore,
        triggers,
        activities,
        journalEntry
      }).then(insight => {
        if (insight) {
          moodEntry.aiInsights = insight;
          moodEntry.save();
        }
      }).catch(err => console.error('Insight generation error:', err));
    }
    
    res.status(201).json({
      success: true,
      message: 'Mood entry created successfully',
      entry: moodEntry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get mood statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const entries = await MoodEntry.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    if (entries.length === 0) {
      return res.json({
        success: true,
        stats: {
          averageMood: 0,
          totalEntries: 0,
          trend: 'stable',
          moodDistribution: {}
        }
      });
    }
    
    const averageMood = entries.reduce((sum, e) => sum + e.moodScore, 0) / entries.length;
    
    // Calculate trend
    const recentEntries = entries.slice(-7);
    const olderEntries = entries.slice(0, Math.min(7, entries.length - 7));
    
    let trend = 'stable';
    if (recentEntries.length > 0 && olderEntries.length > 0) {
      const recentAvg = recentEntries.reduce((sum, e) => sum + e.moodScore, 0) / recentEntries.length;
      const olderAvg = olderEntries.reduce((sum, e) => sum + e.moodScore, 0) / olderEntries.length;
      
      if (recentAvg > olderAvg + 1) trend = 'improving';
      else if (recentAvg < olderAvg - 1) trend = 'declining';
    }
    
    // Mood distribution
    const moodDistribution = {};
    entries.forEach(entry => {
      const mood = entry.moodScore;
      moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
    });
    
    res.json({
      success: true,
      stats: {
        averageMood: Math.round(averageMood * 10) / 10,
        totalEntries: entries.length,
        trend,
        moodDistribution,
        entries: entries.map(e => ({
          date: e.date,
          moodScore: e.moodScore,
          emoji: e.emoji
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
