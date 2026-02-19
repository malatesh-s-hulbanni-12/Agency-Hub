import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiMail, FiSearch, FiX, 
  FiAlertCircle, FiShoppingBag, FiUserPlus,
  FiInfo, FiEdit2, FiSave, FiRefreshCw,
  FiCheck, FiSlash, FiCamera, FiPackage, 
  FiDollarSign, FiShoppingCart, FiPhone, FiMapPin,
  FiTrash2, FiPlus, FiMinus, FiBox, FiPrinter,
  FiFileText
} from 'react-icons/fi';
import { FaQrcode, FaGift } from 'react-icons/fa';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const ProductSell = ({ onAddUser }) => {
  // Customer search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('id');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // User edit state
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [updating, setUpdating] = useState(false);

  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);
  const [scanError, setScanError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);
  const lastRowRef = useRef(null);

  // Manual product entry state
  const [manualRows, setManualRows] = useState([
    { id: 1, itemName: '', price: '', quantity: 1, isEditing: true }
  ]);

  // Agency details state with GST
  const [agencyDetails, setAgencyDetails] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    gst: ''
  });

  // Tax rate
  const TAX_RATE = 0.05; // 5%

  // Create axios instance
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Scroll to new row when added
  useEffect(() => {
    if (lastRowRef.current) {
      lastRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [manualRows.length]);

  // Initialize scanner when showScanner becomes true
  useEffect(() => {
    if (showScanner) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [showScanner]);

  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      const qrbox = { width: 250, height: 250 };
      const config = {
        fps: 10,
        qrbox,
        aspectRatio: 1.0
      };

      isScanningRef.current = true;
      
      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        onScanSuccess,
        onScanError
      );
    } catch (error) {
      console.error('Failed to start scanner:', error);
      setScanError('Failed to start camera. Please ensure camera permissions are granted.');
      isScanningRef.current = false;
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        await scannerRef.current.stop();
        isScanningRef.current = false;
      } catch (error) {
        console.error('Failed to stop scanner:', error);
      }
    }
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanner();
    
    setScanError('');
    
    try {
      setLoading(true);
      
      let qrValue = decodedText.trim();
      
      if (qrValue.includes('http')) {
        const parts = qrValue.split('/');
        qrValue = parts[parts.length - 1];
      }
      
      console.log('Scanning QR with value:', qrValue);
      
      const response = await fetch(`http://localhost:5000/api/items/qr/${encodeURIComponent(qrValue)}`);
      const result = await response.json();
      
      if (result.success) {
        setScannedItem(result.data);
        setQuantity(1);
        setShowScanner(false);
        toast.success(`Item "${result.data.itemName}" scanned successfully!`);
      } else {
        setScanError('Item not found in database');
        toast.error('Item not found');
      }
    } catch (error) {
      console.error('Error:', error);
      setScanError('Failed to fetch item details');
      toast.error('Failed to fetch item details');
    } finally {
      setLoading(false);
    }
  };

  const onScanError = (errorMessage) => {
    console.debug('Scan error:', errorMessage);
  };

  const searchUser = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a user ID or name');
      return;
    }

    setLoading(true);
    setError(null);
    setEditingField(null);
    
    try {
      let response;
      let searchParam = {};
      
      if (searchType === 'id') {
        const userId = parseInt(searchQuery);
        if (isNaN(userId)) {
          toast.error('Please enter a valid numeric ID');
          setLoading(false);
          return;
        }
        searchParam = { userId };
      } else {
        searchParam = { name: searchQuery };
      }
      
      response = await api.get('/users', { params: searchParam });

      if (response.data.success && response.data.users.length > 0) {
        const foundUser = response.data.users[0];
        const userData = {
          id: foundUser._id,
          userId: foundUser.userId,
          name: foundUser.name,
          email: foundUser.email,
          address: foundUser.address || ''
        };
        
        setUser(userData);
        
        setRecentSearches(prev => {
          const newSearches = [{
            userId: foundUser.userId,
            name: foundUser.name,
            timestamp: new Date().toLocaleTimeString()
          }, ...prev.filter(s => s.userId !== foundUser.userId)].slice(0, 5);
          return newSearches;
        });
        
        toast.success(`User ${foundUser.name} found!`);
      } else {
        setError('User not found');
        
        const allUsersResponse = await api.get('/users');
        const availableIds = allUsersResponse.data.users.map(u => u.userId).join(', ');
        
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-2xl border-l-4 border-red-500 p-4 max-w-md w-full"
          >
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-red-500 text-xl flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">User Not Found!</h3>
                <p className="text-sm text-gray-600 mb-2">
                  No user found with {searchType === 'id' ? 'ID' : 'name'}: "{searchQuery}"
                </p>
                {searchType === 'id' && allUsersResponse.data.users.length > 0 && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 flex items-center gap-1">
                      <FiInfo size={12} />
                      Available user IDs: {availableIds}
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      if (onAddUser) {
                        onAddUser();
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-2"
                  >
                    <FiUserPlus size={16} />
                    Register New User
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ), {
          duration: 10000,
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setError('Failed to search user. Please try again.');
      toast.error(error.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveFieldUpdate = async (field) => {
    if (!user) return;
    
    if (field === 'email' && !editValue.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (field === 'name' && !editValue.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    setUpdating(true);
    
    try {
      const updateData = {};
      updateData[field] = editValue;
      
      const response = await api.put(`/users/${user.id}`, updateData);
      
      if (response.data.success) {
        setUser({
          ...user,
          [field]: editValue
        });
        
        setEditingField(null);
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || `Failed to update ${field}`);
    } finally {
      setUpdating(false);
    }
  };

  const clearUser = () => {
    setUser(null);
    setSearchQuery('');
    setError(null);
    setEditingField(null);
    setCart([]);
    setManualRows([{ id: 1, itemName: '', price: '', quantity: 1, isEditing: true }]);
    setAgencyDetails({ name: '', address: '', phone: '', email: '', gst: '' });
  };

  const closeScanner = () => {
    setShowScanner(false);
  };

  const handleAgencyInputChange = (e) => {
    const { name, value } = e.target;
    setAgencyDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manual product entry functions
  const addManualRow = () => {
    const newId = manualRows.length > 0 ? Math.max(...manualRows.map(r => r.id)) + 1 : 1;
    setManualRows([...manualRows, { 
      id: newId, 
      itemName: '', 
      price: '', 
      quantity: 1, 
      isEditing: true 
    }]);
  };

  const updateManualRow = (id, field, value) => {
    setManualRows(manualRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const addManualToCart = (row) => {
    if (!row.itemName.trim()) {
      toast.error('Please enter item name');
      return;
    }
    if (!row.price || parseFloat(row.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const newItem = {
      _id: `manual-${row.id}-${Date.now()}`,
      itemName: row.itemName,
      pricePerPiece: parseFloat(row.price),
      quantity: row.quantity,
      isManual: true
    };

    setCart([...cart, newItem]);
    
    // Remove the row after adding to cart
    setManualRows(manualRows.filter(r => r.id !== row.id));
    
    // If this was the last row, add a new empty row
    if (manualRows.length === 1) {
      addManualRow();
    }
    
    toast.success(`"${row.itemName}" added to cart`);
  };

  const removeManualRow = (id) => {
    if (manualRows.length > 1) {
      setManualRows(manualRows.filter(row => row.id !== id));
    } else {
      // Reset the last row instead of removing it
      setManualRows([{ id: 1, itemName: '', price: '', quantity: 1, isEditing: true }]);
    }
  };

  const handleRowKeyPress = (e, row) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addManualToCart(row);
    }
  };

  const addToCart = () => {
    if (!scannedItem) return;

    const existingItem = cart.find(item => item._id === scannedItem._id);
    
    if (existingItem) {
      const updatedCart = cart.map(item =>
        item._id === scannedItem._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      setCart(updatedCart);
      toast.success(`Updated quantity for "${scannedItem.itemName}"`);
    } else {
      setCart([...cart, { ...scannedItem, quantity }]);
      toast.success(`"${scannedItem.itemName}" added to cart`);
    }

    setScannedItem(null);
    setQuantity(1);
  };

  const removeFromCart = (itemId, itemName) => {
    setCart(cart.filter(item => item._id !== itemId));
    toast.success(`"${itemName}" removed from cart`);
  };

  const updateCartQuantity = (itemId, newQuantity, itemName) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item =>
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  const updateCartItemPrice = (itemId, newPrice) => {
    if (newPrice < 0) return;
    
    const updatedCart = cart.map(item =>
      item._id === itemId ? { ...item, pricePerPiece: newPrice } : item
    );
    setCart(updatedCart);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.pricePerPiece * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * TAX_RATE;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmitSale = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to cart');
      return;
    }

    if (!user) {
      toast.error('Please select a customer');
      return;
    }

    // Validate agency details
    if (!agencyDetails.name || !agencyDetails.address || !agencyDetails.phone || !agencyDetails.email || !agencyDetails.gst) {
      toast.error('Please fill in all agency details including GST');
      return;
    }

    if (!agencyDetails.email.includes('@')) {
      toast.error('Please enter a valid agency email');
      return;
    }

    if (agencyDetails.gst.length < 15) {
      toast.error('Please enter a valid GST number');
      return;
    }

    const saleData = {
      customer: {
        customerId: user.userId,
        name: user.name,
        email: user.email,
        address: user.address || 'Not provided'
      },
      agency: agencyDetails,
      items: cart.map(item => ({
        itemId: item._id,
        itemName: item.itemName,
        pricePerPiece: item.pricePerPiece,
        quantity: item.quantity,
        totalPrice: item.pricePerPiece * item.quantity,
        isManual: item.isManual || false
      })),
      subtotal: calculateSubtotal(),
      taxRate: TAX_RATE * 100,
      taxAmount: calculateTax(),
      totalAmount: calculateTotal(),
      date: new Date().toISOString()
    };

    console.log('Sending sale data:', saleData);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentSale(result.data);
        setShowSuccess(true);
        setShowInvoice(true);
        toast.success('Sale completed successfully!');
      } else {
        toast.error(result.message || 'Failed to complete sale');
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    
    const itemsRows = currentSale.items.map((item, index) => `
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
          <title>Invoice - ${currentSale.invoiceNo}</title>
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
                      <h2>${currentSale.agency.name}</h2>
                      <p>${currentSale.agency.address.replace(/\n/g, '<br>')}<br>
                      Phone: ${currentSale.agency.phone}<br>
                      Email: ${currentSale.agency.email}<br>
                      GSTIN: ${currentSale.agency.gst}</p>
                  </div>
                  <div class="invoice-title">
                      <h1>INVOICE</h1>
                      <p><strong>Invoice No:</strong> ${currentSale.invoiceNo}</p>
                      <p><strong>Date:</strong> ${new Date(currentSale.date).toLocaleDateString('en-IN')}</p>
                  </div>
              </div>
              <div class="billing-details">
                  <strong>Bill To:</strong><br>
                  ${currentSale.customer.name}<br>
                  ${currentSale.customer.address}<br>
                  Email: ${currentSale.customer.email}
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
                          <td>₹${currentSale.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                          <td>GST (${currentSale.taxRate}%):</td>
                          <td>₹${currentSale.taxAmount.toFixed(2)}</td>
                      </tr>
                      <tr class="total">
                          <td>Total:</td>
                          <td>₹${currentSale.totalAmount.toFixed(2)}</td>
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

  const closeInvoice = () => {
  setShowInvoice(false);
  setShowSuccess(false);
  setCurrentSale(null);
  
  // Reset all data to refresh the page
  setCart([]);
  setManualRows([{ id: 1, itemName: '', price: '', quantity: 1, isEditing: true }]);
  setAgencyDetails({ name: '', address: '', phone: '', email: '', gst: '' });
  setUser(null);
  setSearchQuery('');
  setScannedItem(null);
  setQuantity(1);
  
  toast.success('Page refreshed. Ready for next sale!');
};

  const FieldRow = ({ label, field, value, icon: Icon, type = 'text' }) => {
    const isEditing = editingField === field;
    
    return (
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <Icon className="text-gray-400" size={18} />
          <div className="flex-1">
            {isEditing ? (
              <input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                disabled={updating}
                onKeyPress={(e) => e.key === 'Enter' && saveFieldUpdate(field)}
              />
            ) : (
              <div className="px-3 py-2 text-sm text-gray-700 break-all">
                {value || 'Not set'}
              </div>
            )}
          </div>
          {isEditing ? (
            <>
              <button
                onClick={() => saveFieldUpdate(field)}
                disabled={updating}
                className={`p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors ${
                  updating ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiCheck size={18} />
              </button>
              <button
                onClick={cancelEditing}
                disabled={updating}
                className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
              >
                <FiX size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => startEditing(field, value)}
              className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
            >
              <FiEdit2 size={18} />
            </button>
          )}
        </div>
      </div>
    );
  };

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
            <FiShoppingBag className="text-blue-600" />
            Product Sell
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
            Select customer and add items to complete sale
          </p>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl text-center"
            >
              Sale completed successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customer Search Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 max-w-3xl mx-auto mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <FiUser className="text-blue-600" />
            Customer Search
          </h2>

          {/* Search Type Toggle */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSearchType('id')}
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                searchType === 'id' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Search by ID
            </button>
            <button
              onClick={() => setSearchType('name')}
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                searchType === 'name' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Search by Name
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={searchType === 'id' ? "Enter user ID (e.g., 1, 2, 3...)" : "Enter customer name"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUser()}
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={searchUser}
              disabled={loading}
              className={`px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl font-semibold transition-all text-sm sm:text-base ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {loading ? 'Searching...' : 'Search'}
            </motion.button>
          </div>

          {/* Quick Registration Button */}
          {!user && !loading && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => onAddUser && onAddUser()}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <FiUserPlus size={16} />
                Register New Customer
              </button>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && !user && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(searchType === 'id' ? search.userId.toString() : search.name);
                      searchUser();
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors"
                  >
                    {search.name} (ID: {search.userId})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Details Section */}
        <AnimatePresence>
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 max-w-3xl mx-auto mb-4 sm:mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FiUser className="text-blue-600" />
                  Customer Details
                </h2>
                <button
                  onClick={clearUser}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  User ID
                </label>
                <div className="flex items-center gap-2">
                  <FiUser className="text-gray-400" size={18} />
                  <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 font-mono">
                    {user.userId}
                  </div>
                </div>
              </div>

              <FieldRow 
                label="Full Name"
                field="name"
                value={user.name}
                icon={FiUser}
                type="text"
              />

              <FieldRow 
                label="Email Address"
                field="email"
                value={user.email}
                icon={FiMail}
                type="email"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agency Details Section with GST */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 max-w-3xl mx-auto mb-4 sm:mb-6"
          >
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiInfo className="text-blue-600" />
              Agency Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Agency Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Agency Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={agencyDetails.name}
                  onChange={handleAgencyInputChange}
                  placeholder="Enter agency name"
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Agency Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    name="phone"
                    value={agencyDetails.phone}
                    onChange={handleAgencyInputChange}
                    placeholder="Enter phone number"
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Agency Email */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={agencyDetails.email}
                    onChange={handleAgencyInputChange}
                    placeholder="Enter agency email"
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* GST Number */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  GST Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaGift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="gst"
                    value={agencyDetails.gst}
                    onChange={handleAgencyInputChange}
                    placeholder="Enter GST number (e.g., 22AAAAA0000A1Z5)"
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Agency Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                  <textarea
                    name="address"
                    value={agencyDetails.address}
                    onChange={handleAgencyInputChange}
                    placeholder="Enter complete address"
                    rows="2"
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Note about required fields */}
            <p className="text-xs text-gray-400 mt-2">
              <span className="text-red-500">*</span> Required fields
            </p>
          </motion.div>
        )}

        {/* Scanner and Cart Section - Only shown when customer is selected */}
        {user && (
          <>
            {/* Scan QR Code Button */}
            {!showScanner && !scannedItem && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowScanner(true)}
                className="w-full mb-4 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FiCamera size={24} />
                Scan QR Code to Add Item
              </motion.button>
            )}

            {/* QR Scanner */}
            <AnimatePresence>
              {showScanner && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FaQrcode className="text-blue-600" />
                        Scan QR Code
                      </h2>
                      <button onClick={closeScanner} className="p-2 hover:bg-gray-100 rounded-lg">
                        <FiX size={20} />
                      </button>
                    </div>

                    <div 
                      id="qr-reader" 
                      style={{ 
                        width: '100%',
                        minHeight: '300px',
                        backgroundColor: '#f3f4f6'
                      }}
                    ></div>

                    {scanError && (
                      <p className="mt-4 text-sm text-red-600 text-center">{scanError}</p>
                    )}

                    <p className="mt-4 text-sm text-gray-500 text-center">
                      Position the QR code within the frame to scan
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading Indicator */}
            {loading && (
              <div className="mb-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Scanned Item Display */}
            <AnimatePresence>
              {scannedItem && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4 bg-white rounded-2xl shadow-lg p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Scanned Item</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <FiPackage />
                          Item Name
                        </p>
                        <p className="font-semibold text-gray-900">{scannedItem.itemName}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <FiDollarSign />
                          Price
                        </p>
                        <p className="font-semibold text-green-600">
                          ₹{parseFloat(scannedItem.pricePerPiece).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2">Quantity</p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100"
                        >
                          <FiMinus />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 text-center text-xl font-bold text-gray-900 bg-white border border-gray-300 rounded-lg py-1"
                          min="1"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={addToCart}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual Entry Section */}
            <div className="mb-4 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiBox className="text-blue-600" />
                  Manual Product Entry
                </h2>
                <button
                  onClick={addManualRow}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <FiPlus size={16} />
                  Add Row
                </button>
              </div>

              {/* Manual Entry Rows */}
              <div className="space-y-3">
                {manualRows.map((row, index) => (
                  <motion.div
                    key={row.id}
                    ref={index === manualRows.length - 1 ? lastRowRef : null}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Item Name */}
                      <div className="sm:col-span-5">
                        <label className="block text-xs text-gray-500 mb-1">Item Name</label>
                        <input
                          type="text"
                          value={row.itemName}
                          onChange={(e) => updateManualRow(row.id, 'itemName', e.target.value)}
                          onKeyPress={(e) => handleRowKeyPress(e, row)}
                          placeholder="Enter item name"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Price */}
                      <div className="sm:col-span-3">
                        <label className="block text-xs text-gray-500 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          value={row.price}
                          onChange={(e) => updateManualRow(row.id, 'price', e.target.value)}
                          onKeyPress={(e) => handleRowKeyPress(e, row)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Quantity with + - */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateManualRow(row.id, 'quantity', Math.max(1, row.quantity - 1))}
                            className="p-2 bg-white rounded-lg hover:bg-gray-100"
                          >
                            <FiMinus size={14} />
                          </button>
                          <input
                            type="number"
                            value={row.quantity}
                            onChange={(e) => updateManualRow(row.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-14 text-center text-sm border border-gray-300 rounded-lg py-2"
                            min="1"
                          />
                          <button
                            onClick={() => updateManualRow(row.id, 'quantity', row.quantity + 1)}
                            className="p-2 bg-white rounded-lg hover:bg-gray-100"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="sm:col-span-2 flex items-end gap-2">
                        <button
                          onClick={() => addManualToCart(row)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                        >
                          Add
                        </button>
                        {manualRows.length > 1 && (
                          <button
                            onClick={() => removeManualRow(row.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Hint for Enter key */}
                    {index === manualRows.length - 1 && (
                      <p className="text-xs text-gray-400 mt-2">
                        Press Enter to add item to cart
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Cart Section - Table Format */}
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 bg-white rounded-2xl shadow-lg p-4 sm:p-6 overflow-x-auto"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiShoppingCart />
                  Cart Items ({cart.length})
                </h2>

                {/* Desktop Table View */}
                <div className="hidden sm:block">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Item Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Price (₹)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Total (₹)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cart.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.pricePerPiece}
                              onChange={(e) => updateCartItemPrice(item._id, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateCartQuantity(item._id, item.quantity - 1, item.itemName)}
                                className="p-1 bg-white rounded hover:bg-gray-100"
                              >
                                <FiMinus size={14} />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateCartQuantity(item._id, parseInt(e.target.value) || 1, item.itemName)}
                                className="w-14 text-center text-sm border border-gray-300 rounded py-1"
                                min="1"
                              />
                              <button
                                onClick={() => updateCartQuantity(item._id, item.quantity + 1, item.itemName)}
                                className="p-1 bg-white rounded hover:bg-gray-100"
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">
                            ₹{(item.pricePerPiece * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeFromCart(item._id, item.itemName)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {cart.map((item) => (
                    <div key={item._id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-gray-900">{item.itemName}</h3>
                        <button
                          onClick={() => removeFromCart(item._id, item.itemName)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Price (₹)</p>
                          <input
                            type="number"
                            value={item.pricePerPiece}
                            onChange={(e) => updateCartItemPrice(item._id, parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-2 text-sm border border-gray-300 rounded"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Quantity</p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateCartQuantity(item._id, item.quantity - 1, item.itemName)}
                              className="p-2 bg-white rounded hover:bg-gray-100"
                            >
                              <FiMinus size={14} />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateCartQuantity(item._id, parseInt(e.target.value) || 1, item.itemName)}
                              className="w-12 text-center text-sm border border-gray-300 rounded py-2"
                              min="1"
                            />
                            <button
                              onClick={() => updateCartQuantity(item._id, item.quantity + 1, item.itemName)}
                              className="p-2 bg-white rounded hover:bg-gray-100"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xs text-gray-500">Total</span>
                        <span className="font-semibold text-green-600">
                          ₹{(item.pricePerPiece * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Section */}
                <div className="mt-6 pt-4 border-t space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tax (5%):</span>
                    <span className="font-medium">₹{calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Complete Sale Button */}
                <button
                  onClick={handleSubmitSale}
                  disabled={loading}
                  className={`w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FiSave />
                  {loading ? 'Processing...' : 'Complete Sale'}
                </button>
              </motion.div>
            )}

            {/* Empty Cart State */}
            {!showScanner && !scannedItem && cart.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <FaQrcode className="text-5xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No items in cart</p>
                <p className="text-sm text-gray-400">
                  Scan QR codes or manually add items
                </p>
              </div>
            )}
          </>
        )}

        {/* No Customer Selected State */}
        {!user && (
          <div className="text-center py-8 sm:py-12 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 max-w-3xl mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiUser className="text-gray-400 text-2xl sm:text-3xl" />
            </div>
            <p className="text-sm sm:text-base text-gray-500 mb-2">
              Please select a customer to start selling
            </p>
            <p className="text-xs text-gray-400">
              Search for a customer using ID or name
            </p>
          </div>
        )}
      </motion.div>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoice && currentSale && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={closeInvoice}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiFileText className="text-blue-600" />
                  Invoice Generated
                </h2>
                <button
                  onClick={closeInvoice}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="p-6">
                {/* Invoice Preview */}
                <div className="border rounded-xl p-4 bg-gray-50 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Invoice Number</p>
                      <p className="text-lg font-bold text-blue-600">{currentSale.invoiceNo}</p>
                    </div>
                    <button
                      onClick={printInvoice}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FiPrinter />
                      Print Invoice
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Agency</p>
                      <p className="font-medium">{currentSale.agency.name}</p>
                      <p className="text-sm text-gray-600">{currentSale.agency.phone}</p>
                      <p className="text-sm text-gray-600">{currentSale.agency.email}</p>
                      <p className="text-sm text-gray-600">GST: {currentSale.agency.gst}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer</p>
                      <p className="font-medium">{currentSale.customer.name}</p>
                      <p className="text-sm text-gray-600">{currentSale.customer.email}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-2">Total Amount: <span className="font-bold text-green-600">₹{currentSale.totalAmount.toFixed(2)}</span></p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeInvoice}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductSell;