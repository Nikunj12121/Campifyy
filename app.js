if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
// require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session        = require('express-session');
const flash  =  require('connect-flash');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User  =  require('./models/user');

const mongoSanitize = require('express-mongo-sanitize');

const helmet = require('helmet');
//const { MongoStore } = require('connect-mongo');

const MongoDBStore = require("connect-mongo")(session);

  //const dbUrl = 'mongodb://localhost:27017/campify_final';
 const dbUrl = process.env.DB_URL;

// 'mongodb://localhost:27017/campify_final'
mongoose.connect(dbUrl,{
     useNewUrlParser : true,
    //  useCreateIndex:true,
     useUnifiedTopology:true,
     ssl:true,
    //  useFindAndModify:false
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const store = new MongoDBStore({
    url: dbUrl,
    secret: 'thisshouldbeabettersecret',
    touchAfter: 24*60*60
});

store.on("error",function(e){
    console.log("SESSION STORE ERROR",e);
})


const sessionConfig = {
    store,
    name:'session',
    secret:'thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
    }
}
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet({contentSecurityPolicy:false}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
   // console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error   = req.flash('error');
    next();
})

 

app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);
app.use('/',userRoutes);


app.get('/',(req,res)=>{
    res.render('home');
});





app.all(/(.*)/,(req,res,next)=>{        //if go to some unknown page,then show 404
    next(new ExpressError('Page Not Found',404));
})

app.use((err,req,res,next)=>{
    const {statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No,Something went wrong!!';
    res.status(statusCode).render('error',{ err });
    
})

app.listen(3000,()=>{
    console.log('Serving on port 3000')
});

