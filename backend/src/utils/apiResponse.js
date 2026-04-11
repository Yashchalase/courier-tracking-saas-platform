/**
 * Standard success envelope for new endpoints: { success, data, message }
 */
function success(res, data, message = "OK", statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

module.exports = {
  success,
};
