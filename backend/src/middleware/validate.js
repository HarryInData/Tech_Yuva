const ApiError = require('../utils/ApiError');

/**
 * Middleware factory for Zod validation
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[source]);
      if (!result.success) {
        const formattedErrors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new ApiError(400, 'Validation Error', formattedErrors));
      }
      // Replace with parsed/sanitized data
      req[source] = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = validate;
