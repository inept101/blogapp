const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');
const Comment = require('../models/comment');
const {isLoggedIn} = require('../middleware');


router.get('/blogs',async (req,res)=>{

    try{
        const blogs = await Blog.find({});
        res.render('blogs/index',{ blogs} );

    } catch(e){
        console.log("something happened. error...");
        req.flash('error', 'cannot find the Blogs');
        res.render('blogs/error');

    }

    
})

router.get('/blogs/new', isLoggedIn,(req, res)=>{
    res.render('blogs/new');
})

router.post('/blogs', isLoggedIn,async (req,res)=>{
    try{
        

        console.log("new Blog Created.")
        await Blog.create(req.body.blog);
        req.flash('success','New Blog created');
        res.redirect('/blogs');

    } catch(e){
        console.log("something happened. error...");
        req.flash('error', 'cannot able to create Blog');
        res.render('blogs/error');


    }

   
})

router.get('/blogs/:id', async(req,res)=>{
    try{
        const blog=await Blog.findById(req.params.id).populate('comments');
        res.render('blogs/show',{blog });

    } catch(e){
        console.log("something happened. error...");
        req.flash('error', 'not able to show the blog');
        res.render('blogs/error');

    }
    

    
})
router.get('/blogs/:id/edit', isLoggedIn, async(req, res)=>{
    try{
        const blog=await Blog.findById(req.params.id);
        res.render('blogs/edit',{blog});

    } catch(e){
        console.log("something happened. error...");
        req.flash('error', 'not able to edit this blog');
        res.render('blogs/error');


    }
})

router.patch('/blogs/:id', isLoggedIn,async(req,res)=>{
    try{
        await Blog.findByIdAndUpdate(req.params.id, req.body.blog);
        req.flash('success','Updated successfullly.');
        res.redirect(`/blogs/${req.params.id}`);    

    } catch (e){
        console.log("something happened. error...");
        req.flash('error', 'not able to update the blog');
        res.render('blogs/error');

    }

  
})


router.delete('/blogs/:id', isLoggedIn,async(req,res)=>{
    try{
        await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/blogs');

    } catch(e){
        console.log("something happened. error...");
        req.flash('error', 'not able to delete the blog');
        res.render('blogs/error');

    }
    
    
})

router.post('/blogs/:id/comments', isLoggedIn,async(req,res)=>{
    try{
        const blog = await Blog.findById(req.params.id);
        const comment = new Comment({user: req.user.username,...req.body});
        console.log(comment);
        blog.comments.push(comment);
        await comment.save();
        await blog.save();
        req.flash('success','New comment added');
        res.redirect(`/blogs/${req.params.id}`);    

    } catch(e){
        console.log("something happened. error...");
        req.flash('error', 'not able to add the comment');
        res.render('blogs/error');
        
    }
    
  

})

router.delete('/blogs/:id/comments/:cid', isLoggedIn, async(req,res)=>{
    try{
        await Blog.findOneAndUpdate({_id:req.params.id}, {$pull:{comments:req.params.cid}});
        await Comment.findByIdAndDelete(req.params.cid);
        req.flash('success','Comment Deleted Successfully');
        res.redirect(`/blogs/${req.params.id}`);

    } catch(e){
        console.log("something happened. error...");
        req.flash('error', 'not able to delete the comment');
        res.render('blogs/error');
        
    }



})
   










module.exports = router;