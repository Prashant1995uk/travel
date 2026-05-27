import { Router } from 'express';
import { body } from 'express-validator';
import { createContact } from '../controllers/contactController.js';

const router = Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('message').trim().notEmpty().isLength({ max: 5000 }),
  ],
  createContact
);

export default router;
