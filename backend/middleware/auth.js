const admin = require('../services/firebaseAdmin');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token, true);
    // Custom claims are in decodedToken, not decodedToken.claims for verifyIdToken
    const customRole = decodedToken.role || decodedToken.claims?.role;
    const isGoogle = decodedToken.firebase?.sign_in_provider === 'google.com';
    const derivedRole = customRole || (isGoogle ? 'driver' : 'student');
    const approved = decodedToken.approved ?? decodedToken.claims?.approved ?? false;
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email,
      role: derivedRole,
      approved
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];

    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${userRoles.join(' or ')}, your role: ${req.user.role}`
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token, true);
        // Custom claims are in decodedToken, not decodedToken.claims for verifyIdToken
        const customRole = decodedToken.role || decodedToken.claims?.role;
        const derivedRole = customRole || 'student';
        const approved = decodedToken.approved ?? decodedToken.claims?.approved ?? false;
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email,
          role: derivedRole,
          approved
        };
      } catch (jwtError) {
        // Invalid token, but continue without authentication for optional auth
        console.log('Optional auth: Invalid token, continuing without auth');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = { auth, requireRole, optionalAuth };
