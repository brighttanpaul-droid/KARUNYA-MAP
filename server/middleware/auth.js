/**
 * Server-Side Authentication & Authorization Middleware
 * 
 * Enforces strict role separation:
 * - Customers have read-only access and cannot invoke mutating operations.
 * - Admin mutations require a valid, signed JWT Bearer Token.
 * - Client-side role claims (such as localStorage or role selectors) are never trusted.
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in as an administrator.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have administrator permissions.',
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token. Please log in again.',
    });
  }
}

module.exports = { requireAdminAuth };
