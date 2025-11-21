import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getMoodAnalytics,
  getMoodCalendar,
  identifyTriggers,
  analyzeCorrelations,
  getWeeklyReport,
  predictMood,
  getMoodStreak
} from '../services/moodAnalytics.service.js';
import MoodEntry from '../models/MoodEntry.model.js';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

const router = express.Router();

/**
 * @route   GET /api/mood-analytics/analytics
 * @desc    Get comprehensive mood analytics
 * @access  Private
 */
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const analytics = await getMoodAnalytics(req.user._id, days);
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error getting mood analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mood analytics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mood-analytics/calendar
 * @desc    Get mood calendar data for heatmap
 * @access  Private
 */
router.get('/calendar', authenticate, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const calendarData = await getMoodCalendar(req.user._id, days);
    
    res.json({
      success: true,
      calendarData
    });
  } catch (error) {
    console.error('Error getting mood calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mood calendar',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mood-analytics/insights
 * @desc    Get AI-generated mood insights
 * @access  Private
 */
router.get('/insights', authenticate, async (req, res) => {
  try {
    const triggers = await identifyTriggers(req.user._id);
    const correlations = await analyzeCorrelations(req.user._id);
    const prediction = await predictMood(req.user._id);
    
    res.json({
      success: true,
      insights: {
        triggers: triggers.triggers || [],
        correlations: correlations.correlations || [],
        prediction: prediction.prediction,
        messages: {
          triggers: triggers.message,
          correlations: correlations.message,
          prediction: prediction.message
        }
      }
    });
  } catch (error) {
    console.error('Error getting mood insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mood insights',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mood-analytics/report
 * @desc    Get weekly mood report
 * @access  Private
 */
router.get('/report', authenticate, async (req, res) => {
  try {
    const weekOffset = parseInt(req.query.week) || 0;
    const report = await getWeeklyReport(req.user._id, weekOffset);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error getting weekly report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly report',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mood-analytics/streak
 * @desc    Get mood logging streak
 * @access  Private
 */
router.get('/streak', authenticate, async (req, res) => {
  try {
    const streak = await getMoodStreak(req.user._id);
    
    res.json({
      success: true,
      streak
    });
  } catch (error) {
    console.error('Error getting mood streak:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mood streak',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mood-analytics/export
 * @desc    Export mood data as PDF or CSV
 * @access  Private
 */
router.get('/export', authenticate, async (req, res) => {
  try {
    const format = req.query.format || 'csv'; // 'pdf' or 'csv'
    const days = parseInt(req.query.days) || 90;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const entries = await MoodEntry.find({
      userId: req.user._id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    if (format === 'pdf') {
      // Generate PDF
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=mood-data-${Date.now()}.pdf`);
      
      doc.pipe(res);
      
      // Title
      doc.fontSize(20).text('MindMate - Mood Data Export', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`User: ${req.user.profile.name}`, { align: 'center' });
      doc.text(`Export Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.text(`Period: Last ${days} days`, { align: 'center' });
      doc.moveDown(2);
      
      // Summary
      const analytics = await getMoodAnalytics(req.user._id, days);
      doc.fontSize(16).text('Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Total Entries: ${analytics.totalEntries}`);
      doc.text(`Average Mood: ${analytics.averageMood}/10`);
      doc.text(`Mood Trend: ${analytics.moodTrend}`);
      doc.moveDown(2);
      
      // Entries
      doc.fontSize(16).text('Mood Entries', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      
      entries.forEach((entry, index) => {
        if (index > 0 && index % 15 === 0) {
          doc.addPage();
        }
        
        doc.text(`Date: ${new Date(entry.createdAt).toLocaleDateString()}`);
        doc.text(`Mood: ${entry.mood}/10`);
        if (entry.note) doc.text(`Note: ${entry.note.substring(0, 100)}`);
        if (entry.sleep) doc.text(`Sleep: ${entry.sleep} hours`);
        if (entry.activities && entry.activities.length > 0) {
          doc.text(`Activities: ${entry.activities.join(', ')}`);
        }
        doc.moveDown();
      });
      
      doc.end();
      
    } else {
      // Generate CSV
      const fields = ['date', 'mood', 'note', 'sleep', 'activities', 'triggers'];
      const data = entries.map(entry => ({
        date: new Date(entry.createdAt).toLocaleDateString(),
        mood: entry.mood,
        note: entry.note || '',
        sleep: entry.sleep || '',
        activities: entry.activities ? entry.activities.join('; ') : '',
        triggers: entry.triggers ? entry.triggers.join('; ') : ''
      }));
      
      const parser = new Parser({ fields });
      const csv = parser.parse(data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=mood-data-${Date.now()}.csv`);
      res.send(csv);
    }
    
  } catch (error) {
    console.error('Error exporting mood data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export mood data',
      error: error.message
    });
  }
});

export default router;
