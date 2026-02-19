import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiEye, FiShoppingBag, FiDollarSign } from 'react-icons/fi';

const DashboardSection = () => {
  const stats = [
    { icon: <FiUsers />, label: 'Total Users', value: '10,482', change: '+12%', color: 'from-blue-600 to-blue-400' },
    { icon: <FiEye />, label: 'Page Views', value: '254.3K', change: '+8%', color: 'from-purple-600 to-purple-400' },
    { icon: <FiShoppingBag />, label: 'Orders', value: '3,240', change: '+23%', color: 'from-green-600 to-green-400' },
    { icon: <FiDollarSign />, label: 'Revenue', value: '$54.2K', change: '+18%', color: 'from-orange-600 to-orange-400' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-white text-2xl mb-4`}>
              {stat.icon}
            </div>
            <p className="text-gray-600">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">{stat.value}</p>
              <span className="text-green-500 text-sm">{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-semibold">New user registered</p>
                  <p className="text-sm text-gray-500">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {['Add User', 'Create Post', 'View Reports', 'Settings'].map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all"
              >
                {action}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardSection;