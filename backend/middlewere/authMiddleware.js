// backend/middlewere/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// authenticate token middleware (named `auth` so your routes that use `auth` work)
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }

    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Token invalid or expired' });
      }

      // Payload should include id and role at login time
      req.user = {
        id: payload.id || payload.userId,
        role: payload.role || payload.userRole || 'student',
      };

      next();
    });
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ success: false, message: 'Server error in auth' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  next();
};

const studentOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if (req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Student only' });
  }
  next();
};

module.exports = { auth, adminOnly, studentOnly };
