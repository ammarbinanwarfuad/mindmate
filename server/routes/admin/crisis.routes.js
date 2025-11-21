import express from 'express';
import { requirePermission, logAdminAction } from '../../middleware/adminAuth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/crisis-alerts
 * @desc    Get all crisis alerts
 * @access  Private (requires 'view_crisis' permission)
 */
router.get('/', requirePermission('view_crisis'), async (req, res) => {
  try {
    const {
      status = 'active',
      severity,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const CrisisLog = (await import('../../models/CrisisLog.model.js')).default;

    // Build query
    const query = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (severity) {
      query.severity = severity;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [alerts, total] = await Promise.all([
      CrisisLog.find(query)
        .populate('userId', 'profile.name email profile.university')
        .populate('handledBy', 'profile.name email')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      CrisisLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      alerts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get crisis alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crisis alerts',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/crisis-alerts/stats/overview
 * @desc    Get crisis statistics
 * @access  Private (requires 'view_crisis' permission)
 */
router.get('/stats/overview', requirePermission('view_crisis'), async (req, res) => {
  try {
    const CrisisLog = (await import('../../models/CrisisLog.model.js')).default;

    const [
      totalAlerts,
      activeAlerts,
      handledAlerts,
      escalatedAlerts,
      criticalAlerts,
      highAlerts,
      alertsToday
    ] = await Promise.all([
      CrisisLog.countDocuments(),
      CrisisLog.countDocuments({ status: 'active' }),
      CrisisLog.countDocuments({ status: 'handled' }),
      CrisisLog.countDocuments({ status: 'escalated' }),
      CrisisLog.countDocuments({ severity: 'critical' }),
      CrisisLog.countDocuments({ severity: 'high' }),
      CrisisLog.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
    ]);

    res.json({
      success: true,
      stats: {
        total: totalAlerts,
        byStatus: {
          active: activeAlerts,
          handled: handledAlerts,
          escalated: escalatedAlerts
        },
        bySeverity: {
          critical: criticalAlerts,
          high: highAlerts
        },
        today: alertsToday
      }
    });
  } catch (error) {
    console.error('Get crisis stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crisis statistics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/crisis-alerts/:id
 * @desc    Get crisis alert details
 * @access  Private (requires 'view_crisis' permission)
 */
router.get('/:id', requirePermission('view_crisis'), async (req, res) => {
  try {
    const CrisisLog = (await import('../../models/CrisisLog.model.js')).default;

    const alert = await CrisisLog.findById(req.params.id)
      .populate('userId', 'profile.name email profile.university profile.profilePicture')
      .populate('handledBy', 'profile.name email')
      .lean();

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Crisis alert not found'
      });
    }

    res.json({
      success: true,
      alert
    });
  } catch (error) {
    console.error('Get crisis alert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crisis alert',
      message: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/crisis-alerts/:id/handle
 * @desc    Mark crisis alert as handled
 * @access  Private (requires 'handle_crisis' permission)
 */
router.patch('/:id/handle', requirePermission('handle_crisis'), async (req, res) => {
  try {
    const { action, notes, contactedEmergency } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action is required (contacted_user, escalated, resolved, etc.)'
      });
    }

    const CrisisLog = (await import('../../models/CrisisLog.model.js')).default;

    const alert = await CrisisLog.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Crisis alert not found'
      });
    }

    // Update alert
    alert.status = 'handled';
    alert.handledBy = req.user._id;
    alert.handledAt = new Date();
    alert.actionTaken = action;
    alert.notes = notes || '';
    alert.emergencyContacted = contactedEmergency || false;

    await alert.save();

    // Log action
    await logAdminAction(req, 'crisis_handled', 'crisis', alert._id, {
      action,
      notes,
      contactedEmergency,
      userId: alert.userId
    });

    res.json({
      success: true,
      message: 'Crisis alert marked as handled',
      alert: {
        _id: alert._id,
        status: alert.status,
        handledBy: alert.handledBy,
        handledAt: alert.handledAt
      }
    });
  } catch (error) {
    console.error('Handle crisis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to handle crisis alert',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/crisis-alerts/:id/escalate
 * @desc    Escalate crisis alert to emergency services
 * @access  Private (requires 'contact_emergency' permission)
 */
router.post('/:id/escalate', requirePermission('contact_emergency'), async (req, res) => {
  try {
    const { service, contactPerson, notes } = req.body;

    if (!service || !contactPerson) {
      return res.status(400).json({
        success: false,
        error: 'Emergency service and contact person are required'
      });
    }

    const CrisisLog = (await import('../../models/CrisisLog.model.js')).default;

    const alert = await CrisisLog.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Crisis alert not found'
      });
    }

    // Update alert
    alert.status = 'escalated';
    alert.escalatedTo = service;
    alert.escalatedBy = req.user._id;
    alert.escalatedAt = new Date();
    alert.emergencyContact = contactPerson;
    alert.emergencyContacted = true;
    alert.notes = notes || '';

    await alert.save();

    // Log action
    await logAdminAction(req, 'crisis_escalated', 'crisis', alert._id, {
      service,
      contactPerson,
      notes,
      userId: alert.userId
    });

    // TODO: Send notification to emergency services
    // TODO: Send notification to user's emergency contacts

    res.json({
      success: true,
      message: 'Crisis alert escalated to emergency services',
      alert: {
        _id: alert._id,
        status: alert.status,
        escalatedTo: alert.escalatedTo,
        escalatedAt: alert.escalatedAt
      }
    });
  } catch (error) {
    console.error('Escalate crisis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to escalate crisis alert',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/crisis-alerts/:id/contact-emergency
 * @desc    Log emergency contact action
 * @access  Private (requires 'contact_emergency' permission)
 */
router.post('/:id/contact-emergency', requirePermission('contact_emergency'), async (req, res) => {
  try {
    const { contactType, contactDetails, outcome } = req.body;

    if (!contactType || !contactDetails) {
      return res.status(400).json({
        success: false,
        error: 'Contact type and details are required'
      });
    }

    const CrisisLog = (await import('../../models/CrisisLog.model.js')).default;

    const alert = await CrisisLog.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Crisis alert not found'
      });
    }

    // Update alert
    alert.emergencyContacted = true;
    alert.emergencyContactDetails = {
      type: contactType,
      details: contactDetails,
      outcome: outcome || 'pending',
      contactedBy: req.user._id,
      contactedAt: new Date()
    };

    await alert.save();

    // Log action
    await logAdminAction(req, 'emergency_contacted', 'crisis', alert._id, {
      contactType,
      contactDetails,
      outcome,
      userId: alert.userId
    });

    res.json({
      success: true,
      message: 'Emergency contact logged successfully',
      alert: {
        _id: alert._id,
        emergencyContacted: alert.emergencyContacted,
        emergencyContactDetails: alert.emergencyContactDetails
      }
    });
  } catch (error) {
    console.error('Contact emergency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log emergency contact',
      message: error.message
    });
  }
});

export default router;
