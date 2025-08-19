import { body } from 'express-validator';

export const createBlogValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('subtitle').trim().notEmpty().withMessage('Subtitle is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('image').trim().notEmpty().withMessage('Image is required'),
];

export const updateBlogValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('subtitle')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subtitle cannot be empty'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),
  body('image')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Image cannot be empty'),
];