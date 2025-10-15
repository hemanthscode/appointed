const helpers = require('../utils/helpers');

/**
 * Middleware to standardize successful JSON responses
 * Should be used explicitly in controllers, or optionally here if all responses passed in res.locals.data
 */
const responseHandler = (req, res, next) => {
  if ('data' in res.locals) {
    return res.json(helpers.successResponse(res.locals.data, res.locals.message));
  }
  next();
};

module.exports = responseHandler;
