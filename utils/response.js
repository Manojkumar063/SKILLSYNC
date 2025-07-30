// Standardized API response utility

class ApiResponse {
  constructor(success, message, data = null, errors = null, meta = null) {
    this.success = success;
    this.message = message;
    if (data !== null) this.data = data;
    if (errors !== null) this.errors = errors;
    if (meta !== null) this.meta = meta;
    this.timestamp = new Date().toISOString();
  }
}

// Success responses
const success = (res, message, data = null, statusCode = 200, meta = null) => {
  return res.status(statusCode).json(new ApiResponse(true, message, data, null, meta));
};

const created = (res, message, data = null, meta = null) => {
  return success(res, message, data, 201, meta);
};

// Error responses
const error = (res, message, errors = null, statusCode = 500, data = null) => {
  return res.status(statusCode).json(new ApiResponse(false, message, data, errors));
};

const badRequest = (res, message, errors = null) => {
  return error(res, message, errors, 400);
};

const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, null, 401);
};

const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, null, 403);
};

const notFound = (res, message = 'Resource not found') => {
  return error(res, message, null, 404);
};

const conflict = (res, message, errors = null) => {
  return error(res, message, errors, 409);
};

const validationError = (res, errors) => {
  return badRequest(res, 'Validation failed', errors);
};

const serverError = (res, message = 'Internal server error') => {
  return error(res, message, null, 500);
};

// Pagination response
const paginated = (res, message, data, currentPage, totalPages, total, limit) => {
  const meta = {
    currentPage: parseInt(currentPage),
    totalPages,
    total,
    limit: parseInt(limit),
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
  
  return success(res, message, data, 200, meta);
};

module.exports = {
  success,
  created,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  serverError,
  paginated
};
