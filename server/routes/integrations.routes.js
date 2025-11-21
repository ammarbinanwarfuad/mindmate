import express from 'express';
import Integration from '../models/Integration.model.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/integrations
 * @desc    Get user's integrations
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const integrations = await Integration.find({ userId: req.user._id });
    res.json({ success: true, integrations });
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/integrations/connect
 * @desc    Connect integration
 * @access  Private
 */
router.post('/connect', authenticate, async (req, res) => {
  try {
    const { provider, accessToken, refreshToken, tokenExpiry, providerUserId, metadata } = req.body;

    // Check if integration already exists
    let integration = await Integration.findOne({
      userId: req.user._id,
      provider
    });

    if (integration) {
      // Update existing integration
      integration.accessToken = accessToken;
      integration.refreshToken = refreshToken;
      integration.tokenExpiry = tokenExpiry;
      integration.providerUserId = providerUserId;
      integration.metadata = metadata;
      integration.status = 'connected';
      await integration.save();
    } else {
      // Create new integration
      integration = await Integration.create({
        userId: req.user._id,
        provider,
        accessToken,
        refreshToken,
        tokenExpiry,
        providerUserId,
        metadata,
        status: 'connected'
      });
    }

    res.json({ success: true, integration });
  } catch (error) {
    console.error('Connect integration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/integrations/:provider
 * @desc    Disconnect integration
 * @access  Private
 */
router.delete('/:provider', authenticate, async (req, res) => {
  try {
    const integration = await Integration.findOneAndDelete({
      userId: req.user._id,
      provider: req.params.provider
    });

    if (!integration) {
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }

    res.json({ success: true, message: 'Integration disconnected' });
  } catch (error) {
    console.error('Disconnect integration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/integrations/:provider/sync
 * @desc    Trigger manual sync
 * @access  Private
 */
router.post('/:provider/sync', authenticate, async (req, res) => {
  try {
    const integration = await Integration.findOne({
      userId: req.user._id,
      provider: req.params.provider
    });

    if (!integration) {
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }

    // Check if token is expired
    if (integration.isTokenExpired()) {
      integration.status = 'error';
      integration.lastError = {
        message: 'Token expired. Please reconnect.',
        timestamp: new Date()
      };
      await integration.save();
      return res.status(401).json({ success: false, message: 'Token expired' });
    }

    // Simulate sync based on provider
    let syncResult;
    switch (req.params.provider) {
      case 'google-calendar':
      case 'outlook':
        syncResult = await syncCalendar(integration);
        break;
      case 'fitbit':
      case 'apple-health':
        syncResult = await syncFitnessData(integration);
        break;
      case 'spotify':
        syncResult = await syncSpotifyData(integration);
        break;
      case 'sleep-tracker':
        syncResult = await syncSleepData(integration);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Unknown provider' });
    }

    integration.recordSync(syncResult.status, syncResult.itemsSynced, syncResult.errors);
    await integration.save();

    res.json({ success: true, syncResult, integration });
  } catch (error) {
    console.error('Sync integration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /api/integrations/:provider/settings
 * @desc    Update integration settings
 * @access  Private
 */
router.patch('/:provider/settings', authenticate, async (req, res) => {
  try {
    const integration = await Integration.findOne({
      userId: req.user._id,
      provider: req.params.provider
    });

    if (!integration) {
      return res.status(404).json({ success: false, message: 'Integration not found' });
    }

    Object.assign(integration.settings, req.body);
    await integration.save();

    res.json({ success: true, integration });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/integrations/spotify/playlists
 * @desc    Get mood-based Spotify playlists
 * @access  Private
 */
router.get('/spotify/playlists', authenticate, async (req, res) => {
  try {
    const { mood } = req.query;
    
    // Predefined mood-based playlists
    const moodPlaylists = {
      happy: [
        { id: '37i9dQZF1DXdPec7aLTmlC', name: 'Happy Hits', image: 'https://via.placeholder.com/300' },
        { id: '37i9dQZF1DX3rxVfibe1L0', name: 'Mood Booster', image: 'https://via.placeholder.com/300' }
      ],
      sad: [
        { id: '37i9dQZF1DX7qK8ma5wgG1', name: 'Sad Songs', image: 'https://via.placeholder.com/300' },
        { id: '37i9dQZF1DWSqBruwoIXkA', name: 'Life Sucks', image: 'https://via.placeholder.com/300' }
      ],
      anxious: [
        { id: '37i9dQZF1DWZqd5JICZI0u', name: 'Calm Vibes', image: 'https://via.placeholder.com/300' },
        { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano', image: 'https://via.placeholder.com/300' }
      ],
      energetic: [
        { id: '37i9dQZF1DX76Wlfdnj7AP', name: 'Beast Mode', image: 'https://via.placeholder.com/300' },
        { id: '37i9dQZF1DX3rxVfibe1L0', name: 'Power Hour', image: 'https://via.placeholder.com/300' }
      ],
      relaxed: [
        { id: '37i9dQZF1DWZqd5JICZI0u', name: 'Chill Hits', image: 'https://via.placeholder.com/300' },
        { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano', image: 'https://via.placeholder.com/300' }
      ]
    };

    const playlists = moodPlaylists[mood] || moodPlaylists.relaxed;
    res.json({ success: true, playlists });
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper functions (simulated - would use actual APIs in production)
async function syncCalendar(integration) {
  // Simulate calendar sync
  return {
    status: 'success',
    itemsSynced: Math.floor(Math.random() * 10) + 1,
    errors: []
  };
}

async function syncFitnessData(integration) {
  // Simulate fitness data sync
  return {
    status: 'success',
    itemsSynced: Math.floor(Math.random() * 20) + 5,
    errors: []
  };
}

async function syncSpotifyData(integration) {
  // Simulate Spotify sync
  return {
    status: 'success',
    itemsSynced: Math.floor(Math.random() * 5) + 1,
    errors: []
  };
}

async function syncSleepData(integration) {
  // Simulate sleep data sync
  return {
    status: 'success',
    itemsSynced: Math.floor(Math.random() * 7) + 1,
    errors: []
  };
}

export default router;
