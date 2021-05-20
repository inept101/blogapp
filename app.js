if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}



const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = require('./models/user');

const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');






mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify:false,
    useCreateIndex:true})
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





const sessionConfig = {
    secret:'someSecret',
    resave:false,
    saveUninitialized: true
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{ 
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currentUser=req.user;
    next(); 
});



app.get('/', (req,res)=>{
    res.render('blogs/landing');
})

app.use(blogRoutes);
app.use(authRoutes);








app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server is running at port 3000");
})