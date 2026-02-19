import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, FiPackage, FiDollarSign, FiHash, 
  FiMapPin, FiPhone, FiSave, FiPrinter, 
  FiUpload, FiFile, FiImage, FiX 
} from 'react-icons/fi';

const ProductBuying = () => {
  const [formData, setFormData] = useState({
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

  const [paymentSlip, setPaymentSlip] = useState({
    file: null,
    fileName: '',
    fileType: '',
    fileSize: 0,
    fileData: '',
    preview: null
  });

  const [calculatedValues, setCalculatedValues] = useState({
    totalPieces: 0,
    totalAmount: 0,
    pricePerPiece: 0
  });

  const [showInvoice, setShowInvoice] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Trigger calculations when relevant fields change
    if (['quantity', 'pricePerPacket', 'piecesPerPacket'].includes(name)) {
      calculateValues({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFileUpload = (e) => {
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
      setPaymentSlip({
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

  const removeFile = () => {
    setPaymentSlip({
      file: null,
      fileName: '',
      fileType: '',
      fileSize: 0,
      fileData: '',
      preview: null
    });
  };

  const calculateValues = (data) => {
    const quantity = parseFloat(data.quantity) || 0;
    const pricePerPacket = parseFloat(data.pricePerPacket) || 0;
    const piecesPerPacket = parseFloat(data.piecesPerPacket) || 0;

    const totalPieces = quantity * piecesPerPacket;
    const totalAmount = quantity * pricePerPacket;
    const pricePerPiece = piecesPerPacket > 0 ? pricePerPacket / piecesPerPacket : 0;

    setCalculatedValues({
      totalPieces: totalPieces.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      pricePerPiece: pricePerPiece.toFixed(2)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate payment slip upload
    if (!paymentSlip.fileData) {
      setError('Please upload a payment slip');
      setIsLoading(false);
      return;
    }

    try {
      const newOrder = {
        ...formData,
        ...calculatedValues,
        ...paymentSlip,
        date: new Date().toISOString(),
        status: 'Pending'
      };

      console.log('Sending data to server:', newOrder);

      const response = await fetch('https://agency-backend-z5fi.onrender.com/api/payment-slips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (result.success) {
        setOrderDetails(result.data);
        setShowInvoice(true);
        setSuccess('Payment slip saved successfully!');
        
        // Reset form after successful submission
        setTimeout(() => {
          handleReset();
        }, 2000);
      } else {
        setError(result.message || 'Error saving to database');
        if (result.errors) {
          console.error('Validation errors:', result.errors);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setFormData({
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
    setPaymentSlip({
      file: null,
      fileName: '',
      fileType: '',
      fileSize: 0,
      fileData: '',
      preview: null
    });
    setCalculatedValues({
      totalPieces: 0,
      totalAmount: 0,
      pricePerPiece: 0
    });
    setShowInvoice(false);
    setOrderDetails(null);
    setError('');
    setSuccess('');
  };

  // Invoice Component
  const Invoice = ({ order }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowInvoice(false)}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-sm text-gray-600 mt-1">Order ID: {order.orderId}</p>
              <p className="text-sm text-gray-600">Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
            </div>
          </div>

          {/* Payment Slip */}
          {order.fileData && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Slip:</h3>
              {order.fileType?.startsWith('image/') ? (
                <img 
                  src={order.fileData} 
                  alt="Payment Slip" 
                  className="max-w-full h-auto max-h-48 rounded-lg"
                />
              ) : (
                <div className="flex items-center gap-2 text-blue-600">
                  <FiFile />
                  <span className="text-sm">{order.fileName}</span>
                </div>
              )}
            </div>
          )}

          {/* Seller Details */}
          <div className="border-t border-b py-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Seller Details:</h3>
            <p className="text-sm text-gray-600">
              {order.sellerType === 'factory' ? 'Factory' : 'Agent'}: {order.sellerName}
            </p>
            <p className="text-sm text-gray-600">Product: {order.productName}</p>
          </div>

          {/* Purchase Details */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Purchase Details:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Quantity:</p>
                <p className="font-medium">{order.quantity} packets</p>
              </div>
              <div>
                <p className="text-gray-600">Price per Packet:</p>
                <p className="font-medium">₹{order.pricePerPacket}</p>
              </div>
              <div>
                <p className="text-gray-600">Pieces per Packet:</p>
                <p className="font-medium">{order.piecesPerPacket}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Pieces:</p>
                <p className="font-medium">{order.totalPieces}</p>
              </div>
              <div>
                <p className="text-gray-600">Price per Piece:</p>
                <p className="font-medium">₹{order.pricePerPiece}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Amount:</p>
                <p className="font-medium text-lg text-blue-600">₹{order.totalAmount}</p>
              </div>
            </div>
          </div>

          {/* Buyer Details */}
          <div className="border-t pt-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Buyer Details:</h3>
            <p className="text-sm text-gray-600">Name: {order.buyerName}</p>
            <p className="text-sm text-gray-600">Phone: {order.phoneNumber}</p>
            <p className="text-sm text-gray-600">Address: {order.address}</p>
          </div>

          {/* Status */}
          <div className="mb-6">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
              Status: {order.status}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiPrinter />
              Print Invoice
            </button>
            <button
              onClick={() => setShowInvoice(false)}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6"
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Buying</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Add new product purchase with payment slip</p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seller Details Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiUser className="text-blue-600" />
            1️⃣ Seller Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Factory/Agent Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Factory / Agent <span className="text-red-500">*</span>
              </label>
              <select
                name="sellerType"
                value={formData.sellerType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="factory">Factory</option>
                <option value="agent">Agent</option>
              </select>
            </div>

            {/* Factory/Agent Name - User Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.sellerType === 'factory' ? 'Factory Name' : 'Agent Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleInputChange}
                placeholder={`Enter ${formData.sellerType === 'factory' ? 'factory' : 'agent'} name`}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Product Name - User Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="Enter product name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Product Purchase Details Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiPackage className="text-blue-600" />
            2️⃣ Product Purchase Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiHash className="inline mr-1" />
                Quantity (Packets) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                min="1"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Price Per Packet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiDollarSign className="inline mr-1" />
                Price Per Packet (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerPacket"
                value={formData.pricePerPacket}
                onChange={handleInputChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Pieces Per Packet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiPackage className="inline mr-1" />
                Pieces Per Packet <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="piecesPerPacket"
                value={formData.piecesPerPacket}
                onChange={handleInputChange}
                placeholder="Enter pieces"
                min="1"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Automatic Calculations */}
          {(formData.quantity || formData.pricePerPacket || formData.piecesPerPacket) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
            >
              <h3 className="font-semibold text-gray-900 mb-3">✅ Automatic Calculations:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Pieces</p>
                  <p className="text-xl font-bold text-gray-900">{calculatedValues.totalPieces}</p>
                  <p className="text-xs text-gray-500">pieces</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-green-600">₹{calculatedValues.totalAmount}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Price Per Piece</p>
                  <p className="text-xl font-bold text-blue-600">₹{calculatedValues.pricePerPiece}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Payment Slip Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiUpload className="text-blue-600" />
            3️⃣ Payment Slip Upload
          </h2>

          <div className="space-y-4">
            {!paymentSlip.fileData ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <input
                  type="file"
                  id="paymentSlip"
                  accept=".jpg,.jpeg,.png,.gif,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="paymentSlip"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FiUpload className="text-4xl text-gray-400 mb-3" />
                  <span className="text-lg font-medium text-gray-700 mb-1">
                    Click to upload payment slip
                  </span>
                  <span className="text-sm text-gray-500">
                    Supports: JPG, PNG, GIF, PDF (Max 5MB)
                  </span>
                </label>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {paymentSlip.fileType.startsWith('image/') ? (
                      <FiImage className="text-2xl text-blue-600" />
                    ) : (
                      <FiFile className="text-2xl text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{paymentSlip.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {(paymentSlip.fileSize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <FiX className="text-xl text-gray-600" />
                  </button>
                </div>
                {paymentSlip.preview && (
                  <img
                    src={paymentSlip.preview}
                    alt="Payment Slip Preview"
                    className="mt-4 max-w-full h-auto max-h-48 rounded-lg"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Buyer Details Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiUser className="text-blue-600" />
            4️⃣ Buyer Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buyer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline mr-1" />
                Buyer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="buyerName"
                value={formData.buyerName}
                onChange={handleInputChange}
                placeholder="Enter buyer name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiPhone className="inline mr-1" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiMapPin className="inline mr-1" />
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete address"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <FiSave />
            {isLoading ? 'Saving...' : 'Save Purchase & Generate Invoice'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleReset}
            className="py-4 px-8 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Reset
          </motion.button>
        </div>
      </form>

      {/* Invoice Modal */}
      {showInvoice && orderDetails && <Invoice order={orderDetails} />}
    </motion.div>
  );
};

export default ProductBuying;
