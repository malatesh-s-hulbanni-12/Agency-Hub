import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSave, FiList, FiX, FiPackage, 
  FiDollarSign, FiPrinter, FiShoppingCart
} from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';
import QRCode from 'react-qr-code'; // This will work after installing react-qr-code
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AddItem = () => {
  const [formData, setFormData] = useState({
    itemName: '',
    pricePerPiece: ''
  });
  const [qrCode, setQrCode] = useState('');
  const [products, setProducts] = useState([]);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generate unique QR code data
  // In AddItem.jsx, change the QR code generation:
const generateQRCode = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  // Store only the ID, not the full URL
  const qrValue = `${timestamp}${random}`;
  setQrCode(qrValue);
  return qrValue;
};

  // Fetch products from buying records when modal opens
  useEffect(() => {
    if (showProductsModal) {
      fetchProducts();
    }
  }, [showProductsModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch all payment slips (buying records)
      const response = await fetch('http://localhost:5000/api/payment-slips');
      const result = await response.json();
      
      if (result.success) {
        // Extract unique products with their details
        const productsMap = new Map();
        
        result.data.forEach(slip => {
          const key = slip.productName;
          if (!productsMap.has(key)) {
            productsMap.set(key, {
              productName: slip.productName,
              pricePerPiece: slip.pricePerPiece,
              lastPurchased: slip.createdAt || slip.date,
              totalQuantity: 0,
              totalAmount: 0,
              purchaseCount: 0
            });
          }
          
          const product = productsMap.get(key);
          product.totalQuantity += parseFloat(slip.quantity) || 0;
          product.totalAmount += parseFloat(slip.totalAmount) || 0;
          product.purchaseCount += 1;
        });

        setProducts(Array.from(productsMap.values()));
      } else {
        setError(result.message || 'Error fetching products');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if product already exists in buying records
      const productExists = products.some(
        p => p.productName.toLowerCase() === formData.itemName.toLowerCase()
      );

      if (!productExists) {
        setError('This product has not been purchased yet. Please add it through Product Buying first.');
        setLoading(false);
        return;
      }

      // Generate QR code if not already generated
      const finalQRCode = qrCode || generateQRCode();

      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName: formData.itemName,
          pricePerPiece: formData.pricePerPiece,
          qrCode: finalQRCode
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Item added successfully with QR code!');
        setFormData({ itemName: '', pricePerPiece: '' });
        setQrCode('');
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Error adding item');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const downloadProductsPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Products from Buying Records', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Total Products: ${products.length}`, 14, 38);
    
    // Create table
    const tableColumn = [
      "Product Name", 
      "Price Per Piece (₹)", 
      "Total Quantity", 
      "Total Amount (₹)",
      "Purchase Count"
    ];
    const tableRows = [];
    
    products.forEach(product => {
      const productData = [
        product.productName,
        `₹${parseFloat(product.pricePerPiece).toFixed(2)}`,
        `${product.totalQuantity} packets`,
        `₹${product.totalAmount.toFixed(2)}`,
        product.purchaseCount.toString()
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
    
    doc.save(`products-from-buying-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const selectProduct = (product) => {
    setFormData({
      itemName: product.productName,
      pricePerPiece: product.pricePerPiece
    });
    generateQRCode();
    setShowProductsModal(false);
    setShowQRModal(true);
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    
    // Get the QR code SVG element
    const qrElement = document.getElementById('qr-code-svg');
    if (!qrElement) return;
    
    const qrSvg = qrElement.outerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${formData.itemName}</title>
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
            <div class="product-name">${formData.itemName}</div>
            ${qrSvg}
            <div class="price">₹${parseFloat(formData.pricePerPiece).toFixed(2)}</div>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6"
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Item</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Add items that were purchased during buying</p>
      </div>

      {/* Get Products Button */}
      <div className="mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowProductsModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <FiShoppingCart />
          Get Products from Buying
        </motion.button>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl"
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl"
        >
          {success}
        </motion.div>
      )}

      {/* Add Item Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiPackage className="text-blue-600" />
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="Enter item name (must exist in buying records)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Item must have been purchased in Product Buying first
              </p>
            </div>

            {/* Price Per Piece */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiDollarSign className="text-blue-600" />
                Price Per Piece (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerPiece"
                value={formData.pricePerPiece}
                onChange={handleInputChange}
                placeholder="Enter price per piece"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* QR Code Display (if generated) */}
            {qrCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <FaQrcode className="text-blue-600" />
                    Generated QR Code
                  </h3>
                  <button
                    type="button"
                    onClick={printQRCode}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Print QR Code
                  </button>
                </div>
                <div className="flex flex-col items-center bg-white p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">{formData.itemName}</p>
                  <div className="bg-white p-2 rounded-lg">
                    <QRCode
                      id="qr-code-svg"
                      value={qrCode}
                      size={200}
                      level="H"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Scan with phone camera to view details
                  </p>
                  <p className="text-xs text-gray-400 mt-1 break-all">{qrCode}</p>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <FiSave />
              {loading ? 'Saving...' : 'Save Item with QR Code'}
            </motion.button>
          </div>
        </form>
      </div>

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
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Products from Buying Records</h2>
                    <p className="text-sm text-gray-600 mt-1">Click on any product to select it</p>
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

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Products Table - Desktop */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Price Per Piece (₹)</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total Quantity</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total Amount (₹)</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Purchase Count</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {products.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                No products found in buying records
                              </td>
                            </tr>
                          ) : (
                            products.map((product, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.productName}</td>
                                <td className="px-4 py-3 text-sm text-blue-600 font-semibold">
                                  ₹{parseFloat(product.pricePerPiece).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{product.totalQuantity} packets</td>
                                <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                                  ₹{product.totalAmount.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{product.purchaseCount}</td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => selectProduct(product)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                  >
                                    Select
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Products Cards - Mobile */}
                    <div className="sm:hidden space-y-3">
                      {products.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No products found in buying records
                        </div>
                      ) : (
                        products.map((product, index) => (
                          <div key={index} className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">{product.productName}</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                              <div>
                                <p className="text-xs text-gray-500">Price/Piece</p>
                                <p className="font-medium text-blue-600">₹{parseFloat(product.pricePerPiece).toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Total Qty</p>
                                <p className="font-medium">{product.totalQuantity} packets</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Total Amount</p>
                                <p className="font-medium text-green-600">₹{product.totalAmount.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Purchases</p>
                                <p className="font-medium">{product.purchaseCount}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => selectProduct(product)}
                              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                              Select This Product
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Summary */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Total Unique Products:</span> {products.length}
                      </p>
                    </div>
                  </>
                )}

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

      {/* QR Code Success Modal */}
      <AnimatePresence>
        {showQRModal && qrCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaQrcode className="text-2xl text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">QR Code Generated!</h3>
                <p className="text-gray-600 mb-4">
                  QR code has been generated for "{formData.itemName}"
                </p>
                <div className="bg-gray-50 p-4 rounded-xl mb-4 flex justify-center">
                  <QRCode
                    value={qrCode}
                    size={150}
                    level="H"
                  />
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Scan with your phone camera to view item details
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={printQRCode}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    OK
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

export default AddItem;