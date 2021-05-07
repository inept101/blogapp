const mongoose = require('mongoose');

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
    }
});
const Blog =mongoose.model('Blog',blogSchema);
module.exports = Blog;