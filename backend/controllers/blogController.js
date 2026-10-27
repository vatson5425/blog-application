const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Blog = require('../models/Blog');

/**
 * @desc    Create a new blog post
 * @route   POST /api/blogs
 * @access  Private (Requires JWT)
 */
const createBlog = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { title, category, description, content, imageUrl, status } = req.body;

    // The author is always bound to req.user._id from the verified JWT
    const blog = await Blog.create({
      title: title.trim(),
      category: category || 'Technology',
      description: description.trim(),
      content: content.trim(),
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : undefined,
      author: req.user._id,
      status: status === 'draft' ? 'draft' : 'published'
    });

    // Populate safe author information for the response
    const populatedBlog = await Blog.findById(blog._id).populate('author', 'name email');

    return res.status(201).json({
      success: true,
      message: `Blog post ${blog.status === 'draft' ? 'saved as draft' : 'published'} successfully`,
      blog: populatedBlog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all published blog posts for public homepage
 * @route   GET /api/blogs
 * @access  Public
 */
const getPublishedBlogs = async (req, res, next) => {
  try {
    const { search, category } = req.query;

    const filter = { status: 'published' };

    // Apply category filter if specified
    if (category && category.toLowerCase() !== 'all') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    // Apply search filter on title, description, or content
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex }
      ];
    }

    // Sort newest posts first
    const blogs = await Blog.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all blog posts for the currently authenticated user
 * @route   GET /api/blogs/my
 * @access  Private (Requires JWT)
 */
const getMyBlogs = async (req, res, next) => {
  try {
    // Return both draft and published posts created by the authenticated user
    const blogs = await Blog.find({ author: req.user._id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single blog post by ID
 * @route   GET /api/blogs/:id
 * @access  Public for published, Private for author's drafts
 */
const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found. Invalid ID format.'
      });
    }

    const blog = await Blog.findById(id).populate('author', 'name email');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.'
      });
    }

    // If post is a draft, only the author is permitted to view it
    if (blog.status === 'draft') {
      // Check for user attached via optional/required auth
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This article is a private draft.'
        });
      }

      // Verify token
      const jwt = require('jsonwebtoken');
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (blog.author._id.toString() !== decoded.id) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You do not have permission to view this draft.'
          });
        }
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing blog post
 * @route   PUT /api/blogs/:id
 * @access  Private (Author Only)
 */
const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found. Invalid ID.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.'
      });
    }

    // Authorization check: Verify that authenticated user owns the blog post
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to update this blog post.'
      });
    }

    const { title, category, description, content, imageUrl, status } = req.body;

    if (title !== undefined) blog.title = title.trim();
    if (category !== undefined) blog.category = category;
    if (description !== undefined) blog.description = description.trim();
    if (content !== undefined) blog.content = content.trim();
    if (imageUrl !== undefined) blog.imageUrl = imageUrl.trim();
    if (status !== undefined) blog.status = status === 'draft' ? 'draft' : 'published';

    await blog.save();

    const updatedBlog = await Blog.findById(blog._id).populate('author', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a blog post
 * @route   DELETE /api/blogs/:id
 * @access  Private (Author Only)
 */
const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found. Invalid ID.'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.'
      });
    }

    // Authorization check: Verify ownership
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to delete this blog post.'
      });
    }

    await Blog.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully',
      id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBlog,
  getPublishedBlogs,
  getMyBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
};
