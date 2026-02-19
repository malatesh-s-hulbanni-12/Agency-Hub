import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDollarSign, FiEye, FiDownload, FiCalendar,
  FiPackage, FiUser, FiFileText, FiImage,
  FiChevronLeft, FiChevronRight, FiX,
  FiShoppingCart, FiTrendingUp
} from 'react-icons/fi';

const TotalInvest = () => {
  const [paymentSlips, setPaymentSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchPaymentSlips();
  }, []);

  const fetchPaymentSlips = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payment-slips');
      const result = await response.json();
      
      if (result.success) {
        setPaymentSlips(result.data);
      } else {
        setError(result.message || 'Error fetching payment slips');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total investment
  const totalInvestment = paymentSlips.reduce((sum, slip) => {
    return sum + (parseFloat(slip.totalAmount) || 0);
  }, 0);

  const viewDetails = (slip) => {
    setSelectedSlip(slip);
    setShowDetails(true);
  };

  const downloadFile = (fileData, fileName) => {
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Sort payment slips by date (newest first)
  const sortedSlips = [...paymentSlips].sort((a, b) => 
    new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedSlips.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedSlips.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading investment data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Total Investment</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Overview of all your purchase investments
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Total Investment Card - Centered */}
      <div className="flex justify-center mb-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center"
        >
          <FiDollarSign className="text-5xl text-white mx-auto mb-4" />
          <p className="text-white text-lg opacity-90 mb-2">Total Amount Invested</p>
          <p className="text-4xl sm:text-5xl font-bold text-white">
            ₹{totalInvestment.toFixed(2)}
          </p>
          <p className="text-white text-sm opacity-75 mt-4">
            Total Transactions: {paymentSlips.length}
          </p>
        </motion.div>
      </div>

      {/* Payment Slips Section */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiShoppingCart className="text-blue-600" />
          Payment Slips History
        </h2>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedSlips.length)} of {sortedSlips.length} slips
          </p>
        </div>

        {/* Payment Slips Cards */}
        <div className="space-y-3">
          {currentItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FiPackage className="text-4xl text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No payment slips found</p>
            </div>
          ) : (
            currentItems.map((slip, index) => (
              <motion.div
                key={slip._id || slip.orderId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-4"
              >
                {/* Mobile Optimized Card */}
                <div className="block">
                  {/* Header with Date and Order ID */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {slip.orderId}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(slip.status)}`}>
                          {slip.status || 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FiCalendar size={12} />
                        {new Date(slip.createdAt || slip.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Product and Amount Info */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Product</p>
                      <p className="font-medium text-gray-900">{slip.productName}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="font-semibold text-green-600">₹{slip.totalAmount}</p>
                    </div>
                  </div>

                  {/* Seller and Buyer Info */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <FiUser size={10} />
                        Seller
                      </p>
                      <p className="font-medium text-sm truncate">{slip.sellerName}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <FiUser size={10} />
                        Buyer
                      </p>
                      <p className="font-medium text-sm truncate">{slip.buyerName}</p>
                    </div>
                  </div>

                  {/* Quantity and Pieces Info */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Packets</p>
                      <p className="font-medium text-sm">{slip.quantity}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Pieces</p>
                      <p className="font-medium text-sm">{slip.totalPieces}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Price/Pc</p>
                      <p className="font-medium text-sm">₹{slip.pricePerPiece}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <button
                      onClick={() => viewDetails(slip)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FiEye size={18} />
                    </button>
                    {slip.fileData && (
                      <button
                        onClick={() => downloadFile(slip.fileData, slip.fileName)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download Payment Slip"
                      >
                        <FiDownload size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
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
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
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
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && selectedSlip && (
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
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Slip Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Order Info */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-sm font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {selectedSlip.orderId}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${getStatusColor(selectedSlip.status)}`}>
                        {selectedSlip.status || 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <FiCalendar />
                      {new Date(selectedSlip.createdAt || selectedSlip.date).toLocaleString()}
                    </p>
                  </div>

                  {/* Payment Slip */}
                  {selectedSlip.fileData && (
                    <div className="border rounded-xl p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        {selectedSlip.fileType?.startsWith('image/') ? <FiImage /> : <FiFileText />}
                        Payment Slip
                      </h3>
                      {selectedSlip.fileType?.startsWith('image/') ? (
                        <img 
                          src={selectedSlip.fileData} 
                          alt="Payment Slip" 
                          className="max-w-full h-auto max-h-64 rounded-lg mx-auto"
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{selectedSlip.fileName}</span>
                          <button
                            onClick={() => downloadFile(selectedSlip.fileData, selectedSlip.fileName)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                          >
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FiUser />
                        Seller Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">Type:</span> {selectedSlip.sellerType}</p>
                        <p><span className="text-gray-500">Name:</span> {selectedSlip.sellerName}</p>
                        <p><span className="text-gray-500">Product:</span> {selectedSlip.productName}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FiUser />
                        Buyer Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">Name:</span> {selectedSlip.buyerName}</p>
                        <p><span className="text-gray-500">Phone:</span> {selectedSlip.phoneNumber}</p>
                        <p><span className="text-gray-500">Address:</span> {selectedSlip.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FiPackage />
                      Purchase Details
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Packets</p>
                        <p className="font-medium">{selectedSlip.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Price/Packet</p>
                        <p className="font-medium">₹{selectedSlip.pricePerPacket}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pieces/Packet</p>
                        <p className="font-medium">{selectedSlip.piecesPerPacket}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Pieces</p>
                        <p className="font-medium">{selectedSlip.totalPieces}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Price/Piece</p>
                        <p className="font-medium">₹{selectedSlip.pricePerPiece}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="font-medium text-lg text-green-600">₹{selectedSlip.totalAmount}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDetails(false)}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TotalInvest;