import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
}

export async function attachUser(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next();
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    const user = await User.findById(decoded.id).select('-password');
    if (user && !user.isBlocked) req.user = user;
  } catch {
    /* ignore invalid token for optional auth */
  }
  next();
}
