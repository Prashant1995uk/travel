import { validationResult } from 'express-validator';
import Contact from '../models/Contact.js';

export async function createContact(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, message } = req.body;
  const doc = await Contact.create({ name, email, message });
  res.status(201).json({ message: 'Thank you — we will get back to you soon.', id: doc._id });
}
