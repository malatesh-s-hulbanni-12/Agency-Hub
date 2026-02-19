const User = require('../models/User.model');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, status, bio } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'User',
      status: status || 'Active',
      bio: bio || ''
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, status, bio } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users with optional filters
// @route   GET /api/users
// @access  Public (now)
exports.getUsers = async (req, res) => {
  try {
    const { userId, name, email } = req.query;
    let query = {};
    
    // Add filters based on query parameters
    if (userId) {
      // If searching by userId (the auto-incremented number)
      query.userId = parseInt(userId);
    }
    
    if (name) {
      // Case-insensitive partial name search
      query.name = { $regex: name, $options: 'i' };
    }
    
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }
    
    console.log('Search query:', query); // Debug log
    
    const users = await User.find(query).select('-password');
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload avatar
// @route   POST /api/users/:id/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    // Note: You'll need multer for file upload
    // This is a simplified version
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Here you would handle file upload to cloud storage (Cloudinary, AWS S3, etc.)
    // and save the URL to user.avatar
    
    res.json({
      success: true,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};