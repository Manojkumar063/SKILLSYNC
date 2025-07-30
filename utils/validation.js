const { body, param, query } = require('express-validator');

// Common validation rules
const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

const passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

const nameValidation = (field) => body(field)
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage(`${field} must be between 2 and 50 characters`)
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage(`${field} can only contain letters and spaces`);

const mongoIdValidation = (field) => param(field)
  .isMongoId()
  .withMessage(`Invalid ${field}`);

// User validation
const userRegistrationValidation = [
  nameValidation('firstName'),
  nameValidation('lastName'),
  emailValidation,
  passwordValidation,
  body('role')
    .isIn(['client', 'developer'])
    .withMessage('Role must be either client or developer')
];

const userLoginValidation = [
  emailValidation,
  body('password')
    .exists()
    .withMessage('Password is required')
];

const userProfileUpdateValidation = [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('bio').optional().isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('skills.*').optional().trim().isLength({ min: 1, max: 50 }),
  body('hourlyRate').optional().isNumeric().isFloat({ min: 0 }),
  body('experience').optional().isIn(['beginner', 'intermediate', 'expert']),
  body('portfolio').optional().isURL().withMessage('Portfolio must be a valid URL'),
  body('company').optional().trim().isLength({ max: 100 }),
  body('phoneNumber').optional().isMobilePhone()
];

// Job validation
const jobCreationValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),
  body('requiredSkills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  body('requiredSkills.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  body('budget')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Budget must be a positive number'),
  body('budgetType')
    .isIn(['fixed', 'hourly'])
    .withMessage('Budget type must be fixed or hourly'),
  body('deadline')
    .isISO8601()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  body('experienceLevel')
    .isIn(['beginner', 'intermediate', 'expert'])
    .withMessage('Experience level must be beginner, intermediate, or expert'),
  body('category')
    .isIn(['web-development', 'mobile-development', 'desktop-development', 'api-development', 'database', 'devops', 'other'])
    .withMessage('Invalid category'),
  body('estimatedDuration')
    .optional()
    .isIn(['less-than-1-week', '1-2-weeks', '2-4-weeks', '1-2-months', 'more-than-2-months'])
];

// Application validation
const applicationValidation = [
  body('coverLetter')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Cover letter must be between 50 and 2000 characters'),
  body('proposedRate')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Proposed rate must be a positive number'),
  body('estimatedDuration')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Estimated duration is required and must be less than 100 characters'),
  body('portfolio')
    .optional()
    .isArray()
    .withMessage('Portfolio must be an array'),
  body('portfolio.*.title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }),
  body('portfolio.*.url')
    .optional()
    .isURL()
    .withMessage('Portfolio URL must be valid'),
  body('portfolio.*.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
];

// Message validation
const messageValidation = [
  body('recipientId')
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  body('jobId')
    .isMongoId()
    .withMessage('Invalid job ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters')
];

// Rating validation
const ratingValidation = [
  body('jobId')
    .isMongoId()
    .withMessage('Invalid job ID'),
  body('developerId')
    .isMongoId()
    .withMessage('Invalid developer ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review must be less than 1000 characters'),
  body('categories.communication')
    .optional()
    .isInt({ min: 1, max: 5 }),
  body('categories.quality')
    .optional()
    .isInt({ min: 1, max: 5 }),
  body('categories.timeliness')
    .optional()
    .isInt({ min: 1, max: 5 })
];

// Query validation for pagination
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Search validation
const searchValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
];

module.exports = {
  userRegistrationValidation,
  userLoginValidation,
  userProfileUpdateValidation,
  jobCreationValidation,
  applicationValidation,
  messageValidation,
  ratingValidation,
  paginationValidation,
  searchValidation,
  mongoIdValidation,
  emailValidation,
  passwordValidation,
  nameValidation
};
    