const validatePaymentSlip = (req, res, next) => {
  const {
    sellerType,
    sellerName,
    productName,
    quantity,
    pricePerPacket,
    piecesPerPacket,
    buyerName,
    phoneNumber,
    address,
    fileName,
    fileType,
    fileSize,
    fileData
  } = req.body;

  const errors = [];

  // Validate seller details
  if (!sellerType || !['factory', 'agent'].includes(sellerType)) {
    errors.push('Valid seller type is required (factory or agent)');
  }

  if (!sellerName || sellerName.trim().length < 2) {
    errors.push('Seller name must be at least 2 characters');
  }

  if (!productName || productName.trim().length < 2) {
    errors.push('Product name must be at least 2 characters');
  }

  // Validate purchase details
  if (!quantity || quantity < 1) {
    errors.push('Quantity must be at least 1');
  }

  if (!pricePerPacket || pricePerPacket < 0) {
    errors.push('Price per packet cannot be negative');
  }

  if (!piecesPerPacket || piecesPerPacket < 1) {
    errors.push('Pieces per packet must be at least 1');
  }

  // Validate buyer details
  if (!buyerName || buyerName.trim().length < 2) {
    errors.push('Buyer name must be at least 2 characters');
  }

  if (!phoneNumber || phoneNumber.trim().length < 10) {
    errors.push('Valid phone number is required');
  }

  if (!address || address.trim().length < 5) {
    errors.push('Address must be at least 5 characters');
  }

  // Validate file upload
  if (!fileName || !fileType || !fileSize || !fileData) {
    errors.push('Payment slip file is required');
  } else {
    // Check file size (5MB limit)
    if (fileSize > 5 * 1024 * 1024) {
      errors.push('File size should be less than 5MB');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(fileType)) {
      errors.push('Only JPEG, PNG, GIF images and PDF files are allowed');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = validatePaymentSlip;