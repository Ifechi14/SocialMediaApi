const bcrypt= require('bcrypt');
const User = require('../models/User');
const AppError = require('../utils/appError');

const filterObj= (obj, ...allowedFields)=> {
    const newObj = {};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}
// const catchAsynsc = fn =>{
//     return (req, res ,next)=>{
//         fn(req,res, next).catch(next);
//     }
    
// }

exports.updateMe = async(req,res,next)=>{

    //create error if user POSTs password data
    if(req.body.password || req.body.passConfirm){
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400));
    }

    //filter out unwanted fields names that are not allowed to be updated
    const filteredBody= filterObj(req.body, 'username','email');

    //update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody,{
        new:true, 
        runValidators:true
    }); 
     
    res.status(200).json({
        status: 'success',
        data:{
            user: updatedUser
        }
    });
}
exports.update = async(req,res,next)=>{

    if(req.body.userId===req.params.id || req.body.isAdmin){
        if(req.body.password){
            try {
                const salt= await bcrypt.genSalt(10)
                req.body.password= await bcrypt.hash(req.body.password, salt); 
            } catch (err) {
                return res.status(500).json(err);
            }
            try {
                const user= await User.findByIdAndUpdate(req.params.id,
                    {$set: req.body});
                res.status(200).json({
                    status: 'success',
                    message: 'Account has been UPDATED!!!',
                    data: {
                        user
                    }
                });
            } catch (err) {
                return next(new AppError('No user found', 404));
            }
        }
    }else{
        return res.status(403).json({
            status: 'fail',
            message: 'You can update only your account'
        });
    }
}


exports.delete = async(req,res,next)=>{
    
    if(req.body.userId===req.params.id || req.body.isAdmin){
        try {
            await User.findByIdAndDelete(req.params.id);
            return res.status(200).json("account has been DELETED!!!");
        } catch (err) {
            // return res.status(500).json({
            //     status: 'fail',
            //     message: err
            // });
            return next(new AppError('No user found', 404));
        }
    }else{
        return res.status(403).json("You can only delete yor account")
    }
    
}


exports.getUser=  async(req,res, next)=>{
    try {
        const user = await User.findById(req.params.id);
        const { password, updatedAt, ...other }= user._doc
        res.status(200).json({
            status:'success',
            data:{
                other
            }
        })
    } catch (err) {
        return next(new AppError('No user found', 404));
    }
}


exports.follow = async(req,res,next)=>{
    if(req.body.userId !== req.params.id){
        try {
            const user= await User.findById(req.params.id);
            const currentUser= await User.findById(req.body.userId);
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.body.userId } });
                res.status(200).json({
                    status: 'success',
                    message: 'User has been followed'
                })
            }else{
                res.status(403).json("user is already followed")
            }
        } catch (err) {
             return next(new AppError('No user found', 404));
        }

    }else{
        res.status(403).json({
            status: 'fail',
            message:'You cant follow yourself'
        })
    }
}


exports.unfollow = async(req,res,next)=>{
    if(req.body.userId !== req.params.id){
        try {
            const user= await User.findById(req.params.id);
            const currentUser= await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.body.userId } });
                res.status(200).json({
                    status:'success',
                    message:'user has been unfollowed'
                })
            }else{
                res.status(403).json("You dont follow this user")
            }
        } catch (err) {
            return next(new AppError('No user found', 404));
        }

    }else{
        res.status(403).json({
            status: 'fail',
            message:'You cant unfollow yourself'
        })
    }
}

exports.getAllUsers = async(req,res,next)=>{

    try {
        const users = await User.find();

        res.status(200).json({
            status: 'success',
            results: users.length,
            data:{
                users
            }
        })
        
    } catch (err) {
        return next(new AppError('Users not found', 404));
    }
}