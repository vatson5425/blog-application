const express = require('express');
const { body } = require('express-validator');
const {
  createBlog,
  getPublishedBlogs,
  getMyBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation for creating/updating blog posts
const blogValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Blog title is required')
    .isLength({ min: 3, max: 180 })
    .withMessage('Title must be between 3 and 180 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Short description is required')
    .isLength({ min: 5, max: 300 })
    .withMessage('Description must be between 5 and 300 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Blog content is required')
    .isLength({ min: 10 })
    .withMessage('Blog content must be at least 10 characters long'),
  body('category')
    .optional()
    .isIn(['Engineering', 'Design', 'JavaScript', 'Technology', 'General'])
    .withMessage('Invalid category chosen'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published')
];

// Public Route: Get all published blogs (supports ?search= and ?category=)
router.get('/', getPublishedBlogs);

// Protected Route: Get currently logged-in user's blogs (drafts + published)
router.get('/my', protect, getMyBlogs);

// Route: Get single blog post by ID (public for published, private for drafts)
router.get('/:id', getBlogById);

// Protected Route: Create a new blog post
router.post('/', protect, blogValidation, createBlog);

// Protected Route: Update existing blog post (Author only)
router.put('/:id', protect, blogValidation, updateBlog);

// Protected Route: Delete blog post (Author only)
router.delete('/:id', protect, deleteBlog);

module.exports = router;
