const mongoose= require('mongoose');
const User= require('./../models/User');

const PostSchema= new mongoose.Schema({

    userId:[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    description:{
        type: String,
        max:590
    },
    image:{
        type: String
    },
    likes:{
        type: Array,
        default: []
    },
},{
    timestamp:true
});

 

module.exports= mongoose.model("Post", PostSchema);
