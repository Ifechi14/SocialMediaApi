const mongoose= require('mongoose');
const validator= require('validator');
const bcrypt = require('bcrypt');
const Post = require('./../models/Post');


const UserSchema= new mongoose.Schema({
    username:{
        type: String,
        required: true,
        min:3,
        max:29,
        unique: true,
        validate: [validator.isAlpha, 'Username must only contain characters ']
    },
    email:{
        type: String,
        required: true,
        unique:true,
        lowercase: true,
        max: 50,
        validate: [validator.isEmail, 'Please provide a valid Email']
    },
    password:{
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    passwordConfirm:{
        type: String,
        required: false,
        validate: {
         validator: function(el){
           return el === this.password
        },
        message: 'Passwords are not the same'
      }
    },
    profilePicture:{
        type: String,
        default:""
    },
    coverPicture:{
        type: String,
        default:""
    },
    followers:{
        type: Array,
        default: []
    },
    followings:{
        type: Array,
        default:[]
    },
    // isAdmin:{
    //     type: Boolean,
    //     default:false
    // },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin' ],
        default: 'user'
    },
    bio:{
        type: String,
        max: 50
    },
    location:{
        type: String,
        max:50
    },
    relationship:{
        type: Number,
        enum: [1,2,3],
        default: 1
    },
    // guides: [
    //     {
    //         type: mongoose.Schema.ObjectId,
    //         ref: 'Post'
    //     }
    // ],
    post:
        [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Post'
            }
        ],
    passwordResetToken : String,
    passswordResetExpires: Date
},{
    timestamp:true
});


// UserSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id => await Post.findById(id) );
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });


// UserSchema.pre('save', function(next){
//     //Only run if password was modified
//     if(this.isModified('password')) return next();
//     //hash password
//     this.password = bcrypt.hash(this.password, 12);
//     //delete passwordConfirm field
//     this.passwordConfirm = undefined;
//     next();
// })


// UserSchema.methods.correctPassword = async function(
//     candidatePassword, 
//     userPassword
//     ){
//     return await bcrypt.compare(candidatePassword, userPassword);
// }





module.exports= mongoose.model("User", UserSchema);