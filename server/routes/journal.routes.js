import express from 'express';
import multer from 'multer';
import Journal from '../models/Journal.model.js';
import JournalPrompt from '../models/JournalPrompt.model.js';
import { authenticate } from '../middleware/auth.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import {
  analyzeSentiment,
  extractThemes,
  generateInsights,
  searchJournals,
  getJournalStats,
  getJournalInsights
} from '../services/journal.service.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|m4a|webm/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

/**
 * @route   POST /api/journal
 * @desc    Create a new journal entry
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, type, mood, tags, category, promptId, journalDate } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Analyze content
    const sentiment = analyzeSentiment(content);
    const themes = extractThemes(content, category);

    // Create journal entry
    const journal = await Journal.create({
      userId: req.user._id,
      title,
      content,
      type: type || 'text',
      mood,
      tags: tags || [],
      category: category || 'thoughts',
      promptId,
      journalDate: journalDate || new Date(),
      sentiment,
      themes
    });

    // Generate AI insights
    journal.aiInsights = generateInsights(journal);
    await journal.save();

    res.status(201).json({
      success: true,
      journal
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/journal
 * @desc    Get user's journal entries with pagination
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, type } = req.query;

    const query = { userId: req.user._id };
    if (category && category !== 'all') query.category = category;
    if (type && type !== 'all') query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [journals, total] = await Promise.all([
      Journal.find(query)
        .sort({ journalDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Journal.countDocuments(query)
    ]);

    res.json({
      success: true,
      journals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching journals:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/journal/search
 * @desc    Search journals with filters
 * @access  Private
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const result = await searchJournals(req.user._id, req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error searching journals:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/journal/stats
 * @desc    Get journal statistics
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await getJournalStats(req.user._id);
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/journal/insights
 * @desc    Get AI-generated insights
 * @access  Private
 */
router.get('/insights', authenticate, async (req, res) => {
  try {
    const insights = await getJournalInsights(req.user._id);
    res.json({
      success: true,
      ...insights
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/journal/:id
 * @desc    Get a specific journal entry
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('promptId');

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }

    res.json({
      success: true,
      journal
    });
  } catch (error) {
    console.error('Error fetching journal:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PATCH /api/journal/:id
 * @desc    Update a journal entry
 * @access  Private
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { title, content, mood, tags, category, isFavorite } = req.body;

    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }

    // Update fields
    if (title) journal.title = title;
    if (content) {
      journal.content = content;
      journal.sentiment = analyzeSentiment(content);
      journal.themes = extractThemes(content, journal.category);
      journal.aiInsights = generateInsights(journal);
    }
    if (mood !== undefined) journal.mood = mood;
    if (tags) journal.tags = tags;
    if (category) journal.category = category;
    if (isFavorite !== undefined) journal.isFavorite = isFavorite;

    await journal.save();

    res.json({
      success: true,
      journal
    });
  } catch (error) {
    console.error('Error updating journal:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/journal/:id
 * @desc    Delete a journal entry
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }

    // Delete voice/photo files from Cloudinary
    if (journal.voicePublicId) {
      await deleteFromCloudinary(journal.voicePublicId, 'video');
    }
    if (journal.photos && journal.photos.length > 0) {
      for (const photo of journal.photos) {
        if (photo.publicId) {
          await deleteFromCloudinary(photo.publicId, 'image');
        }
      }
    }

    await journal.deleteOne();

    res.json({
      success: true,
      message: 'Journal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting journal:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/journal/:id/voice
 * @desc    Upload voice recording to journal
 * @access  Private
 */
router.post('/:id/voice', authenticate, upload.single('voice'), async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'mindmate/journals/voice', 'video');

    // Delete old voice if exists
    if (journal.voicePublicId) {
      await deleteFromCloudinary(journal.voicePublicId, 'video');
    }

    journal.voiceUrl = result.url;
    journal.voicePublicId = result.publicId;
    journal.type = journal.photos && journal.photos.length > 0 ? 'mixed' : 'voice';
    
    if (req.body.duration) {
      journal.voiceDuration = parseFloat(req.body.duration);
    }
    if (req.body.transcript) {
      journal.voiceTranscript = req.body.transcript;
    }

    await journal.save();

    res.json({
      success: true,
      journal
    });
  } catch (error) {
    console.error('Error uploading voice:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/journal/:id/photos
 * @desc    Upload photos to journal
 * @access  Private
 */
router.post('/:id/photos', authenticate, upload.array('photos', 5), async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Upload each photo to Cloudinary
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.path, 'mindmate/journals/photos', 'image')
    );

    const results = await Promise.all(uploadPromises);

    // Add photos to journal
    const newPhotos = results.map((result, index) => ({
      url: result.url,
      publicId: result.publicId,
      caption: req.body.captions ? req.body.captions[index] : ''
    }));

    journal.photos = [...(journal.photos || []), ...newPhotos];
    journal.type = journal.voiceUrl ? 'mixed' : 'photo';

    await journal.save();

    res.json({
      success: true,
      journal
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/journal/:id/photos/:photoId
 * @desc    Delete a photo from journal
 * @access  Private
 */
router.delete('/:id/photos/:photoId', authenticate, async (req, res) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found'
      });
    }

    const photo = journal.photos.id(req.params.photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Delete from Cloudinary
    if (photo.publicId) {
      await deleteFromCloudinary(photo.publicId, 'image');
    }

    photo.deleteOne();
    await journal.save();

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== JOURNAL PROMPTS ====================

/**
 * @route   GET /api/journal/prompts/random
 * @desc    Get random journal prompts
 * @access  Private
 */
router.get('/prompts/random', authenticate, async (req, res) => {
  try {
    const { category, difficulty, count = 3 } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const prompts = await JournalPrompt.aggregate([
      { $match: query },
      { $sample: { size: parseInt(count) } }
    ]);

    res.json({
      success: true,
      prompts
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/journal/prompts/categories
 * @desc    Get all prompt categories
 * @access  Private
 */
router.get('/prompts/categories', authenticate, async (req, res) => {
  try {
    const categories = await JournalPrompt.distinct('category', { isActive: true });
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/journal/prompts
 * @desc    Get all journal prompts with filters
 * @access  Private
 */
router.get('/prompts', authenticate, async (req, res) => {
  try {
    const { category, difficulty, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [prompts, total] = await Promise.all([
      JournalPrompt.find(query)
        .sort({ usageCount: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JournalPrompt.countDocuments(query)
    ]);

    res.json({
      success: true,
      prompts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/journal/prompts/:id/use
 * @desc    Increment prompt usage count
 * @access  Private
 */
router.post('/prompts/:id/use', authenticate, async (req, res) => {
  try {
    const prompt = await JournalPrompt.findByIdAndUpdate(
      req.params.id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    res.json({
      success: true,
      prompt
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
