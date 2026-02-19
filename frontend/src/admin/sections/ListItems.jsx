import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPackage, FiEdit2, FiTrash2, FiSearch,
  FiSave, FiX, FiDollarSign, FiChevronLeft,
  FiChevronRight, FiEye, FiDownload
} from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';
import QRCode from 'react-qr-code';

const ListItems = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    itemName: '',
    pricePerPiece: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, items]);

  const fetchItems = async () => {
    try {
      const response = await fetch('https://agency-backend-z5fi.onrender.com/api/items');
      const result = await response.json();
      
      if (result.success) {
        setItems(result.data);
        setFilteredItems(result.data);
      } else {
        setError(result.message || 'Error fetching items');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    if (searchTerm) {
      const filtered = items.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
    setCurrentPage(1);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditFormData({
      itemName: item.itemName,
      pricePerPiece: item.pricePerPiece
    });
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const handleViewQR = (item) => {
    setSelectedItem(item);
    setShowQRModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveEdit = async () => {
    try {
      const response = await fetch(`https://agency-backend-z5fi.onrender.com/api/items/${selectedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        const updatedItems = items.map(item =>
          item._id === selectedItem._id ? { ...item, ...editFormData } : item
        );
        setItems(updatedItems);
        setShowEditModal(false);
        setSelectedItem(null);
        setError('');
      } else {
        setError(result.message || 'Error updating item');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to update item');
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`https://agency-backend-z5fi.onrender.com/api/items/${selectedItem._id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        const updatedItems = items.filter(item => item._id !== selectedItem._id);
        setItems(updatedItems);
        setShowDeleteConfirm(false);
        setSelectedItem(null);
        setError('');
      } else {
        setError(result.message || 'Error deleting item');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to delete item');
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (!canvas) return;
    
    // For SVG element, we need to convert to PNG
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${selectedItem.itemName}-qrcode.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    const qrElement = document.getElementById('qr-code-svg');
    if (!qrElement) return;
    
    const qrSvg = qrElement.outerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${selectedItem?.itemName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0;
              background: white;
            }
            .qr-container {
              text-align: center;
              padding: 30px;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              background: white;
              max-width: 400px;
              width: 100%;
            }
            .product-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #1f2937;
            }
            .price {
              font-size: 16px;
              color: #059669;
              margin-top: 15px;
              font-weight: 600;
            }
            .scan-instruction {
              margin-top: 10px;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="product-name">${selectedItem?.itemName}</div>
            ${qrSvg}
            <div class="price">₹${parseFloat(selectedItem?.pricePerPiece).toFixed(2)}</div>
            <div class="scan-instruction">Scan with phone camera to view details</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
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
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">List Items</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">View all items added from buying records</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} items
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Item Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price Per Piece (₹)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">QR Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date Added</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.itemName}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-semibold">
                      ₹{parseFloat(item.pricePerPiece).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewQR(item)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <FaQrcode size={20} />
                        <span className="text-sm">View QR</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
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
      <div className="sm:hidden space-y-3">
        {currentItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FiPackage className="text-4xl text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No items found</p>
          </div>
        ) : (
          currentItems.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{item.itemName}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewQR(item)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="View QR Code"
                  >
                    <FaQrcode size={18} />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Price Per Piece</p>
                  <p className="font-semibold text-blue-600">₹{parseFloat(item.pricePerPiece).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Date Added</p>
                  <p className="font-medium text-gray-700">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* QR Code Preview on Mobile */}
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-xs text-gray-500">QR Code:</span>
                <button
                  onClick={() => handleViewQR(item)}
                  className="flex items-center gap-1 text-purple-600"
                >
                  <FaQrcode size={16} />
                  <span className="text-xs">View</span>
                </button>
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

      {/* QR Code View Modal */}
      <AnimatePresence>
        {showQRModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">QR Code</h2>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedItem.itemName}</h3>
                  <p className="text-sm text-gray-600 mb-4">Price: ₹{parseFloat(selectedItem.pricePerPiece).toFixed(2)}</p>
                  
                  <div className="bg-gray-50 p-6 rounded-xl flex justify-center mb-4">
                    <QRCode
                      id="qr-code-svg"
                      value={selectedItem.qrCode}
                      size={200}
                      level="H"
                    />
                  </div>

                  <p className="text-xs text-gray-500 mb-4 break-all bg-gray-50 p-2 rounded">
                    {selectedItem.qrCode}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={downloadQRCode}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FiDownload />
                      Download
                    </button>
                    <button
                      onClick={printQRCode}
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Print
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedItem && (
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Edit Item</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Name
                    </label>
                    <input
                      type="text"
                      name="itemName"
                      value={editFormData.itemName}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Per Piece (₹)
                    </label>
                    <input
                      type="number"
                      name="pricePerPiece"
                      value={editFormData.pricePerPiece}
                      onChange={handleEditInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
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
        {showDeleteConfirm && selectedItem && (
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Item</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{selectedItem.itemName}"? This action cannot be undone.
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

export default ListItems;
