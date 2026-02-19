const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['User', 'Editor', 'Admin'],
    default: 'User'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: null
  },
  avatarPublicId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate userId BEFORE validation
userSchema.pre('validate', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  try {
    // Find the highest userId and increment by 1
    const lastUser = await this.constructor.findOne({}, { userId: 1 }).sort({ userId: -1 });
    this.userId = lastUser ? lastUser.userId + 1 : 1;
    console.log('Generated userId:', this.userId); // Debug log
    next();
  } catch (error) {
    console.error('Error generating userId:', error);
    next(error);
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully'); // Debug log
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);