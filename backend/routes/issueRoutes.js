const express = require('express');
const { body, validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const { auth, requireRole, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/issues
// @desc    Get all issues with optional filters
// @access  Public (with optional auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const issueModel = new Issue(req.db);
    const filters = req.query;
    
    const issues = await issueModel.findAll(filters);
    
    res.json(issues);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Server error while fetching issues' });
  }
});

// @route   GET /api/issues/:id
// @desc    Get issue by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const issueModel = new Issue(req.db);
    const issue = await issueModel.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    res.json(issue);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Server error while fetching issue' });
  }
});

// @route   POST /api/issues
// @desc    Create a new issue
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 5, max: 255 }).withMessage('Title must be between 5 and 255 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['pothole', 'streetlight', 'graffiti', 'waste', 'sewage', 'road', 'other']).withMessage('Invalid category'),
  body('severity').isInt({ min: 1, max: 5 }).withMessage('Severity must be between 1 and 5'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('photos').optional().isArray().withMessage('Photos must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const issueModel = new Issue(req.db);
    const issueData = {
      ...req.body,
      reported_by: req.user.id
    };

    const issue = await issueModel.create(issueData);
    
    // Emit real-time update
    req.io.emit('new-issue', issue);
    
    res.status(201).json(issue);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Server error while creating issue' });
  }
});

// @route   PUT /api/issues/:id/status
// @desc    Update issue status
// @access  Private (Official/Admin only)
router.put('/:id/status', [
  auth,
  requireRole(['official', 'admin']),
  body('status').isIn(['reported', 'acknowledged', 'in_progress', 'resolved', 'verified']).withMessage('Invalid status'),
  body('internal_notes').optional().isString().withMessage('Internal notes must be a string')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const issueModel = new Issue(req.db);
    const { status, internal_notes } = req.body;
    
    const updatedIssue = await issueModel.updateStatus(
      req.params.id, 
      status, 
      req.user.id, 
      internal_notes
    );
    
    if (!updatedIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    // Emit real-time update
    req.io.emit('issue-updated', updatedIssue);
    
    res.json(updatedIssue);
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({ error: 'Server error while updating issue status' });
  }
});

// @route   PUT /api/issues/:id/assign
// @desc    Assign issue to official
// @access  Private (Admin only)
router.put('/:id/assign', [
  auth,
  requireRole(['admin']),
  body('assigned_to').isInt().withMessage('Assigned to must be a valid user ID')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const issueModel = new Issue(req.db);
    const { assigned_to } = req.body;
    
    const updatedIssue = await issueModel.assignToOfficial(
      req.params.id, 
      assigned_to, 
      req.user.id
    );
    
    if (!updatedIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    // Emit real-time update
    req.io.emit('issue-assigned', updatedIssue);
    
    res.json(updatedIssue);
  } catch (error) {
    console.error('Assign issue error:', error);
    res.status(500).json({ error: 'Server error while assigning issue' });
  }
});

// @route   GET /api/issues/assigned/:officialId
// @desc    Get issues assigned to specific official
// @access  Private (Official/Admin only)
router.get('/assigned/:officialId', [
  auth,
  requireRole(['official', 'admin'])
], async (req, res) => {
  try {
    const issueModel = new Issue(req.db);
    const issues = await issueModel.findByAssignedOfficial(req.params.officialId);
    
    res.json(issues);
  } catch (error) {
    console.error('Get assigned issues error:', error);
    res.status(500).json({ error: 'Server error while fetching assigned issues' });
  }
});

// @route   GET /api/issues/:id/history
// @desc    Get issue status history
// @access  Private
router.get('/:id/history', auth, async (req, res) => {
  try {
    const issueModel = new Issue(req.db);
    const history = await issueModel.getStatusHistory(req.params.id);
    
    res.json(history);
  } catch (error) {
    console.error('Get issue history error:', error);
    res.status(500).json({ error: 'Server error while fetching issue history' });
  }
});

// @route   GET /api/issues/analytics
// @desc    Get analytics data
// @access  Private (Admin only)
router.get('/analytics', [
  auth,
  requireRole(['admin'])
], async (req, res) => {
  try {
    const issueModel = new Issue(req.db);
    const analytics = await issueModel.getAnalytics();
    
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error while fetching analytics' });
  }
});

module.exports = router;
