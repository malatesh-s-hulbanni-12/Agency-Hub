import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFileText, FiDownload, FiEye, FiPrinter,
  FiSearch, FiFilter, FiCalendar, FiUser,
  FiDollarSign, FiX, FiChevronLeft, FiChevronRight,
  FiPackage
} from 'react-icons/fi';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Create axios instance
  const api = axios.create({
    baseURL: 'https://agency-backend-z5fi.onrender.com/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, dateRange, invoices]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales');
      
      if (response.data.success) {
        setInvoices(response.data.data);
        setFilteredInvoices(response.data.data);
      } else {
        setError('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to connect to server');
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(inv => 
        inv.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.agency?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate >= new Date(dateRange.start) && invDate <= new Date(dateRange.end);
      });
    }

    setFilteredInvoices(filtered);
    setCurrentPage(1);
  };

  const viewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const downloadInvoice = (invoice) => {
    const invoiceHTML = generateInvoiceHTML(invoice);
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${invoice.invoiceNo}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Invoice downloaded successfully!');
  };

  const printInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    const invoiceHTML = generateInvoiceHTML(invoice);
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  const generateInvoiceHTML = (invoice) => {
    const itemsRows = invoice.items.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.itemName}</td>
        <td>${item.quantity}</td>
        <td>₹${item.pricePerPiece.toFixed(2)}</td>
        <td>₹${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Invoice - ${invoice.invoiceNo}</title>
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
                      <h2>${invoice.agency.name}</h2>
                      <p>${invoice.agency.address.replace(/\n/g, '<br>')}<br>
                      Phone: ${invoice.agency.phone}<br>
                      Email: ${invoice.agency.email}<br>
                      GSTIN: ${invoice.agency.gst}</p>
                  </div>
                  <div class="invoice-title">
                      <h1>INVOICE</h1>
                      <p><strong>Invoice No:</strong> ${invoice.invoiceNo}</p>
                      <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('en-IN')}</p>
                  </div>
              </div>
              <div class="billing-details">
                  <strong>Bill To:</strong><br>
                  ${invoice.customer.name}<br>
                  ${invoice.customer.address}<br>
                  Email: ${invoice.customer.email}
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
                          <td>₹${invoice.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                          <td>GST (${invoice.taxRate}%):</td>
                          <td>₹${invoice.taxAmount.toFixed(2)}</td>
                      </tr>
                      <tr class="total">
                          <td>Total:</td>
                          <td>₹${invoice.totalAmount.toFixed(2)}</td>
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
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoices...</p>
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
            Invoices
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
            View and manage all generated invoices
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Search and Filter Bar - Moved up */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice, customer, agency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs sm:text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length} invoices
          </p>
        </div>

        {/* Mobile-First Card View - Primary view for all devices */}
        <div className="space-y-3 mb-6">
          {currentItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FiFileText className="text-4xl text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No invoices found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            currentItems.map((invoice) => (
              <motion.div
                key={invoice._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow"
              >
                {/* Header with Invoice Number and Date */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded inline-block mb-2">
                      {invoice.invoiceNo}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FiCalendar size={12} />
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-base font-bold text-green-600">₹{invoice.totalAmount.toFixed(2)}</p>
                </div>

                {/* Customer and Agency Info */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <FiUser size={10} />
                      Customer
                    </p>
                    <p className="text-sm font-medium truncate">{invoice.customer.name}</p>
                    <p className="text-xs text-gray-500 truncate">{invoice.customer.email}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Agency</p>
                    <p className="text-sm font-medium truncate">{invoice.agency.name}</p>
                    <p className="text-xs text-gray-500 truncate">{invoice.agency.phone}</p>
                  </div>
                </div>

                {/* Items Count and Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <FiPackage className="text-gray-400" size={14} />
                    <p className="text-xs text-gray-600">{invoice.items.length} items</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewInvoice(invoice)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Preview Invoice"
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      onClick={() => downloadInvoice(invoice)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download Invoice"
                    >
                      <FiDownload size={16} />
                    </button>
                    <button
                      onClick={() => printInvoice(invoice)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Print Invoice"
                    >
                      <FiPrinter size={16} />
                    </button>
                  </div>
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

        {/* Invoice Preview Modal */}
        <AnimatePresence>
          {showPreview && selectedInvoice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiFileText className="text-blue-600" />
                    Invoice Preview
                  </h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Invoice Details */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <p className="text-sm text-blue-700 font-mono mb-1">{selectedInvoice.invoiceNo}</p>
                      <p className="text-xs text-blue-600">
                        {new Date(selectedInvoice.date).toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <FiUser />
                          Agency Details
                        </h3>
                        <p className="text-sm text-gray-600">Name: {selectedInvoice.agency.name}</p>
                        <p className="text-sm text-gray-600">Phone: {selectedInvoice.agency.phone}</p>
                        <p className="text-sm text-gray-600">Email: {selectedInvoice.agency.email}</p>
                        <p className="text-sm text-gray-600">GST: {selectedInvoice.agency.gst}</p>
                        <p className="text-sm text-gray-600">Address: {selectedInvoice.agency.address}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <FiUser />
                          Customer Details
                        </h3>
                        <p className="text-sm text-gray-600">Name: {selectedInvoice.customer.name}</p>
                        <p className="text-sm text-gray-600">Email: {selectedInvoice.customer.email}</p>
                        <p className="text-sm text-gray-600">Address: {selectedInvoice.customer.address}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FiPackage />
                        Items ({selectedInvoice.items.length})
                      </h3>
                      <div className="space-y-2">
                        {selectedInvoice.items.map((item, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg text-sm">
                            <p className="font-medium">{item.itemName}</p>
                            <div className="flex flex-wrap justify-between text-xs text-gray-600 mt-1 gap-2">
                              <span>Qty: {item.quantity}</span>
                              <span>Price: ₹{item.pricePerPiece}</span>
                              <span>Total: ₹{item.totalPrice}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Subtotal:</span>
                        <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tax ({selectedInvoice.taxRate}%):</span>
                        <span>₹{selectedInvoice.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t">
                        <span>Total:</span>
                        <span className="text-green-600">₹{selectedInvoice.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => downloadInvoice(selectedInvoice)}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <FiDownload />
                        Download
                      </button>
                      <button
                        onClick={() => printInvoice(selectedInvoice)}
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <FiPrinter />
                        Print
                      </button>
                      <button
                        onClick={() => setShowPreview(false)}
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

export default Invoices;















