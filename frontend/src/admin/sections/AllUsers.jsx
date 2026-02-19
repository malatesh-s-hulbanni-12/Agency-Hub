import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye, 
  FiChevronLeft, FiChevronRight, FiUserPlus, FiRefreshCw,
  FiAlertCircle, FiCheckCircle, FiXCircle, FiUsers,
  FiX, FiUser, FiMail, FiBriefcase, FiCalendar, FiInfo
} from 'react-icons/fi';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const AllUsers = ({ onAddUser }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: '',
    bio: ''
  });
  
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all'
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const usersPerPage = 10;

  // Create axios instance
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters and search when users, searchTerm, or filters change
  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, filters, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/users');
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to fetch users');
      }

      // Transform data
      const transformedUsers = response.data.users.map(user => ({
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        bio: user.bio || 'No bio provided',
        avatar: user.avatar,
        joined: new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }));
      
      setUsers(transformedUsers);
      toast.success(`Loaded ${transformedUsers.length} users`);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'joined') {
        aValue = new Date(a.joined);
        bValue = new Date(b.joined);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle Add User click
  const handleAddUserClick = () => {
    console.log('➕ Navigating to Add User page');
    if (onAddUser) {
      onAddUser();
    }
  };

  // View user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      bio: user.bio === 'No bio provided' ? '' : user.bio
    });
    setShowEditModal(true);
    document.body.style.overflow = 'hidden';
  };

  // Close modals
  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    document.body.style.overflow = 'unset';
  };

  // Update user
  const handleUpdateUser = async () => {
    const updateToast = toast.loading('Updating user...');
    
    try {
      const response = await api.put(`/users/${selectedUser.id}`, editFormData);
      
      if (response.data.success) {
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...editFormData }
            : user
        ));
        
        toast.dismiss(updateToast);
        toast.success('User updated successfully');
        closeModals();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.dismiss(updateToast);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      const deleteToast = toast.loading(`Deleting ${userName}...`);
      
      try {
        const response = await api.delete(`/users/${userId}`);
        
        if (response.data.success) {
          setUsers(users.filter(user => user.id !== userId));
          setSelectedUsers(selectedUsers.filter(id => id !== userId));
          
          toast.dismiss(deleteToast);
          toast.success(`${userName} deleted successfully`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.dismiss(deleteToast);
        toast.error(error.response?.data?.message || `Failed to delete ${userName}`);
      }
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    
    const message = selectedUsers.length === 1 
      ? 'Are you sure you want to delete this user?'
      : `Are you sure you want to delete ${selectedUsers.length} users?`;
    
    if (window.confirm(message)) {
      const bulkDeleteToast = toast.loading(`Deleting ${selectedUsers.length} user(s)...`);
      let successCount = 0;
      let failCount = 0;

      for (const userId of selectedUsers) {
        try {
          await api.delete(`/users/${userId}`);
          successCount++;
        } catch (error) {
          console.error('Error deleting user:', error);
          failCount++;
        }
      }

      setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
      
      toast.dismiss(bulkDeleteToast);
      
      if (failCount === 0) {
        toast.success(`${successCount} user(s) deleted successfully`);
      } else {
        toast.error(`${successCount} deleted, ${failCount} failed`);
      }
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : 'bg-red-100 text-red-700 border-red-200';
  };

  // Get role badge color
  const getRoleColor = (role) => {
    switch(role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Editor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Select all users on current page
  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
  };

  // Select individual user
  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // View Modal Component - Fixed positioning
  const ViewUserModal = () => {
    if (!selectedUser) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={closeModals}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ margin: 'auto' }}
        >
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-white pt-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={24} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Avatar */}
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-4xl font-bold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              {/* User ID */}
              <div className="border-b pb-2 sm:pb-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <FiUser className="mr-2 flex-shrink-0" size={16} />
                  <span className="text-xs sm:text-sm font-medium">User ID</span>
                </div>
                <p className="text-sm sm:text-base text-gray-900 font-mono break-all">{selectedUser.userId}</p>
              </div>
              
              {/* Name */}
              <div className="border-b pb-2 sm:pb-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <FiUser className="mr-2 flex-shrink-0" size={16} />
                  <span className="text-xs sm:text-sm font-medium">Full Name</span>
                </div>
                <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{selectedUser.name}</p>
              </div>
              
              {/* Email */}
              <div className="border-b pb-2 sm:pb-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <FiMail className="mr-2 flex-shrink-0" size={16} />
                  <span className="text-xs sm:text-sm font-medium">Email Address</span>
                </div>
                <p className="text-sm sm:text-base text-gray-900 break-all">{selectedUser.email}</p>
              </div>
              
              {/* Role */}
              <div className="border-b pb-2 sm:pb-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <FiBriefcase className="mr-2 flex-shrink-0" size={16} />
                  <span className="text-xs sm:text-sm font-medium">Role</span>
                </div>
                <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getRoleColor(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </div>
              
              {/* Status */}
              <div className="border-b pb-2 sm:pb-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <FiInfo className="mr-2 flex-shrink-0" size={16} />
                  <span className="text-xs sm:text-sm font-medium">Status</span>
                </div>
                <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(selectedUser.status)}`}>
                  {selectedUser.status}
                </span>
              </div>
              
              {/* Joined Date */}
              <div className="border-b pb-2 sm:pb-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <FiCalendar className="mr-2 flex-shrink-0" size={16} />
                  <span className="text-xs sm:text-sm font-medium">Joined Date</span>
                </div>
                <p className="text-sm sm:text-base text-gray-900">{selectedUser.joined}</p>
              </div>
              
              {/* Bio */}
              <div className="pb-2 sm:pb-3">
                <div className="flex items-center text-gray-600 mb-1">
                  <FiInfo className="mr-2 flex-shrink-0" size={16} />
                  <span className="text-xs sm:text-sm font-medium">Bio</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 sm:p-3 rounded-lg break-words">
                  {selectedUser.bio}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 sticky bottom-0 bg-white pb-2 pt-2">
              <button
                onClick={() => {
                  closeModals();
                  handleEditUser(selectedUser);
                }}
                className="w-full sm:flex-1 py-2 sm:py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Edit User
              </button>
              <button
                onClick={closeModals}
                className="w-full sm:flex-1 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Edit Modal Component - Fixed positioning
  const EditUserModal = () => {
    if (!selectedUser) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={closeModals}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ margin: 'auto' }}
        >
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-white pt-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit User</h2>
              <button
                onClick={closeModals}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={24} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Role */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Role
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="User">User</option>
                  <option value="Editor">Editor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              {/* Bio */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Bio
                </label>
                <textarea
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 sticky bottom-0 bg-white pb-2 pt-2">
              <button
                onClick={handleUpdateUser}
                className="w-full sm:flex-1 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors text-sm sm:text-base"
              >
                Update User
              </button>
              <button
                onClick={closeModals}
                className="w-full sm:flex-1 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Clean up body overflow when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-sm sm:text-base text-gray-600">Loading users from MongoDB...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <FiAlertCircle className="text-red-500 text-4xl sm:text-6xl mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Error Loading Users</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchUsers}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            fontSize: '14px',
            maxWidth: '90vw'
          }
        }} 
      />
      
      {/* Modals */}
      <AnimatePresence>
        {showViewModal && <ViewUserModal />}
        {showEditModal && <EditUserModal />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-50"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">All Users</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found in MongoDB
            </p>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchUsers}
              className="p-2 sm:p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              title="Refresh"
            >
              <FiRefreshCw size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddUserClick}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <FiUserPlus size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Add</span>
            </motion.button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
              <option value="status">Status</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilterModal(!showFilterModal)}
              className="flex items-center justify-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <FiFilter size={16} className="sm:w-5 sm:h-5" />
              <span className="text-sm hidden sm:inline">Filter</span>
            </motion.button>
          </div>
        </div>

        {/* Filter Modal */}
        <AnimatePresence>
          {showFilterModal && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white p-3 sm:p-4 rounded-xl shadow-lg mb-4 sm:mb-6"
            >
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Filter Users</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <FiXCircle size={18} className="text-gray-500" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="User">User</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => {
                    setFilters({ role: 'all', status: 'all' });
                    setShowFilterModal(false);
                  }}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-blue-50 p-3 sm:p-4 rounded-xl mb-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-blue-600 flex-shrink-0" size={16} />
              <span className="text-xs sm:text-sm text-blue-700 font-medium">
                {selectedUsers.length} selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <FiTrash2 size={14} />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}

        {/* Users Table - Desktop */}
        <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="text-gray-400 text-5xl mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">ID</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">Role</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">Joined</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-mono text-gray-600">
                        {user.userId}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-2 sm:ml-3 font-medium text-gray-900 text-xs sm:text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 break-all">{user.email}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{user.joined}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-1 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                            title="View"
                          >
                            <FiEye size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Users Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {currentUsers.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl">
              <FiUsers className="text-gray-400 text-4xl mx-auto mb-3" />
              <p className="text-sm text-gray-600">No users found</p>
            </div>
          ) : (
            currentUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-2 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{user.name}</h3>
                        <span className="text-xs font-mono text-gray-500">{user.userId}</span>
                      </div>
                      <p className="text-xs text-gray-600 break-all">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border inline-block ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border inline-block ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="text-xs text-gray-700">{user.joined}</p>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <button
                    onClick={() => handleViewUser(user)}
                    className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                  >
                    <FiEye size={16} />
                  </button>
                  <button
                    onClick={() => handleEditUser(user)}
                    className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
              Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}
            </p>
            <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-1 sm:p-2 rounded-lg transition-colors ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiChevronLeft size={18} className="sm:w-5 sm:h-5" />
              </button>
              
              <span className="text-xs sm:text-sm px-2 py-1 bg-blue-600 text-white rounded-lg">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-1 sm:p-2 rounded-lg transition-colors ${
                  currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiChevronRight size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default AllUsers;


