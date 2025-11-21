import express from 'express';
import { upload } from '../middleware/upload.js';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinaryUpload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/upload
 * @desc    Generic upload endpoint (accepts 'file' or 'image' field name)
 * @access  Private
 */
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file provided' 
      });
    }

    // Get folder from query params or use default
    const folder = req.query.folder || 'mindmate/profiles';

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, folder);

    // Save to user's photo history
    try {
      const User = (await import('../models/User.model.js')).default;
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          'photoHistory': {
            url: result.secure_url,
            publicId: result.public_id,
            type: req.query.type || 'general',
            uploadedAt: new Date()
          }
        }
      });
    } catch (dbError) {
      console.error('Error saving photo history:', dbError);
      // Continue even if history save fails
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload file', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image to Cloudinary
 * @access  Private
 */
router.post('/image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Get folder from query params or use default
    const folder = req.query.folder || 'mindmate/general';

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/upload/profile-picture
 * @desc    Upload profile picture
 * @access  Private
 */
router.post('/profile-picture', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const userId = req.user.uid;
    const folder = 'mindmate/profiles';
    const publicId = `user_${userId}`;

    // Upload to Cloudinary with specific public ID
    const result = await uploadToCloudinary(req.file.buffer, folder, publicId);

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload profile picture', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/upload/community-post
 * @desc    Upload image for community post
 * @access  Private
 */
router.post('/community-post', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const folder = 'mindmate/community';

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      message: 'Community post image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Community post image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload community post image', 
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/upload/image
 * @desc    Delete image from Cloudinary
 * @access  Private
 */
router.delete('/image', authenticate, async (req, res) => {
  try {
    const { url, publicId } = req.body;

    if (!url && !publicId) {
      return res.status(400).json({ 
        message: 'Either image URL or public ID is required' 
      });
    }

    // Extract public ID from URL if not provided
    const imagePublicId = publicId || getPublicIdFromUrl(url);

    if (!imagePublicId) {
      return res.status(400).json({ 
        message: 'Invalid image URL or public ID' 
      });
    }

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(imagePublicId);

    if (result.result === 'ok') {
      // Remove from user's photo history
      try {
        const User = (await import('../models/User.model.js')).default;
        await User.findByIdAndUpdate(req.user._id, {
          $pull: {
            'photoHistory': { publicId: imagePublicId }
          }
        });
      } catch (dbError) {
        console.error('Error removing from photo history:', dbError);
        // Continue even if history removal fails
      }

      res.status(200).json({
        message: 'Image deleted successfully',
        publicId: imagePublicId,
      });
    } else {
      res.status(404).json({
        message: 'Image not found or already deleted',
      });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ 
      message: 'Failed to delete image', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple images (max 5)
 * @access  Private
 */
router.post('/multiple', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const folder = req.query.folder || 'mindmate/general';
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, folder)
    );

    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    }));

    res.status(200).json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload images', 
      error: error.message 
    });
  }
});

export default router;
