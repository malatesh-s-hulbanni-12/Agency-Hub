import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import AdminNavbar from './AdminNavbar';

// Import section components
import DashboardSection from './sections/DashboardSection';
import AllUsers from './sections/AllUsers';
import AddUser from './sections/AddUser';

// Buying sections
import ProductBuying from './sections/ProductBuying';
import BuyingDetails from './sections/BuyingDetails';
import TotalInvest from './sections/TotalInvest';

// Selling sections
import ProductSell from './sections/ProductSell';
import SellingDetails from './sections/SellingDetails';

// Add Products sections
import AddItem from './sections/AddItem';
import ListItems from './sections/ListItems';

// Other sections
import Invoices from './sections/Invoices';
import TallyDetails from './sections/TallyDetails';
import EmailSection from './sections/EmailSection';
import CalendarSection from './sections/CalendarSection';

const AdminDashboard = ({ onLogout }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const handleMobileMenuClick = () => {
    setMobileSidebarOpen(true);
  };

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  // Render active section
  const renderSection = () => {
    switch(activeSection) {
      // Dashboard
      case 'dashboard':
        return <DashboardSection />;
      
      // Users
      case 'all-users':
        return <AllUsers />;
      case 'add-user':
        return <AddUser onBack={() => setActiveSection('users')} />;
      
      // Buying
      case 'product-buying':
        return <ProductBuying />;
      case 'buying-details':
        return <BuyingDetails />;
      case 'total-invest':
        return <TotalInvest />;
      
      // Selling
      case 'product-sell':
        return <ProductSell />;
      case 'selling-details':
        return <SellingDetails />;
      
      // Add Products
      case 'add-item':
        return <AddItem />;
      case 'list-items':
        return <ListItems />;
      
      // Invoices
      case 'invoices':
        return <Invoices />;
      
      // Tally Details
      case 'tally-details':
        return <TallyDetails />;
      
      // Email
      case 'email':
        return <EmailSection />;
      
      // Calendar
      case 'calendar':
        return <CalendarSection />;
      
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={toggleSidebar}
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
        isMobile={isMobile}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={handleMobileSidebarClose}
      />

      <AdminNavbar 
        onLogout={onLogout}
        toggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
        onMobileMenuClick={handleMobileMenuClick}
      />

      {/* Main Content */}
      <main 
        className="pt-16 sm:pt-20 p-4 sm:p-6 transition-all duration-300"
        style={{ 
          marginLeft: !isMobile 
            ? (isSidebarCollapsed ? '80px' : '280px') 
            : '0px'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;