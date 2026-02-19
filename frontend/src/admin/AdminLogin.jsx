import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiX } from 'react-icons/fi';

const AdminLogin = ({ onLogin, onClose }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Get credentials from environment variables
  const VALID_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@agency.com';
  const VALID_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (credentials.email === VALID_EMAIL && credentials.password === VALID_PASSWORD) {
      onLogin();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="w-full max-w-md relative"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute -top-12 right-0 text-white hover:text-gray-200 transition-colors"
      >
        <FiX size={24} />
      </button>

      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <motion.h2 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Admin Login
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Login
          </motion.button>
        </form>

        {/* Hide demo credentials in production */}
        {import.meta.env.DEV && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Demo: {VALID_EMAIL} / {VALID_PASSWORD}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default AdminLogin;