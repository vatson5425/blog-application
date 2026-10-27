const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [180, 'Title cannot exceed 180 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: ['Engineering', 'Design', 'JavaScript', 'Technology', 'General'],
        message: '{VALUE} is not a supported category'
      },
      default: 'Technology'
    },
    description: {
      type: String,
      required: [true, 'Short description / excerpt is required'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters long'],
      maxlength: [300, 'Description cannot exceed 300 characters']
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
      minlength: [10, 'Blog content must be at least 10 characters long']
    },
    imageUrl: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Blog author is required']
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching and sorting
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ title: 'text', description: 'text', content: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
