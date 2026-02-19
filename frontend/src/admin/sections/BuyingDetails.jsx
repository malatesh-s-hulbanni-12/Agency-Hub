import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiEye, FiDownload, 
  FiCalendar, FiUser, FiPackage, FiDollarSign,
  FiShoppingCart, FiTrendingUp, FiPieChart,
  FiChevronLeft, FiChevronRight, FiX,
  FiFileText, FiImage, FiEdit2, FiTrash2,
  FiSave, FiUpload, FiList, FiPrinter
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BuyingDetails = () => {
  const [paymentSlips, setPaymentSlips] = useState([]);
  const [filteredSlips, setFilteredSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [editFormData, setEditFormData] = useState({
    sellerType: 'factory',
    sellerName: '',
    productName: '',
    quantity: '',
    pricePerPacket: '',
    piecesPerPacket: '',
    buyerName: '',
    phoneNumber: '',
    address: ''
  });
  const [editPaymentSlip, setEditPaymentSlip] = useState({
    file: null,
    fileName: '',
    fileType: '',
    fileSize: 0,
    fileData: '',
    preview: null
  });

  useEffect(() => {
    fetchPaymentSlips();
  }, []);

  useEffect(() => {
    filterAndSearchData();
  }, [searchTerm, filterType, dateRange, paymentSlips]);

  const fetchPaymentSlips = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payment-slips');
      const result = await response.json();
      
      if (result.success) {
        setPaymentSlips(result.data);
        setFilteredSlips(result.data);
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

  const filterAndSearchData = () => {
    let filtered = [...paymentSlips];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(slip => 
        slip.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.sellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filter type
    if (filterType !== 'all') {
      filtered = filtered.filter(slip => 
        filterType === 'factory' ? slip.sellerType === 'factory' :
        filterType === 'agent' ? slip.sellerType === 'agent' :
        filterType === 'high-value' ? parseFloat(slip.totalAmount) > 10000 :
        filterType === 'recent' ? new Date(slip.createdAt || slip.date) > new Date(Date.now() - 7*24*60*60*1000) : true
      );
    }

    // Apply date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(slip => {
        const slipDate = new Date(slip.createdAt || slip.date);
        return slipDate >= new Date(dateRange.start) && slipDate <= new Date(dateRange.end);
      });
    }

    setFilteredSlips(filtered);
    setCurrentPage(1);
  };

  // Get unique products with their details
  const getProductsList = () => {
    const productsMap = new Map();
    
    paymentSlips.forEach(slip => {
      const key = `${slip.productName}-${slip.pricePerPiece}`;
      if (!productsMap.has(key)) {
        productsMap.set(key, {
          productName: slip.productName,
          pricePerPiece: slip.pricePerPiece,
          totalQuantity: 0,
          totalPieces: 0,
          totalAmount: 0,
          count: 0
        });
      }
      
      const product = productsMap.get(key);
      product.totalQuantity += parseFloat(slip.quantity) || 0;
      product.totalPieces += parseFloat(slip.totalPieces) || 0;
      product.totalAmount += parseFloat(slip.totalAmount) || 0;
      product.count += 1;
    });

    return Array.from(productsMap.values());
  };

  const downloadProductsPDF = () => {
    const products = getProductsList();
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Products List with Details', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Total Products: ${products.length}`, 14, 38);
    
    // Create table with reordered columns
    const tableColumn = [
      "Product Name", 
      "Price Per Piece (₹)", 
      "Total Packets", 
      "Total Pieces", 
      "Total Amount (₹)", 
      "No. of Purchases"
    ];
    const tableRows = [];
    
    products.forEach(product => {
      const productData = [
        product.productName,
        `₹${parseFloat(product.pricePerPiece).toFixed(2)}`,
        `${product.totalQuantity}`,
        `${product.totalPieces}`,
        `₹${product.totalAmount.toFixed(2)}`,
        product.count.toString()
      ];
      tableRows.push(productData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] }
    });
    
    doc.save(`products-list-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const viewDetails = (slip) => {
    setSelectedSlip(slip);
    setShowDetails(true);
  };

  const handleEdit = (slip) => {
    setSelectedSlip(slip);
    setEditFormData({
      sellerType: slip.sellerType || 'factory',
      sellerName: slip.sellerName || '',
      productName: slip.productName || '',
      quantity: slip.quantity || '',
      pricePerPacket: slip.pricePerPacket || '',
      piecesPerPacket: slip.piecesPerPacket || '',
      buyerName: slip.buyerName || '',
      phoneNumber: slip.phoneNumber || '',
      address: slip.address || ''
    });
    setEditPaymentSlip({
      file: null,
      fileName: slip.fileName || '',
      fileType: slip.fileType || '',
      fileSize: slip.fileSize || 0,
      fileData: slip.fileData || '',
      preview: slip.fileData?.startsWith('data:image/') ? slip.fileData : null
    });
    setShowEditModal(true);
  };

  const handleDelete = (slip) => {
    setSelectedSlip(slip);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/payment-slips/${selectedSlip.orderId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPaymentSlips(paymentSlips.filter(slip => slip.orderId !== selectedSlip.orderId));
        setShowDeleteConfirm(false);
        setSelectedSlip(null);
        setError('');
      } else {
        setError(result.message || 'Error deleting record');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to delete record');
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, GIF images and PDF files are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setEditPaymentSlip({
        file: file,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: base64String,
        preview: file.type.startsWith('image/') ? base64String : null
      });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const removeEditFile = () => {
    setEditPaymentSlip({
      file: null,
      fileName: '',
      fileType: '',
      fileSize: 0,
      fileData: '',
      preview: null
    });
  };

  const saveEdit = async () => {
    try {
      const quantity = parseFloat(editFormData.quantity) || 0;
      const pricePerPacket = parseFloat(editFormData.pricePerPacket) || 0;
      const piecesPerPacket = parseFloat(editFormData.piecesPerPacket) || 0;

      const totalPieces = (quantity * piecesPerPacket).toFixed(2);
      const totalAmount = (quantity * pricePerPacket).toFixed(2);
      const pricePerPiece = piecesPerPacket > 0 ? (pricePerPacket / piecesPerPacket).toFixed(2) : 0;

      const updatedData = {
        ...editFormData,
        ...editPaymentSlip,
        orderId: selectedSlip.orderId,
        totalPieces,
        totalAmount,
        pricePerPiece,
        date: selectedSlip.date
      };

      const response = await fetch(`http://localhost:5000/api/payment-slips/${selectedSlip.orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        const updatedSlips = paymentSlips.map(slip => 
          slip.orderId === selectedSlip.orderId ? result.data : slip
        );
        setPaymentSlips(updatedSlips);
        setShowEditModal(false);
        setSelectedSlip(null);
        setError('');
      } else {
        setError(result.message || 'Error updating record');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to update record');
    }
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSlips.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSlips.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading buying details...</p>
        </div>
      </div>
    );
  }

  const products = getProductsList();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Buying Details</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          View and manage all your purchase records
        </p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl"
        >
          {error}
        </motion.div>
      )}

      {/* Get Products Button */}
      <div className="mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowProductsModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <FiList />
          Get Products
        </motion.button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Buyer, Seller, or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <FiFilter />
            <span className="text-sm">Filters</span>
          </button>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="factory">Factory</option>
                    <option value="agent">Agent</option>
                    <option value="high-value">High Value (&gt; ₹10,000)</option>
                    <option value="recent">Last 7 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSlips.length)} of {filteredSlips.length} records
        </p>
      </div>

      {/* Cards Grid - Mobile & Desktop */}
      <div className="space-y-3">
        {currentItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FiPackage className="text-4xl text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No buying records found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
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
              {/* Mobile View - Optimized */}
              <div className="block">
                {/* Header with Order ID and Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {slip.orderId}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(slip.status)}`}>
                        {slip.status || 'Pending'}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FiCalendar size={12} />
                        {new Date(slip.createdAt || slip.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base">{slip.productName}</h3>
                  </div>
                </div>

                {/* Details Grid - 2 Columns */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Seller</p>
                    <p className="font-medium text-sm text-gray-900 truncate">{slip.sellerName}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Buyer</p>
                    <p className="font-medium text-sm text-gray-900 truncate">{slip.buyerName}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Packets</p>
                    <p className="font-medium text-sm">{slip.quantity}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Pieces/Packet</p>
                    <p className="font-medium text-sm">{slip.piecesPerPacket}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Total Pieces</p>
                    <p className="font-medium text-sm">{slip.totalPieces}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-medium text-sm text-green-600">₹{slip.totalAmount}</p>
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
                  <button
                    onClick={() => handleEdit(slip)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(slip)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                  {slip.fileData && (
                    <button
                      onClick={() => downloadFile(slip.fileData, slip.fileName)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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

      {/* Products Modal */}
      <AnimatePresence>
        {showProductsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowProductsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Products List</h2>
                    <p className="text-sm text-gray-600 mt-1">Products with their details</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadProductsPDF}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <FiPrinter size={20} />
                    </button>
                    <button
                      onClick={() => setShowProductsModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>

                {/* Products Table - Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Price Per Piece (₹)</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total Packets</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total Pieces</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total Amount (₹)</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Purchases</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.productName}</td>
                          <td className="px-4 py-3 text-sm text-blue-600 font-semibold">₹{parseFloat(product.pricePerPiece).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.totalQuantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.totalPieces}</td>
                          <td className="px-4 py-3 text-sm text-green-600 font-semibold">₹{product.totalAmount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Products Cards - Mobile */}
                <div className="sm:hidden space-y-3">
                  {products.map((product, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{product.productName}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Price/Piece</p>
                          <p className="font-medium text-blue-600">₹{parseFloat(product.pricePerPiece).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Packets</p>
                          <p className="font-medium">{product.totalQuantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Pieces</p>
                          <p className="font-medium">{product.totalPieces}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Amount</p>
                          <p className="font-medium text-green-600">₹{product.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Purchases</p>
                          <p className="font-medium">{product.count}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Total Unique Products:</span> {products.length}
                  </p>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowProductsModal(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Purchase Details</h2>
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

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedSlip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Purchase</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Seller Details */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold mb-3">Seller Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Type</label>
                        <select
                          name="sellerType"
                          value={editFormData.sellerType}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="factory">Factory</option>
                          <option value="agent">Agent</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Name</label>
                        <input
                          type="text"
                          name="sellerName"
                          value={editFormData.sellerName}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Product</label>
                        <input
                          type="text"
                          name="productName"
                          value={editFormData.productName}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Purchase Details */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold mb-3">Purchase Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Packets</label>
                        <input
                          type="number"
                          name="quantity"
                          value={editFormData.quantity}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Price/Packet</label>
                        <input
                          type="number"
                          name="pricePerPacket"
                          value={editFormData.pricePerPacket}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Pieces/Packet</label>
                        <input
                          type="number"
                          name="piecesPerPacket"
                          value={editFormData.piecesPerPacket}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Slip */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold mb-3">Payment Slip</h3>
                    {!editPaymentSlip.fileData ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          id="editPaymentSlip"
                          accept=".jpg,.jpeg,.png,.gif,.pdf"
                          onChange={handleEditFileUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="editPaymentSlip"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <FiUpload className="text-2xl text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Click to upload new slip</span>
                        </label>
                      </div>
                    ) : (
                      <div className="bg-white p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {editPaymentSlip.fileType?.startsWith('image/') ? (
                              <FiImage className="text-blue-600" />
                            ) : (
                              <FiFileText className="text-red-600" />
                            )}
                            <span className="text-sm truncate max-w-[150px]">{editPaymentSlip.fileName}</span>
                          </div>
                          <button
                            onClick={removeEditFile}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                        {editPaymentSlip.preview && (
                          <img
                            src={editPaymentSlip.preview}
                            alt="Preview"
                            className="mt-2 max-h-20 rounded"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Buyer Details */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold mb-3">Buyer Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Name</label>
                        <input
                          type="text"
                          name="buyerName"
                          value={editFormData.buyerName}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Phone</label>
                        <input
                          type="text"
                          name="phoneNumber"
                          value={editFormData.phoneNumber}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Address</label>
                        <textarea
                          name="address"
                          value={editFormData.address}
                          onChange={handleEditInputChange}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={saveEdit}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FiSave />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedSlip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 className="text-2xl text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Record</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this record? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
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

export default BuyingDetails;