import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';

const AdminNavbar = ({ onLogout, toggleSidebar, isSidebarCollapsed, onMobileMenuClick }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuClick = () => {
    if (isMobile) {
      // On mobile, call the mobile menu click handler
      onMobileMenuClick();
    } else {
      // On desktop, toggle sidebar collapse
      toggleSidebar();
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 right-0 left-0 bg-white shadow-lg z-40"
      style={{ 
        marginLeft: !isMobile && isSidebarCollapsed ? '80px' : !isMobile ? '280px' : '0px',
        transition: 'margin-left 0.3s ease-in-out',
        width: !isMobile ? 'auto' : '100%'
      }}
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Menu Toggle Button - Visible on all screens */}
          <button
            onClick={handleMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <FiMenu className="text-xl sm:text-2xl" />
          </button>
          
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate max-w-[150px] sm:max-w-none">
            {isMobile ? 'Admin' : 'Admin Dashboard'}
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Profile */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
          >
            <FiUser className="text-lg sm:text-xl" />
          </motion.button>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
          >
            <FiLogOut className="text-sm sm:text-base" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default AdminNavbar;