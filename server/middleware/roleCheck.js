/**
 * Role-based access control middleware
 * Usage: roleCheck('admin') or roleCheck('creator', 'admin')
 */
const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Premium-only access middleware
 */
const premiumOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Check if premium has expired
  const isPremiumActive =
    req.user.isPremium &&
    (!req.user.premiumExpiry || new Date() < new Date(req.user.premiumExpiry));

  if (!isPremiumActive) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required for this feature.',
      code: 'PREMIUM_REQUIRED',
    });
  }

  next();
};

/**
 * Check if the requesting user owns the resource or is an admin
 */
const ownerOrAdmin = (getOwnerId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const ownerId = getOwnerId(req);
    const isOwner = ownerId && ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this resource.',
      });
    }

    next();
  };
};

module.exports = { roleCheck, premiumOnly, ownerOrAdmin };
