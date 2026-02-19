import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiUsers, FiSettings, 
  FiMail, FiCalendar, 
  FiChevronLeft, FiChevronRight,
  FiFileText, FiMessageSquare, FiX,
  FiShoppingCart, FiTrendingUp, FiDollarSign,
  FiPieChart, FiPackage
} from 'react-icons/fi';

const Sidebar = ({ 
  isCollapsed, 
  toggleSidebar, 
  activeSection, 
  setActiveSection,
  isMobile,
  mobileOpen,
  onMobileClose 
}) => {
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    { 
      icon: <FiHome />, 
      label: 'Dashboard',
      section: 'dashboard'
    },
    { 
      icon: <FiUsers />, 
      label: 'Users',
      section: 'users',
      subItems: [
        { label: 'All Users', section: 'all-users' },
        { label: 'Add User', section: 'add-user' }
      ]
    },
    { 
      icon: <FiShoppingCart />, 
      label: 'Buying',
      section: 'buying',
      subItems: [
        { label: 'Product Buying', section: 'product-buying' },
        { label: 'Buying Details', section: 'buying-details' },
        { label: 'Total Invest', section: 'total-invest' }
      ]
    },
    { 
      icon: <FiTrendingUp />, 
      label: 'Selling',
      section: 'selling',
      subItems: [
        { label: 'Product Sell', section: 'product-sell' },
        { label: 'Selling Details', section: 'selling-details' }
      ]
    },
    { 
      icon: <FiPackage />, 
      label: 'Add Products',
      section: 'add-products',
      subItems: [
        { label: 'Add Item', section: 'add-item' },
        { label: 'List Items', section: 'list-items' }
      ]
    },
    { 
      icon: <FiDollarSign />, 
      label: 'Invoices',
      section: 'invoices'
    },
    { 
      icon: <FiPieChart />, 
      label: 'Tally Details',
      section: 'tally-details'
    },
    { 
      icon: <FiMail />, 
      label: 'Email',
      section: 'email'
    },
    { 
      icon: <FiCalendar />, 
      label: 'Calendar',
      section: 'calendar'
    }
  ];

  const toggleExpand = (section) => {
    setExpandedItems(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMenuItemClick = (section) => {
    setActiveSection(section);
    if (isMobile) {
      onMobileClose();
    }
  };

  // Check if a parent item should be highlighted (if any of its sub-items are active)
  const isItemActive = (item) => {
    if (!item.subItems) {
      return activeSection === item.section;
    }
    // For items with subItems, highlight if the exact section matches OR any sub-item is active
    return activeSection === item.section || 
           item.subItems.some(subItem => {
             if (typeof subItem === 'string') {
               return false; // Handle string subItems if needed
             }
             return activeSection === subItem.section;
           });
  };

  // Mobile Sidebar
  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-4">
                {/* Header with close button */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <span className="font-bold text-base">Admin Panel</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onMobileClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </motion.button>
                </div>

                {/* Menu Items */}
                <nav className="space-y-1">
                  {menuItems.map((item, index) => (
                    <div key={index}>
                      <motion.div
                        whileHover={{ x: 5 }}
                        onClick={() => {
                          if (!item.subItems) {
                            handleMenuItemClick(item.section);
                          }
                          toggleExpand(item.section);
                        }}
                        className={`px-3 py-2.5 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-300
                          ${isItemActive(item)
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`text-xl ${isItemActive(item) ? 'text-white' : 'text-gray-600'}`}>
                              {item.icon}
                            </span>
                            <span className="whitespace-nowrap font-medium text-sm">
                              {item.label}
                            </span>
                          </div>
                          {item.subItems && (
                            <motion.span
                              animate={{ rotate: expandedItems[item.section] ? 180 : 0 }}
                              className="text-xs"
                            >
                              ▼
                            </motion.span>
                          )}
                        </div>
                      </motion.div>

                      {/* Sub Items */}
                      <AnimatePresence>
                        {expandedItems[item.section] && item.subItems && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-11 mt-1 space-y-1 overflow-hidden"
                          >
                            {item.subItems.map((subItem, subIndex) => (
                              <motion.div
                                key={subIndex}
                                whileHover={{ x: 5 }}
                                onClick={() => {
                                  if (typeof subItem === 'string') {
                                    handleMenuItemClick(`${item.section}-${subIndex}`);
                                  } else {
                                    handleMenuItemClick(subItem.section);
                                  }
                                }}
                                className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-all duration-300
                                  ${activeSection === (typeof subItem === 'string' ? `${item.section}-${subIndex}` : subItem.section)
                                    ? 'bg-blue-100 text-blue-600 font-medium'
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                  }`}
                              >
                                {typeof subItem === 'string' ? subItem : subItem.label}
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Sidebar
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      className="h-screen bg-white shadow-2xl fixed left-0 top-0 z-40 overflow-hidden hidden lg:block"
    >
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-base">Admin Panel</span>
            </motion.div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                <motion.div
                  whileHover={{ x: 5 }}
                  onClick={() => {
                    if (!item.subItems) {
                      handleMenuItemClick(item.section);
                    }
                    if (item.subItems && !isCollapsed) {
                      toggleExpand(item.section);
                    }
                  }}
                  className={`px-3 py-2.5 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-300
                    ${isItemActive(item)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`text-xl ${isItemActive(item) ? 'text-white' : 'text-gray-600'}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="whitespace-nowrap font-medium text-sm">
                          {item.label}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && item.subItems && (
                      <motion.span
                        animate={{ rotate: expandedItems[item.section] ? 180 : 0 }}
                        className="text-xs"
                      >
                        ▼
                      </motion.span>
                    )}
                  </div>
                </motion.div>

                {/* Sub Items */}
                {!isCollapsed && expandedItems[item.section] && item.subItems && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-11 mt-1 space-y-1 overflow-hidden"
                  >
                    {item.subItems.map((subItem, subIndex) => (
                      <motion.div
                        key={subIndex}
                        whileHover={{ x: 5 }}
                        onClick={() => {
                          if (typeof subItem === 'string') {
                            handleMenuItemClick(`${item.section}-${subIndex}`);
                          } else {
                            handleMenuItemClick(subItem.section);
                          }
                        }}
                        className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-all duration-300
                          ${activeSection === (typeof subItem === 'string' ? `${item.section}-${subIndex}` : subItem.section)
                            ? 'bg-blue-100 text-blue-600 font-medium'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                      >
                        {typeof subItem === 'string' ? subItem : subItem.label}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;