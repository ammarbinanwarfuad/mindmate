import express from 'express';
import Therapist from '../models/Therapist.model.js';
import Appointment from '../models/Appointment.model.js';
import ProgressShare from '../models/ProgressShare.model.js';
import { authenticate } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// ==================== THERAPIST DIRECTORY ====================

/**
 * @route   GET /api/professional/therapists
 * @desc    Get therapists with filters
 * @access  Private
 */
router.get('/therapists', authenticate, async (req, res) => {
  try {
    const { 
      specialization, 
      city, 
      sessionType, 
      minRating, 
      maxPrice,
      acceptingClients,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};
    
    if (specialization) query.specializations = specialization;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (sessionType) query.sessionTypes = sessionType;
    if (minRating) query['rating.average'] = { $gte: parseFloat(minRating) };
    if (maxPrice) query['pricing.individual'] = { $lte: parseFloat(maxPrice) };
    if (acceptingClients === 'true') query.acceptingNewClients = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [therapists, total] = await Promise.all([
      Therapist.find(query)
        .sort({ 'rating.average': -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Therapist.countDocuments(query)
    ]);

    res.json({
      success: true,
      therapists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get therapists error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/professional/therapists/:id
 * @desc    Get therapist details
 * @access  Private
 */
router.get('/therapists/:id', authenticate, async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    res.json({ success: true, therapist });
  } catch (error) {
    console.error('Get therapist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/professional/therapists/search
 * @desc    Search therapists by name or bio
 * @access  Private
 */
router.get('/therapists/search/:query', authenticate, async (req, res) => {
  try {
    const therapists = await Therapist.find(
      { $text: { $search: req.params.query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);

    res.json({ success: true, therapists });
  } catch (error) {
    console.error('Search therapists error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== APPOINTMENTS ====================

/**
 * @route   POST /api/professional/appointments
 * @desc    Book an appointment
 * @access  Private
 */
router.post('/appointments', authenticate, async (req, res) => {
  try {
    const { therapistId, date, startTime, endTime, type, reason, notes } = req.body;

    // Check if therapist exists
    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      therapistId,
      date: new Date(date),
      startTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'Time slot not available' });
    }

    // Generate meeting link for video sessions
    let meetingLink = null;
    if (type === 'video') {
      meetingLink = `https://meet.mindmate.com/${crypto.randomBytes(16).toString('hex')}`;
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      therapistId,
      date: new Date(date),
      startTime,
      endTime,
      type,
      reason,
      notes,
      meetingLink,
      duration: 60
    });

    await appointment.populate('therapistId', 'name credentials photo');

    res.status(201).json({ success: true, appointment });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/professional/appointments
 * @desc    Get user's appointments
 * @access  Private
 */
router.get('/appointments', authenticate, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    
    const query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = { $in: ['pending', 'confirmed'] };
    }

    const appointments = await Appointment.find(query)
      .populate('therapistId', 'name credentials photo contact')
      .sort({ date: upcoming === 'true' ? 1 : -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/professional/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Private
 */
router.patch('/appointments/:id/cancel', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment already cancelled' });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = reason;
    appointment.cancelledBy = 'user';
    appointment.cancelledAt = new Date();

    await appointment.save();

    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/professional/appointments/:id/feedback
 * @desc    Submit appointment feedback
 * @access  Private
 */
router.post('/appointments/:id/feedback', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found or not completed' });
    }

    appointment.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await appointment.save();

    // Update therapist rating
    const therapist = await Therapist.findById(appointment.therapistId);
    if (therapist) {
      const totalRating = therapist.rating.average * therapist.rating.count + rating;
      therapist.rating.count += 1;
      therapist.rating.average = totalRating / therapist.rating.count;
      await therapist.save();
    }

    res.json({ success: true, appointment });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PROGRESS SHARING ====================

/**
 * @route   POST /api/professional/share-progress
 * @desc    Share progress with therapist
 * @access  Private
 */
router.post('/share-progress', authenticate, async (req, res) => {
  try {
    const { therapistId, dataTypes, dateRange, shareType, expiresIn } = req.body;

    // Generate unique access token
    const accessToken = crypto.randomBytes(32).toString('hex');

    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
    }

    const progressShare = await ProgressShare.create({
      userId: req.user._id,
      therapistId,
      shareType,
      dataTypes,
      dateRange: {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      },
      accessToken,
      expiresAt
    });

    await progressShare.populate('therapistId', 'name email');

    res.status(201).json({ 
      success: true, 
      progressShare,
      shareLink: `${process.env.CLIENT_URL}/shared-progress/${accessToken}`
    });
  } catch (error) {
    console.error('Share progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/professional/shared-progress
 * @desc    Get user's shared progress records
 * @access  Private
 */
router.get('/shared-progress', authenticate, async (req, res) => {
  try {
    const shares = await ProgressShare.find({ userId: req.user._id })
      .populate('therapistId', 'name credentials photo')
      .sort({ createdAt: -1 });

    res.json({ success: true, shares });
  } catch (error) {
    console.error('Get shared progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/professional/shared-progress/:id/revoke
 * @desc    Revoke progress sharing access
 * @access  Private
 */
router.patch('/shared-progress/:id/revoke', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;

    const share = await ProgressShare.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!share) {
      return res.status(404).json({ success: false, message: 'Share not found' });
    }

    share.status = 'revoked';
    share.revokedAt = new Date();
    share.revokedReason = reason;

    await share.save();

    res.json({ success: true, share });
  } catch (error) {
    console.error('Revoke share error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/professional/shared-progress/:token
 * @desc    View shared progress (for therapists)
 * @access  Public (with token)
 */
router.get('/shared-progress/view/:token', async (req, res) => {
  try {
    const share = await ProgressShare.findOne({ 
      accessToken: req.params.token,
      status: 'active'
    }).populate('userId', 'profile');

    if (!share) {
      return res.status(404).json({ success: false, message: 'Share not found or expired' });
    }

    // Check if expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      share.status = 'expired';
      await share.save();
      return res.status(403).json({ success: false, message: 'Share has expired' });
    }

    // Update view count
    share.viewCount += 1;
    share.lastViewedAt = new Date();
    await share.save();

    // Fetch requested data based on dataTypes
    // This would be implemented based on your data structure

    res.json({ success: true, share });
  } catch (error) {
    console.error('View shared progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
