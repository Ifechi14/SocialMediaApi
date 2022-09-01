const Post = require('../models/Post');
const User = require('../models/User');
const AppError= require('./../utils/appError');


exports.create =  async(req,res,next)=>{
    const newPost= new Post(req.body)
    try {
        const post = await newPost.save();
        res.status(200).json({
            status:'success',
            data:{
                post
            }
        })
    } catch (err) {
        return next(new AppError('No user found', 404));
    }
}



exports.update= async(req,res,next)=>{

    try {
        const post= await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            await post.updateOne({
                $set: req.body
            });
            res.status(200).json({
                status: 'success',
                message: 'The post has been UPDATED!!!'
            })
        }else{
            res.status(403).json({
                status: 'fail',
                message: 'You can update only your post'
            });
        }
    } catch (err) {
        return next(new AppError('No user found', 404));
    }
   
}


exports.delete= async(req,res,next)=>{

    try {
        const post= await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            await post.deleteOne();
            res.status(200).json({
                status: 'success',
                message: 'The post has been DELETED!!!'
            })
        }else{
            res.status(403).json({
                status: 'fail',
                message: 'You can delete only your post'
            });
        }
    } catch (err) {
        return next(new AppError('No user found', 404));
    }

}


exports.like = async(req,res,next)=>{
    try {
        const post= await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({ $push: { likes:  req.body.userId } });
            res.status(200).json("the post has been liked");
        }else{
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("the post has been disliked");
        }
    } catch (err) {
        return next(new AppError('No user found', 404));
    }
}

exports.getPost= async (req,res,next)=>{
    try {
        const post= await Post.findById(req.params.id).populate({
            path: 'userId', 
            select: '-guides -profilePicture -coverPicture -followers -email -role -relationship -followings -__v'
        });

        res.status(200).json({
            status: 'success',
            data:{
                post
            }
        });

    } catch (err) {
        return next(new AppError('No user found', 404));
    }
}


exports.timeline= async(req,res,next)=>{
    try {
        const currentUser= await User.findById(req.body.userId);
        const userPosts= await Post.find({ userId: currentUser._id });
        const friendPosts= await Promise.all(
            currentUser.followings.map(friendId=>{
                return Post.find({ userId: friendId });
            })
        );
        res.json(userPosts.concat(...friendPosts));
    } catch (err) {
        return next(new AppError('No user found', 404));
    }
}