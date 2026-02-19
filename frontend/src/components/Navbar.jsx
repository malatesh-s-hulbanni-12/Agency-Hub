import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = ({ onAdminClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed w-full z-40 px-4 md:px-8 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-effect rounded-2xl px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AgencyPro
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <motion.a 
                whileHover={{ y: -2 }}
                href="#" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Home
              </motion.a>
              <motion.a 
                whileHover={{ y: -2 }}
                href="#" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Services
              </motion.a>
              <motion.a 
                whileHover={{ y: -2 }}
                href="#" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                About
              </motion.a>
              <motion.a 
                whileHover={{ y: -2 }}
                href="#" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Contact
              </motion.a>
            </div>

            {/* Admin Login Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAdminClick}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">Admin Login</span>
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ opacity: 0.2 }}
              />
            </motion.button>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-2xl text-gray-700"
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex flex-col space-y-3">
                <a href="#" className="text-gray-700 hover:text-blue-600 py-2 transition-colors">Home</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 py-2 transition-colors">Services</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 py-2 transition-colors">About</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 py-2 transition-colors">Contact</a>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;