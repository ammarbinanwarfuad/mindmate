import express from 'express';
import Match from '../models/Match.model.js';
import Notification from '../models/Notification.model.js';
import { authenticate } from '../middleware/auth.js';
import { findMatches } from '../services/matching.service.js';

const router = express.Router();

// Find potential matches
router.get('/find', authenticate, async (req, res) => {
  try {
    const matches = await findMatches(req.user._id);
    
    res.json({
      success: true,
      matches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's matches
router.get('/my-matches', authenticate, async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [
        { user1Id: req.user._id },
        { user2Id: req.user._id }
      ],
      status: 'accepted'
    })
    .populate('user1Id', 'profile.name profile.profilePicture profile.university')
    .populate('user2Id', 'profile.name profile.profilePicture profile.university');
    
    const formattedMatches = matches.map(match => {
      const otherUser = match.user1Id._id.toString() === req.user._id.toString()
        ? match.user2Id
        : match.user1Id;
      
      return {
        matchId: match._id,
        user: {
          id: otherUser._id,
          name: otherUser.profile.name,
          profilePicture: otherUser.profile.profilePicture,
          university: otherUser.profile.university
        },
        matchScore: match.matchScore,
        commonInterests: match.commonInterests,
        createdAt: match.createdAt
      };
    });
    
    res.json({
      success: true,
      matches: formattedMatches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send match request
router.post('/request', authenticate, async (req, res) => {
  try {
    const { targetUserId, matchScore, commonInterests } = req.body;
    
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required' });
    }
    
    // Check if match already exists
    const existingMatch = await Match.findOne({
      $or: [
        { user1Id: req.user._id, user2Id: targetUserId },
        { user1Id: targetUserId, user2Id: req.user._id }
      ]
    });
    
    if (existingMatch) {
      return res.status(400).json({ success: false, message: 'Match already exists' });
    }
    
    const match = await Match.create({
      user1Id: req.user._id,
      user2Id: targetUserId,
      matchScore: matchScore || 50,
      commonInterests: commonInterests || [],
      status: 'pending',
      initiatedBy: req.user._id
    });
    
    // Create notification for target user
    await Notification.create({
      userId: targetUserId,
      type: 'match',
      title: 'New Match Request',
      message: `${req.user.profile.name} wants to connect with you!`,
      link: `/matches`,
      relatedId: match._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Match request sent successfully',
      match
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept/reject match
router.patch('/:matchId', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const match = await Match.findById(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    // Verify user is part of the match
    if (match.user1Id.toString() !== req.user._id.toString() &&
        match.user2Id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    match.status = status;
    await match.save();
    
    // Notify the other user
    const otherUserId = match.user1Id.toString() === req.user._id.toString()
      ? match.user2Id
      : match.user1Id;
    
    if (status === 'accepted') {
      await Notification.create({
        userId: otherUserId,
        type: 'match',
        title: 'Match Accepted!',
        message: `${req.user.profile.name} accepted your match request!`,
        link: `/matches`,
        relatedId: match._id
      });
    }
    
    res.json({
      success: true,
      message: `Match ${status} successfully`,
      match
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
