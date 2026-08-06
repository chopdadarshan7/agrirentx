/**
 * Role-based Authorization Middleware
 * Allows access only to users with the specified roles.
 *
 * Usage:
 * authorize("admin")
 * authorize("admin", "rentaler")
 * authorize("farmer", "rentaler", "admin")
 */

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure authentication middleware has already attached the user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }

    next();
  };
};

module.exports = authorize;