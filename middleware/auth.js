const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: 'Token missing' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret');
    req.user = decoded; // contains: { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
