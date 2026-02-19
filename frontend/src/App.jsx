import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleAdminClick = () => {
    setShowLogin(true);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  const handleLogin = () => {
    setIsAdmin(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  if (isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <>
      <Navbar onAdminClick={handleAdminClick} />
      <Home />
      
      {/* Admin Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseLogin}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            
            {/* Login Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
              <AdminLogin onLogin={handleLogin} onClose={handleCloseLogin} />
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;