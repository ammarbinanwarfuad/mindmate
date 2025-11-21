import express from 'express';
import StudyBuddy from '../models/StudyBuddy.model.js';
import SocialEvent from '../models/SocialEvent.model.js';
import InterestGroup from '../models/InterestGroup.model.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ==================== STUDY BUDDY FINDER ====================

/**
 * @route   POST /api/social/study-buddy/profile
 * @desc    Create/Update study buddy profile
 * @access  Private
 */
router.post('/study-buddy/profile', authenticate, async (req, res) => {
  try {
    const { subjects, studyGoals, availability, preferredStudyStyle, location, city, university, yearOfStudy, bio, interests, lookingFor } = req.body;

    let profile = await StudyBuddy.findOne({ userId: req.user._id });

    if (profile) {
      // Update existing profile
      Object.assign(profile, { subjects, studyGoals, availability, preferredStudyStyle, location, city, university, yearOfStudy, bio, interests, lookingFor });
      await profile.save();
    } else {
      // Create new profile
      profile = await StudyBuddy.create({
        userId: req.user._id,
        subjects,
        studyGoals,
        availability,
        preferredStudyStyle,
        location,
        city,
        university,
        yearOfStudy,
        bio,
        interests,
        lookingFor
      });
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Create study buddy profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/social/study-buddy/search
 * @desc    Search for study buddies
 * @access  Private
 */
router.get('/study-buddy/search', authenticate, async (req, res) => {
  try {
    const { subject, location, city, university, lookingFor } = req.query;

    const query = { active: true, userId: { $ne: req.user._id } };
    
    if (subject) query.subjects = subject;
    if (location) query.location = location;
    if (city) query.city = new RegExp(city, 'i');
    if (university) query.university = new RegExp(university, 'i');
    if (lookingFor) query.lookingFor = lookingFor;

    const buddies = await StudyBuddy.find(query)
      .populate('userId', 'profile')
      .limit(50);

    res.json({ success: true, buddies });
  } catch (error) {
    console.error('Search study buddies error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/social/study-buddy/request/:id
 * @desc    Send study buddy request
 * @access  Private
 */
router.post('/study-buddy/request/:id', authenticate, async (req, res) => {
  try {
    const buddy = await StudyBuddy.findById(req.params.id);
    
    if (!buddy) {
      return res.status(404).json({ success: false, message: 'Study buddy not found' });
    }

    // Check if request already exists
    const existingRequest = buddy.requests.find(r => r.from.toString() === req.user._id.toString());
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Request already sent' });
    }

    buddy.requests.push({ from: req.user._id });
    await buddy.save();

    res.json({ success: true, message: 'Request sent' });
  } catch (error) {
    console.error('Send study buddy request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== EVENTS ====================

/**
 * @route   POST /api/social/events
 * @desc    Create event
 * @access  Private
 */
router.post('/events', authenticate, async (req, res) => {
  try {
    const event = await SocialEvent.create({
      organizerId: req.user._id,
      ...req.body
    });

    await event.populate('organizerId', 'profile');

    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/social/events
 * @desc    Get events
 * @access  Private
 */
router.get('/events', authenticate, async (req, res) => {
  try {
    const { type, format, city, upcoming } = req.query;

    const query = {};
    
    if (type) query.type = type;
    if (format) query.format = format;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = 'upcoming';
    }

    const events = await SocialEvent.find(query)
      .populate('organizerId', 'profile')
      .sort({ date: 1 })
      .limit(50);

    res.json({ success: true, events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/social/events/:id/join
 * @desc    Join event
 * @access  Private
 */
router.post('/events/:id/join', authenticate, async (req, res) => {
  try {
    const event = await SocialEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if already joined
    const alreadyJoined = event.attendees.some(a => a.userId.toString() === req.user._id.toString());
    if (alreadyJoined) {
      return res.status(400).json({ success: false, message: 'Already joined' });
    }

    // Check capacity
    if (event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    event.attendees.push({ userId: req.user._id, status: 'going' });
    await event.save();

    res.json({ success: true, event });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/social/events/:id/leave
 * @desc    Leave event
 * @access  Private
 */
router.delete('/events/:id/leave', authenticate, async (req, res) => {
  try {
    const event = await SocialEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.attendees = event.attendees.filter(a => a.userId.toString() !== req.user._id.toString());
    await event.save();

    res.json({ success: true, message: 'Left event' });
  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== INTEREST GROUPS ====================

/**
 * @route   POST /api/social/groups
 * @desc    Create interest group
 * @access  Private
 */
router.post('/groups', authenticate, async (req, res) => {
  try {
    const { name, description, category, tags, imageUrl, visibility, rules } = req.body;

    const group = await InterestGroup.create({
      name,
      description,
      category,
      tags,
      imageUrl,
      visibility,
      rules,
      createdBy: req.user._id,
      admins: [req.user._id],
      members: [{
        userId: req.user._id,
        role: 'admin'
      }],
      memberCount: 1
    });

    res.status(201).json({ success: true, group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/social/groups
 * @desc    Get interest groups
 * @access  Private
 */
router.get('/groups', authenticate, async (req, res) => {
  try {
    const { category, search } = req.query;

    const query = { active: true };
    
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    const groups = await InterestGroup.find(query)
      .populate('createdBy', 'profile')
      .sort({ memberCount: -1 })
      .limit(50);

    res.json({ success: true, groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/social/groups/:id/join
 * @desc    Join interest group
 * @access  Private
 */
router.post('/groups/:id/join', authenticate, async (req, res) => {
  try {
    const group = await InterestGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if already a member
    const isMember = group.members.some(m => m.userId.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    group.members.push({ userId: req.user._id, role: 'member' });
    group.memberCount += 1;
    await group.save();

    res.json({ success: true, group });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/social/groups/:id/posts
 * @desc    Create group post
 * @access  Private
 */
router.post('/groups/:id/posts', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const group = await InterestGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(m => m.userId.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Must be a member to post' });
    }

    group.posts.unshift({
      userId: req.user._id,
      content
    });

    await group.save();
    await group.populate('posts.userId', 'profile');

    res.json({ success: true, post: group.posts[0] });
  } catch (error) {
    console.error('Create group post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/social/groups/:id
 * @desc    Get group details
 * @access  Private
 */
router.get('/groups/:id', authenticate, async (req, res) => {
  try {
    const group = await InterestGroup.findById(req.params.id)
      .populate('createdBy', 'profile')
      .populate('members.userId', 'profile')
      .populate('posts.userId', 'profile')
      .populate('posts.comments.userId', 'profile');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    res.json({ success: true, group });
  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
