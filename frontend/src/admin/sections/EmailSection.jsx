import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiUser, FiSearch, FiFilter,
  FiChevronLeft, FiChevronRight, FiX,
  FiDownload, FiCopy, FiCheck, FiClock,
  FiCalendar, FiInbox
} from 'react-icons/fi';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const EmailSection = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [copiedId, setCopiedId] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmails: 0,
    verifiedUsers: 0
  });

  // Create axios instance
  const api = axios.create({
    baseURL: 'https://agency-backend-z5fi.onrender.com/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      
      if (response.data.success) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
        calculateStats(response.data.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to connect to server');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userData) => {
    // You can customize this based on your user schema
    const verifiedCount = userData.filter(user => user.verified || user.email).length;
    
    setStats({
      totalUsers: userData.length,
      totalEmails: userData.length, // Assuming each user has one email
      verifiedUsers: verifiedCount
    });
  };

  const filterUsers = () => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId?.toString().includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
    setCurrentPage(1);
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Email copied to clipboard!');
    
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const downloadEmails = () => {
    const emails = filteredUsers.map(user => user.email).filter(email => email);
    const content = emails.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registered-emails-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(`${emails.length} emails downloaded!`);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registered emails...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: '14px' } }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-50"
      >
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiMail className="text-blue-600" />
            Registered Emails
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
            View all registered user email addresses
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 text-red-700 rounded-xl text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUser className="text-blue-600" />
              </div>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FiMail className="text-green-600" />
              </div>
              <p className="text-xs text-gray-500">Total Emails</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.totalEmails}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiInbox className="text-purple-600" />
              </div>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.verifiedUsers}</p>
          </motion.div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 sm:flex-none px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <FiFilter />
                <span>Filters</span>
              </button>
              
              <button
                onClick={downloadEmails}
                className="flex-1 sm:flex-none px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <FiDownload />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t">
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200"
                  >
                    Show All
                  </button>
                  <button
                    onClick={() => {/* Add filter by date */}}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {/* Add filter by week */}}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200"
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => {/* Add filter by month */}}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200"
                  >
                    This Month
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs sm:text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
          </p>
        </div>

        {/* Email Cards - Mobile First */}
        <div className="space-y-3 mb-4">
          {currentItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FiMail className="text-4xl text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No registered emails found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
            </div>
          ) : (
            currentItems.map((user) => (
              <motion.div
                key={user._id || user.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {user.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">ID: {user.userId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(user.email, user._id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative"
                    title="Copy Email"
                  >
                    {copiedId === user._id ? (
                      <FiCheck className="text-green-600" />
                    ) : (
                      <FiCopy />
                    )}
                  </button>
                </div>

                {/* Email Display */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiMail className="text-gray-400" size={14} />
                      <span className="text-sm text-gray-700 break-all">{user.email || 'No email'}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <FiClock size={12} />
                    <span>Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <button
                    onClick={() => viewUserDetails(user)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Details
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiChevronLeft />
            </button>
            
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm transition-colors ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiChevronRight />
            </button>
          </div>
        )}

        {/* User Details Modal */}
        <AnimatePresence>
          {showDetails && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">User Details</h2>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* User Avatar */}
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">User ID</p>
                        <p className="text-sm font-medium">{selectedUser.userId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium">{selectedUser.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium break-all">{selectedUser.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Registered On</p>
                        <p className="text-sm font-medium">
                          {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          copyToClipboard(selectedUser.email, 'modal');
                          toast.success('Email copied!');
                        }}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <FiCopy />
                        Copy Email
                      </button>
                      <button
                        onClick={() => setShowDetails(false)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default EmailSection;
