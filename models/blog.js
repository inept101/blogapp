const mongoose = require('mongoose');
const Comment = require('./comment');

const blogSchema = new mongoose.Schema({
    author: {
        type: String,
        required:true
    },
    image: {
        type: String
    },
    title: {
        type: String,
        required:true
    },
    text: {
        type: String,
        required:true
    },
    createdBy:  {
        type: String,
        required: true

    },
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Comment'
        }
    ]
});
const Blog =mongoose.model('Blog',blogSchema);
module.exports = Blog;