const generateOrderId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  const prefix = 'ORD';
  return `${prefix}-${timestamp}-${random}`;
};

module.exports = generateOrderId;