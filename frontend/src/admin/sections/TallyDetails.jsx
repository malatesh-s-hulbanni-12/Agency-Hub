import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, FiShoppingCart, FiTrendingUp, 
  FiPieChart, FiPercent, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import axios from 'axios';

const TallyDetails = () => {
  const [paymentSlips, setPaymentSlips] = useState([]);
  const [sales, setSales] = useState([]);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch payment slips (buying data)
      const paymentResponse = await api.get('/payment-slips');
      
      // Fetch sales (selling data)
      const salesResponse = await api.get('/sales');
      
      if (paymentResponse.data.success) {
        setPaymentSlips(paymentResponse.data.data);
      }
      
      if (salesResponse.data.success) {
        setSales(salesResponse.data.data);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total investment (from buying)
  const totalInvestment = paymentSlips.reduce((sum, slip) => {
    return sum + (parseFloat(slip.totalAmount) || 0);
  }, 0);

  // Calculate total selling (from sales)
  const totalSelling = sales.reduce((sum, sale) => {
    return sum + (sale.totalAmount || 0);
  }, 0);

  // Calculate total tax (from sales)
  const totalTax = sales.reduce((sum, sale) => {
    return sum + (sale.taxAmount || 0);
  }, 0);

  // Calculate net selling (after removing tax)
  const netSelling = totalSelling - totalTax;

  // Calculate profit/loss (Total Selling - Total Investment)
  const profit = totalSelling - totalInvestment;
  const isProfit = profit >= 0;

  // Calculate profit percentage (using total selling and total investment)
  const profitPercentage = totalInvestment > 0 
    ? ((profit / totalInvestment) * 100).toFixed(2)
    : 0;

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tally data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-50"
    >
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FiPieChart className="text-blue-600" />
          Tally Details
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
          Complete financial overview of your business
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 sm:p-4 bg-red-50 text-red-700 rounded-xl text-sm sm:text-base">
          {error}
        </div>
      )}

      {/* Stats Cards - Four Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Profit/Loss Card - Full width at top */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 text-white col-span-1 sm:col-span-2 lg:col-span-4 ${
            isProfit 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
              : 'bg-gradient-to-r from-red-600 to-rose-600'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                {isProfit ? <FiArrowUp className="text-xl sm:text-2xl" /> : <FiArrowDown className="text-xl sm:text-2xl" />}
              </div>
              <div>
                <p className="text-xs sm:text-sm opacity-90 mb-0.5 sm:mb-1">Total {isProfit ? 'Profit' : 'Loss'}</p>
                <p className="text-2xl sm:text-3xl font-bold">₹{Math.abs(profit).toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 bg-white/20 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl w-full sm:w-auto">
              <FiPercent className="text-xl sm:text-2xl" />
              <div>
                <p className="text-xs opacity-75 mb-0.5">Profit Percentage</p>
                <p className="text-xl sm:text-2xl font-bold">{profitPercentage}%</p>
              </div>
            </div>
          </div>
          
          {/* Summary Line - Shows the calculation */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/20 text-xs sm:text-sm">
            <p className="opacity-90">
              <span className="font-semibold">Calculation:</span> Total Selling (₹{totalSelling.toFixed(2)}) - Total Investment (₹{totalInvestment.toFixed(2)}) = 
              <span className={`font-bold ml-1 ${isProfit ? 'text-white' : 'text-red-200'}`}>
                {isProfit ? 'Profit' : 'Loss'} ₹{Math.abs(profit).toFixed(2)}
              </span>
            </p>
          </div>
        </motion.div>

        {/* Total Investment Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <FiShoppingCart className="text-2xl sm:text-3xl opacity-80" />
            <span className="text-xs bg-white/20 px-2 sm:px-3 py-1 rounded-full">Buying</span>
          </div>
          <p className="text-xs sm:text-sm opacity-90 mb-1">Total Investment</p>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">₹{totalInvestment.toFixed(2)}</p>
          <p className="text-xs opacity-75">{paymentSlips.length} transactions</p>
        </motion.div>

        {/* Total Selling Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <FiTrendingUp className="text-2xl sm:text-3xl opacity-80" />
            <span className="text-xs bg-white/20 px-2 sm:px-3 py-1 rounded-full">Selling</span>
          </div>
          <p className="text-xs sm:text-sm opacity-90 mb-1">Total Selling</p>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">₹{totalSelling.toFixed(2)}</p>
          <p className="text-xs opacity-75">{sales.length} transactions</p>
        </motion.div>

        {/* Total Tax Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <FiDollarSign className="text-2xl sm:text-3xl opacity-80" />
            <span className="text-xs bg-white/20 px-2 sm:px-3 py-1 rounded-full">Tax</span>
          </div>
          <p className="text-xs sm:text-sm opacity-90 mb-1">Total Tax</p>
          <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">₹{totalTax.toFixed(2)}</p>
          <p className="text-xs opacity-75">From {sales.length} sales</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TallyDetails;
