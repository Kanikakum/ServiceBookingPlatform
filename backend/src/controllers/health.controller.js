const ApiResponse = require('../utils/apiResponse');

const getHealthStatus = (req, res) => {
  return ApiResponse.success(res, 'Service Booking API is running', null, 200);
};

module.exports = {
  getHealthStatus,
};
