import express from 'express';
import Conversation from '../models/Conversation.model.js';
import { authenticate } from '../middleware/auth.js';
import { generateAIResponse } from '../services/gemini.service.js';

const router = express.Router();

// List available Gemini models
router.get('/list-models', authenticate, async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: false,
        message: 'GEMINI_API_KEY is not configured in .env file'
      });
    }
    
    const axios = (await import('axios')).default;
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    const contentModels = response.data.models
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => ({
        name: m.name.replace('models/', ''),
        displayName: m.displayName,
        description: m.description
      }));
    
    res.json({
      success: true,
      availableModels: contentModels,
      currentModel: 'gemini-1.5-flash'
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      error: error.response?.data || error.message
    });
  }
});

// Test endpoint to check Gemini API configuration
router.get('/test-gemini', authenticate, async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: false,
        message: 'GEMINI_API_KEY is not configured in .env file',
        configured: false
      });
    }
    
    // Try a simple test request
    const testResponse = await generateAIResponse('Hello, this is a test message', []);
    
    res.json({
      success: true,
      message: 'Gemini API is working correctly',
      configured: true,
      testResponse: testResponse.response.substring(0, 100) + '...'
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
      configured: true,
      error: error.response?.data || error.message
    });
  }
});

// Get all conversations for user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .sort({ lastMessageAt: -1 })
      .select('_id messages lastMessageAt createdAt');
    
    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new conversation
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const conversation = await Conversation.create({
      userId: req.user._id,
      messages: []
    });
    
    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get specific conversation
router.get('/:conversationId', authenticate, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      userId: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    
    res.json({
      success: true,
      messages: conversation.messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message to AI in specific conversation
router.post('/:conversationId/message', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    
    let conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      userId: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    
    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Build user context for personalization
    const userContext = {
      name: req.user.profile?.name || 'there',
      university: req.user.profile?.university,
      year: req.user.profile?.year,
      bio: req.user.profile?.bio,
      about: req.user.profile?.about
    };
    
    // Generate AI response with user context
    const { response, crisisDetected } = await generateAIResponse(
      message,
      conversation.messages.slice(-10), // Last 10 messages for context
      userContext // Pass user context for personalization
    );
    
    // Add AI response
    conversation.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      crisisDetected
    });
    
    conversation.lastMessageAt = new Date();
    await conversation.save();
    
    res.json({
      success: true,
      message: response,
      crisisDetected
    });
  } catch (error) {
    console.error('Chat error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate response' 
    });
  }
});

// Delete specific conversation
router.delete('/:conversationId', authenticate, async (req, res) => {
  try {
    await Conversation.findOneAndDelete({
      _id: req.params.conversationId,
      userId: req.user._id
    });
    
    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
