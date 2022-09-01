const crypto =require('crypto');
const { promisify } = require('util');
const User= require('./../models/User');
const jwt= require('jsonwebtoken');
const dotenv= require('dotenv');
const AppError= require('./../utils/appError');
const bcrypt = require('bcrypt');
const { genSalt } = require('bcrypt');
const sendMail = require('./../utils/email');


dotenv.config();

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken= (user, statusCode, res)=>{
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    })
}

exports.register = async (req,res,)=>{

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    try {
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: hashPassword,
            passwordConfirm: req.body.passwordConfirm,
            role: req.body.role,
            post: req.body.post
        });

        const token = signToken(newUser._id);

        const user = await newUser.save();

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        })
       
    } catch (err) {
        return next(new AppError('Internal Server Error', 500));
    }
}



exports.login = async (req,res,next)=>{
    const { email, password } = req.body;

    //1) check if email and password exists
    if(!email || !password){
        return next(new AppError('Please provide email and password!!', 404));

    }

    //2)check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    // console.log(user);

    if(!user || !( await user.correctPassword(password, user.password))){
      return  next(new AppError('Incorrect Email or Password!!', 401));
    }

    //3) if everything ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
}


exports.protect = async (req,res,next)=>{
    //get token, and check if its there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    
    if(!token){
        return next(new AppError('You have to be logged in',401));
    }
    //verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //checking if user still exists
    const currentUser = await User.findById(decoded.id);

    if(!currentUser){
        return next(new AppError('User no longer exists', 401));
    }
    //check if user changed password after token was issued

    //grant access to protected routes
    req.user = currentUser;

    next();
}

exports.restrictTo = (...roles)=>{
    //passing arguments into the middleware function
    return (req, res, next)=>{
        //roles ['admin']
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do have permission to perform this ACTION', 403));
        }

        next();
    }

}

exports.forgotPassword = async (req, res, next)=>{
    //get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if(!user){
        return next(new AppError('No user with that email address', 404));
    }

    //generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
         .createHash('sha256')
         .update(resetToken)
         .digest('hex');

    console.log({resetToken}, this.passwordResetToken);
    this.passwordResetExpires= Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });
    
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/}`; 

    return resetToken;

    
    ///send it to user's email
  
}

exports.resetPassword = (req, res, next)=>{
     
}



exports.updatePassword = async (req,res,next)=>{
    //get user from collection
    const user = await User.findById(req.user.id).select('+password');

    //check if POSTed current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.passConfirm))){
        return next(new AppError('Your current passowrd is wrong', 401));
    } 

    //if so, update password
    user.password = req.req.body.password;
    user.passwordCurrent = req.body.passwordCurrent;
    await user.save();

    //log user in, send JWT
    
}




