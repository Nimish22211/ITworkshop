const express = require('express');
const { upload, uploadToCloudinary, uploadMultipleImages } = require('../services/cloudinaryService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/upload/single
// @desc    Upload single image
// @access  Private
router.post('/single', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    
    res.json({
      message: 'Image uploaded successfully',
      image: result
    });
  } catch (error) {
    console.error('Single upload error:', error);
    res.status(500).json({ error: 'Server error during image upload' });
  }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
// @access  Private
router.post('/multiple', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const results = await uploadMultipleImages(req.files);
    
    res.json({
      message: 'Images uploaded successfully',
      images: results
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Server error during image upload' });
  }
});

// @route   POST /api/upload/issue-photos
// @desc    Upload photos for an issue
// @access  Private
router.post('/issue-photos', auth, upload.array('photos', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No photos provided' });
    }

    const results = await uploadMultipleImages(req.files);
    
    res.json({
      message: 'Issue photos uploaded successfully',
      photos: results
    });
  } catch (error) {
    console.error('Issue photos upload error:', error);
    res.status(500).json({ error: 'Server error during photo upload' });
  }
});

module.exports = router;
