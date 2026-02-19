import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiBriefcase, FiCamera, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; // Import toast

const AddUser = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
    status: 'Active',
    bio: ''
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      
      // Show loading toast
      const loadingToast = toast.loading('Creating user...');
      
      try {
        // Use the PUBLIC registration endpoint (no token needed)
        const response = await axios.post(
          'http://localhost:5000/api/auth/register',
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            status: formData.status,
            bio: formData.bio
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('User created successfully:', response.data);
        
        // Dismiss loading toast and show success toast
        toast.dismiss(loadingToast);
        toast.success(
          <div>
            <strong>User Created Successfully!</strong>
            <p className="text-sm">Email: {formData.email}</p>
            <p className="text-xs mt-1">Password has been hashed in MongoDB</p>
          </div>,
          {
            duration: 5000,
            icon: '✅',
            style: {
              background: '#10b981',
              color: '#fff',
            },
          }
        );
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'User',
          status: 'Active',
          bio: ''
        });
        setAvatar(null);
        setAvatarPreview(null);
        
        // Call onSuccess if provided
        if (onSuccess) {
          onSuccess(response.data.user);
        }
        
        // Go back after 2 seconds
        setTimeout(() => {
          if (onBack) {
            onBack();
          }
        }, 2000);
        
      } catch (error) {
        console.error('Error creating user:', error);
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        if (error.response) {
          // Check if it's a duplicate email error (User already exists)
          if (error.response.status === 400 && 
              (error.response.data?.message === 'User already exists' || 
               error.response.data?.message?.includes('already exists'))) {
            
            // Show specific toast for existing email
            toast.error(
              <div>
                <strong>Email Already Exists!</strong>
                <p className="text-sm">"{formData.email}" is already registered.</p>
                <p className="text-xs mt-1">Please use a different email or try logging in.</p>
              </div>,
              {
                duration: 6000,
                icon: '📧',
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
              }
            );
            
            // Also set server error for the form
            setServerError(`User with email "${formData.email}" already exists. Please use a different email.`);
            
          } else {
            // Show general error toast
            toast.error(
              <div>
                <strong>Registration Failed</strong>
                <p className="text-sm">{error.response.data?.message || 'Something went wrong'}</p>
              </div>,
              {
                duration: 4000,
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
              }
            );
            
            setServerError(error.response.data?.message || 'Failed to create user. Please try again.');
          }
        } else if (error.request) {
          // Network error
          toast.error(
            <div>
              <strong>Network Error</strong>
              <p className="text-sm">Cannot connect to server. Please check if server is running.</p>
            </div>,
            {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            }
          );
          
          setServerError('No response from server. Please check if server is running.');
        } else {
          // Other errors
          toast.error(
            <div>
              <strong>Error</strong>
              <p className="text-sm">{error.message || 'Something went wrong'}</p>
            </div>,
            {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            }
          );
          
          setServerError('Error setting up request. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Show validation errors via toast
      const errorMessages = Object.values(newErrors).join(', ');
      toast.error(
        <div>
          <strong>Validation Error</strong>
          <p className="text-sm">{errorMessages}</p>
        </div>,
        {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        }
      );
    }
  };

  return (
    <>
      {/* Toaster component for notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          // Default options
          className: '',
          duration: 4000,
          style: {
            borderRadius: '10px',
            padding: '16px',
            fontFamily: 'sans-serif',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
          loading: {
            style: {
              background: '#3b82f6',
              color: '#fff',
            },
          },
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 min-h-screen bg-gray-50"
      >
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <FiArrowLeft size={24} />
            </motion.button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New User</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Create a new user account (Public Registration)</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
            
            {/* Error Message (still keep for form display) */}
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{serverError}</p>
              </div>
            )}
            
            {/* Avatar Upload - Optional */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-white text-4xl sm:text-5xl" />
                  )}
                </div>
                <motion.label
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  aria-label="Upload avatar"
                >
                  <FiCamera className="text-gray-600" />
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </motion.label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Click the camera icon to upload avatar (optional)
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter full name"
                    disabled={loading}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter email address"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.password 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter password (min 6 characters)"
                    disabled={loading}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Confirm password"
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Role and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      disabled={loading}
                    >
                      <option value="User">User</option>
                      <option value="Editor">Editor</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    disabled={loading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter user bio (optional)"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                    loading 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:shadow-xl'
                  }`}
                >
                  {loading ? 'Creating...' : 'Create User'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  type="button"
                  onClick={onBack}
                  disabled={loading}
                  className={`flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold transition-colors ${
                    loading 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </div>
        </form>

        {/* Debug Info */}
        <div className="max-w-3xl mx-auto mt-6 p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> When you create a user, the password will be hashed in MongoDB.
            Check your MongoDB database to see the hashed password!
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default AddUser;