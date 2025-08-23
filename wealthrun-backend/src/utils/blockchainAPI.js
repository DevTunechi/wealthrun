const axios = require('axios');

const getTransactionStatus = async (txId) => {
  // Example with a placeholder API
  const response = await axios.get(`https://api.blockchain.com/v3/tx/${txId}`);
  return response.data.status; // pending/confirmed
};

module.exports = { getTransactionStatus };
