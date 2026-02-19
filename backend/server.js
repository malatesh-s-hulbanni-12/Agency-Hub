const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const paymentSlipRoutes = require('./routes/paymentSlipRoutes');
const itemRoutes = require('./routes/itemRoutes'); // ADD THIS LINE
const errorHandler = require('./middleware/errorHandler');
const saleRoutes = require('./routes/saleRoutes'); // ADD THIS LINE

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Increase limit for base64 data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/payment-slips', paymentSlipRoutes);
app.use('/api/items', itemRoutes); // ADD THIS LINE
app.use('/api/sales', saleRoutes); // ADD THIS LINE

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});