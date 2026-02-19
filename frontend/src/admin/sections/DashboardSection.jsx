import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiPackage, FiShoppingBag, FiDollarSign,
  FiShoppingCart, FiTrendingUp, FiFileText,
  FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import axios from 'axios';

const DashboardSection = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalInvestment: 0,
    totalProfit: 0,
    profitPercentage: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create axios instance
  const api = axios.create({
    baseURL: 'https://agency-backend-z5fi.onrender.com/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await api.get('/users');
      
      // Fetch payment slips (buying data)
      const paymentResponse = await api.get('/payment-slips');
      
      // Fetch sales (selling data)
      const salesResponse = await api.get('/sales');
      
      // Fetch items (products)
      const itemsResponse = await api.get('/items');

      const users = usersResponse.data.users || [];
      const paymentSlips = paymentResponse.data.data || [];
      const sales = salesResponse.data.data || [];
      const items = itemsResponse.data.data || [];

      // Calculate totals
      const totalUsers = users.length;
      const totalProducts = items.length;
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      const totalInvestment = paymentSlips.reduce((sum, slip) => sum + (parseFloat(slip.totalAmount) || 0), 0);
      
      // Calculate profit
      const profit = totalRevenue - totalInvestment;
      const profitPercentage = totalInvestment > 0 ? ((profit / totalInvestment) * 100) : 0;

      setStats({
        totalUsers,
        totalProducts,
        totalSales,
        totalRevenue,
        totalInvestment,
        totalProfit: profit,
        profitPercentage
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  const mainStats = [
    { 
      icon: <FiUsers />, 
      label: 'Total Users', 
      value: formatNumber(stats.totalUsers), 
      rawValue: stats.totalUsers,
      color: 'from-blue-600 to-blue-400',
      path: '/admin/all-users'
    },
    { 
      icon: <FiPackage />, 
      label: 'Total Products', 
      value: formatNumber(stats.totalProducts), 
      rawValue: stats.totalProducts,
      color: 'from-purple-600 to-purple-400',
      path: '/admin/list-items'
    },
    { 
      icon: <FiShoppingBag />, 
      label: 'Total Sales', 
      value: formatNumber(stats.totalSales), 
      rawValue: stats.totalSales,
      color: 'from-green-600 to-green-400',
      path: '/admin/selling-details'
    },
    { 
      icon: <FiDollarSign />, 
      label: 'Total Revenue', 
      value: formatCurrency(stats.totalRevenue), 
      rawValue: stats.totalRevenue,
      color: 'from-orange-600 to-orange-400',
      path: '/admin/selling-details'
    },
  ];

  const financialStats = [
    {
      icon: <FiShoppingCart />,
      label: 'Total Investment',
      value: formatCurrency(stats.totalInvestment),
      color: 'from-red-600 to-red-400',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      path: '/admin/total-invest'
    },
    {
      icon: <FiTrendingUp />,
      label: 'Total Profit',
      value: formatCurrency(stats.totalProfit),
      isProfit: stats.totalProfit >= 0,
      color: stats.totalProfit >= 0 ? 'from-green-600 to-green-400' : 'from-red-600 to-red-400',
      bgColor: stats.totalProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
      textColor: stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600',
      path: '/admin/tally-details'
    },
    {
      icon: <FiTrendingUp />,
      label: 'Profit Margin',
      value: stats.profitPercentage.toFixed(1) + '%',
      color: 'from-purple-600 to-purple-400',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      path: '/admin/tally-details'
    },
    {
      icon: <FiFileText />,
      label: 'Total Invoices',
      value: formatNumber(stats.totalSales),
      color: 'from-indigo-600 to-indigo-400',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      path: '/admin/invoices'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-50"
    >
      {/* Welcome Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
          Welcome back! Here's your business summary.
        </p>
      </div>

      {/* Main Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {mainStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -3 }}
            onClick={() => handleNavigation(stat.path)}
            className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center text-white text-lg sm:text-xl mb-2 sm:mb-3`}>
              {stat.icon}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Financial Stats - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {financialStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ y: -3 }}
            onClick={() => handleNavigation(stat.path)}
            className={`${stat.bgColor} rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg cursor-pointer hover:shadow-xl transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white text-sm sm:text-base`}>
                {stat.icon}
              </div>
              {stat.isProfit !== undefined && (
                <span className={`flex items-center gap-0.5 text-xs ${stat.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.isProfit ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-sm sm:text-base lg:text-lg font-bold ${stat.textColor} truncate`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default DashboardSection;
