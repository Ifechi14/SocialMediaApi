const express= require('express');
const app= express();
const helmet= require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv= require('dotenv');
// const morgan= require('morgan');
const { default: mongoose } = require('mongoose');
const userRoutes= require('./routes/user');
const authRoutes= require('./routes/auth');
const postRoutes= require('./routes/posts');
const AppError= require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

dotenv.config();

app.use(express.json());
///connection to database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, ()=>{
    console.log("connected to database");
});

///middlewares

//set security HTTP headers
app.use(helmet());

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//data sanitization against noSQL query injection
app.use(mongoSanitize());

//data sanitization against XSS
app.use(xss());

//limit requests from the same API
const limiter = rateLimit({
    max: 80,
    windows: 60 * 60 * 1000,
    message: 'Too many requests from this IP try again later'
});
//to affect all the routes with this url
app.use('/api', limiter);

//test middleware
// app.use((req,res,next)=>{
//     req.requestTime = new Date().toISOString();
//     console.log(req.headers);
// })

//global error handling middleware
app.use(globalErrorHandler);
// app.use(morgan("common"));

//mounting routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);

///server
const port= 9889;
app.listen(port, ()=>{
    console.log(`Server running on ${port}..`)
});




