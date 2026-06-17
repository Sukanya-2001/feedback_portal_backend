/**
 * Utility functions for sending standard JSON responses.
 * Format: { status, success, message, data, errors }
 */

export const sendResponse = (res, statusCode, success, message, data = null, errors = null) => {
  return res.status(statusCode).json({
    status: statusCode,
    success,
    message,
    data,
    errors,
  });
};

export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data, null);
};

export const sendError = (res, message, errors = null, statusCode = 400) => {
  return sendResponse(res, statusCode, false, message, null, errors);
};
