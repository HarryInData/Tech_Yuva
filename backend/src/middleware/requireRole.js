const ApiError = require('../utils/ApiError');

/**
 * Restricts access to specific user roles
 * @param {...('student' | 'mentor' | 'admin')} allowedRoles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Requires one of [${allowedRoles.join(', ')}] role, but your role is '${req.user.role}'.`
        )
      );
    }

    next();
  };
}

module.exports = requireRole;
