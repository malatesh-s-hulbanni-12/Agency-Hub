import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDollarSign, FiCalendar, FiUser, FiPackage,
  FiFileText, FiDownload, FiEye, FiX,
  FiChevronLeft, FiChevronRight, FiFilter,
  FiSearch, FiPrinter
} from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const SellingDetails = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalTax: 0,
    averageSaleValue: 0
  });

  // Create axios instance
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [searchTerm, dateRange, sales]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales');
      
      if (response.data.success) {
        setSales(response.data.data);
        setFilteredSales(response.data.data);
        calculateStats(response.data.data);
      } else {
        setError('Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (salesData) => {
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalTax = salesData.reduce((sum, sale) => sum + sale.taxAmount, 0);
    const averageSaleValue = salesData.length > 0 ? totalRevenue / salesData.length : 0;

    setStats({
      totalSales: salesData.length,
      totalRevenue,
      totalTax,
      averageSaleValue
    });
  };

  const filterSales = () => {
    let filtered = [...sales];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.agency?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= new Date(dateRange.start) && saleDate <= new Date(dateRange.end);
      });
    }

    setFilteredSales(filtered);
    calculateStats(filtered);
    setCurrentPage(1);
  };

  const viewDetails = (sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const printInvoice = (sale) => {
    const printWindow = window.open('', '_blank');
    
    const itemsRows = sale.items.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.itemName}</td>
        <td>${item.quantity}</td>
        <td>₹${item.pricePerPiece.toFixed(2)}</td>
        <td>₹${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Invoice - ${sale.invoiceNo}</title>
          <style>
              body {
                  font-family: 'Segoe UI', sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f5f7fa;
              }
              .invoice-container {
                  background: #ffffff;
                  padding: 30px;
                  max-width: 900px;
                  margin: auto;
                  border-radius: 10px;
                  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
              }
              @media (max-width: 768px) {
                  .invoice-container { padding: 15px; }
                  .header { flex-direction: column; }
                  .invoice-title { margin-top: 20px; text-align: left; }
                  table { font-size: 12px; }
                  th, td { padding: 8px 4px; }
                  .summary { width: 100%; float: none; }
                  .footer { flex-direction: column; }
                  .footer > div { margin-bottom: 20px; }
              }
              .header {
                  display: flex;
                  justify-content: space-between;
                  border-bottom: 2px solid #eee;
                  padding-bottom: 20px;
                  flex-wrap: wrap;
              }
              .agency-details h2 {
                  margin: 0;
                  color: #2c3e50;
              }
              .invoice-title h1 {
                  margin: 0;
                  color: #007bff;
                  font-size: 32px;
              }
              @media (max-width: 768px) {
                  .invoice-title h1 { font-size: 24px; }
              }
              .billing-details {
                  margin-top: 30px;
                  padding: 15px;
                  background: #f8f9fa;
                  border-radius: 8px;
              }
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 25px;
              }
              th {
                  background: #007bff;
                  color: white;
                  padding: 12px;
                  text-align: center;
              }
              td {
                  padding: 10px;
                  border: 1px solid #ddd;
                  text-align: center;
              }
              tr:nth-child(even) {
                  background-color: #f9f9f9;
              }
              .summary {
                  margin-top: 20px;
                  width: 350px;
                  float: right;
              }
              @media (max-width: 768px) {
                  .summary { width: 100%; }
              }
              .summary table {
                  border: none;
                  margin-top: 0;
              }
              .summary td {
                  border: none;
                  padding: 8px;
                  text-align: right;
              }
              .total {
                  font-size: 20px;
                  font-weight: bold;
                  color: #28a745;
              }
              .footer {
                  margin-top: 60px;
                  display: flex;
                  justify-content: space-between;
                  flex-wrap: wrap;
              }
              .footer > div {
                  margin-bottom: 15px;
              }
              .print-btn {
                  margin-top: 20px;
                  padding: 12px 24px;
                  background: #007bff;
                  color: white;
                  border: none;
                  cursor: pointer;
                  border-radius: 5px;
                  font-size: 16px;
                  display: inline-block;
              }
              .print-btn:hover {
                  background: #0056b3;
              }
              @media print {
                  .print-btn { display: none; }
                  body { background: none; }
                  .invoice-container { box-shadow: none; }
              }
          </style>
      </head>
      <body>
          <div class="invoice-container">
              <div class="header">
                  <div class="agency-details">
                      <h2>${sale.agency.name}</h2>
                      <p>${sale.agency.address.replace(/\n/g, '<br>')}<br>
                      Phone: ${sale.agency.phone}<br>
                      Email: ${sale.agency.email}<br>
                      GSTIN: ${sale.agency.gst}</p>
                  </div>
                  <div class="invoice-title">
                      <h1>INVOICE</h1>
                      <p><strong>Invoice No:</strong> ${sale.invoiceNo}</p>
                      <p><strong>Date:</strong> ${new Date(sale.date).toLocaleDateString('en-IN')}</p>
                  </div>
              </div>
              <div class="billing-details">
                  <strong>Bill To:</strong><br>
                  ${sale.customer.name}<br>
                  ${sale.customer.address}<br>
                  Email: ${sale.customer.email}
              </div>
              <table>
                  <tr>
                      <th>S.No</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Amount</th>
                  </tr>
                  ${itemsRows}
              </table>
              <div class="summary">
                  <table>
                      <tr>
                          <td>Subtotal:</td>
                          <td>₹${sale.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                          <td>GST (${sale.taxRate}%):</td>
                          <td>₹${sale.taxAmount.toFixed(2)}</td>
                      </tr>
                      <tr class="total">
                          <td>Total:</td>
                          <td>₹${sale.totalAmount.toFixed(2)}</td>
                      </tr>
                  </table>
              </div>
              <div class="footer">
                  <div>
                      <strong>Payment Terms:</strong><br>
                      Payment due within 15 days.<br><br>
                      <strong>Bank Details:</strong><br>
                      Bank Name: XYZ Bank<br>
                      A/C No: 1234567890<br>
                      IFSC: ABCD0001234
                  </div>
                  <div>
                      <p>____________________</p>
                      <p>Authorized Signature</p>
                  </div>
              </div>
              <button class="print-btn" onclick="window.print()">Print Invoice</button>
          </div>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading selling details...</p>
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
            <FiFileText className="text-blue-600" />
            Selling Details
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
            View all your sales and invoices
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Stats Cards - Total Selling Amount on Top */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 col-span-2 lg:col-span-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm opacity-90 mb-1">Total Selling Amount</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  ₹{stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                <FiDollarSign className="text-white text-2xl sm:text-3xl" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <p className="text-xs text-gray-500 mb-1">Total Sales</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalSales}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <p className="text-xs text-gray-500 mb-1">Total Tax</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">₹{stats.totalTax.toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-4 col-span-2 sm:col-span-1"
          >
            <p className="text-xs text-gray-500 mb-1">Average Sale</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">₹{stats.averageSaleValue.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice, customer, agency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-4 border-t">
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
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSales.length)} of {filteredSales.length} sales
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Invoice No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Agency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No sales found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((sale) => (
                    <tr key={sale._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{sale.invoiceNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(sale.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sale.customer.name}</p>
                          <p className="text-xs text-gray-500">{sale.customer.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{sale.agency.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{sale.items.length}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        ₹{sale.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewDetails(sale)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => printInvoice(sale)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Print Invoice"
                          >
                            <FiPrinter size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3 mb-6">
          {currentItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FiFileText className="text-4xl text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No sales found</p>
            </div>
          ) : (
            currentItems.map((sale) => (
              <motion.div
                key={sale._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-blue-600 font-mono mb-1">{sale.invoiceNo}</p>
                    <h3 className="font-semibold text-gray-900">{sale.customer.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewDetails(sale)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <FiEye size={18} />
                    </button>
                    <button
                      onClick={() => printInvoice(sale)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <FiPrinter size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="text-sm font-medium">
                      {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Agency</p>
                    <p className="text-sm font-medium truncate">{sale.agency.name}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Items</p>
                    <p className="text-sm font-medium">{sale.items.length}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-sm font-bold text-green-600">₹{sale.totalAmount.toFixed(2)}</p>
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

        {/* Details Modal */}
        <AnimatePresence>
          {showDetails && selectedSale && (
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
                    <h2 className="text-xl font-bold text-gray-900">Sale Details</h2>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Invoice Info */}
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <p className="text-sm text-blue-700 font-mono mb-1">{selectedSale.invoiceNo}</p>
                      <p className="text-xs text-blue-600">
                        {new Date(selectedSale.date).toLocaleString()}
                      </p>
                    </div>

                    {/* Agency Details */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="font-semibold text-gray-700 mb-2">Agency Details</h3>
                      <p className="text-sm text-gray-600">Name: {selectedSale.agency.name}</p>
                      <p className="text-sm text-gray-600">Phone: {selectedSale.agency.phone}</p>
                      <p className="text-sm text-gray-600">Email: {selectedSale.agency.email}</p>
                      <p className="text-sm text-gray-600">GST: {selectedSale.agency.gst}</p>
                      <p className="text-sm text-gray-600">Address: {selectedSale.agency.address}</p>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="font-semibold text-gray-700 mb-2">Customer Details</h3>
                      <p className="text-sm text-gray-600">ID: {selectedSale.customer.customerId}</p>
                      <p className="text-sm text-gray-600">Name: {selectedSale.customer.name}</p>
                      <p className="text-sm text-gray-600">Email: {selectedSale.customer.email}</p>
                      <p className="text-sm text-gray-600">Address: {selectedSale.customer.address}</p>
                    </div>

                    {/* Items */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="font-semibold text-gray-700 mb-2">Items ({selectedSale.items.length})</h3>
                      <div className="space-y-2">
                        {selectedSale.items.map((item, index) => (
                          <div key={index} className="bg-white p-2 rounded-lg text-sm">
                            <p className="font-medium">{item.itemName}</p>
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>Qty: {item.quantity}</span>
                              <span>Price: ₹{item.pricePerPiece}</span>
                              <span>Total: ₹{item.totalPrice}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Subtotal:</span>
                        <span>₹{selectedSale.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tax ({selectedSale.taxRate}%):</span>
                        <span>₹{selectedSale.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total:</span>
                        <span className="text-green-600">₹{selectedSale.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => printInvoice(selectedSale)}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiPrinter />
                        Print Invoice
                      </button>
                      <button
                        onClick={() => setShowDetails(false)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
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

export default SellingDetails;