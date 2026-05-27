import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { signToken } from '../utils/token.js';

export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: email.toLowerCase(), password: hashed });
  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (user.isBlocked) {
    return res.status(403).json({ message: 'Account is blocked' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function me(req, res) {
  const user = await User.findById(req.userId).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.isBlocked) {
    return res.status(403).json({ message: 'Account is blocked' });
  }
  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}
