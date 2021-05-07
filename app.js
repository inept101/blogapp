const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');

const blogRoutes = require('./routes/blog')






mongoose.connect('mongodb+srv://admin:Yash1998@cluster0.8lxa3.mongodb.net/blogData?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify:false})
.then(()=>{
    console.log("DB connected");
})
.catch((err)=>{
    console.log("DB error");
    console.log(err);
})


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.use(blogRoutes);









app.listen(3000, ()=>{
    console.log("Server is running at port 3000");
})