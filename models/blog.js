const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  author: { type: String, required: true },
  image: { type: String },
  title: { type: String, required: true },
  text: { type: String, required: true },
  createdBy: { type: String },
  tags: [{ type: String }],
  likes: [{ type: String }],
  published: { type: Boolean, default: true },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

blogSchema.index({ title: 'text', text: 'text' });

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
module.exports = Blog;
