const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin only)
router.get('/', [
  auth,
  requireRole(['admin'])
], async (req, res) => {
  try {
    const userModel = new User(req.db);
    const filters = req.query;
    const users = await userModel.findAll(filters);
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

// @route   GET /api/users/officials
// @desc    Get all officials
// @access  Private
router.get('/officials', auth, async (req, res) => {
  try {
    const userModel = new User(req.db);
    const officials = await userModel.findOfficials();
    
    res.json(officials);
  } catch (error) {
    console.error('Get officials error:', error);
    res.status(500).json({ error: 'Server error while fetching officials' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const userModel = new User(req.db);
    const user = await userModel.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error while fetching user' });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private (Admin only)
router.put('/:id/role', [
  auth,
  requireRole(['admin']),
  body('role').isIn(['citizen', 'official', 'admin']).withMessage('Invalid role'),
  body('department').optional().isString().withMessage('Department must be a string')
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

    const { role, department } = req.body;
    const userModel = new User(req.db);
    
    const updatedUser = await userModel.updateRole(
      req.params.id, 
      role, 
      role === 'official' ? department : null
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Server error while updating user role' });
  }
});

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user (Admin only)
// @access  Private (Admin only)
router.put('/:id/deactivate', [
  auth,
  requireRole(['admin'])
], async (req, res) => {
  try {
    const userModel = new User(req.db);
    
    // Prevent admin from deactivating themselves
    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }
    
    const deactivatedUser = await userModel.deactivateUser(req.params.id);
    
    if (!deactivatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User deactivated successfully',
      user: deactivatedUser
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Server error while deactivating user' });
  }
});

module.exports = router;
