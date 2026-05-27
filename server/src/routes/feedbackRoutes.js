import { Router } from 'express';
import { body } from 'express-validator';
import { createFeedback, listFeedback } from '../controllers/feedbackController.js';
import { attachUser } from '../middleware/auth.js';

const router = Router();

router.post(
  '/',
  attachUser,
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').trim().notEmpty().isLength({ max: 2000 }),
    body('category').optional().trim(),
    body('name')
      .if((_v, { req }) => !req.userId)
      .trim()
      .notEmpty()
      .withMessage('Name is required when not logged in'),
    body('email')
      .if((_v, { req }) => !req.userId)
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required when not logged in'),
  ],
  createFeedback
);

router.get('/', listFeedback);

export default router;
