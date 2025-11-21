import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules
export const moodValidation = [
  body('moodScore').isInt({ min: 1, max: 10 }).withMessage('Mood score must be between 1 and 10'),
  body('emoji').notEmpty().withMessage('Emoji is required'),
  body('triggers').optional().isArray(),
  body('activities').optional().isArray(),
  body('sleepHours').optional().isFloat({ min: 0, max: 24 })
];

export const postValidation = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('content').trim().isLength({ min: 10, max: 5000 }).withMessage('Content must be 10-5000 characters'),
  body('tags').optional().isArray(),
  body('anonymous').optional().isBoolean()
];

export const profileValidation = [
  body('profile.name').optional().trim().isLength({ min: 2, max: 100 }),
  body('profile.university').optional().trim(),
  body('profile.year').optional().isInt({ min: 1, max: 6 }),
  body('profile.bio').optional().trim().isLength({ max: 500 })
];
