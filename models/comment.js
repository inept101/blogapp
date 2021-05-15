const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({ 
    user : {
        type:String,
        required: true
    },
    comment : {
        type: String,
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

const Comment = mongoose.model('Comment',commentSchema);

module.exports = Comment;