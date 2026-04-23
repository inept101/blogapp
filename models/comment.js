const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    comment: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
module.exports = Comment;
