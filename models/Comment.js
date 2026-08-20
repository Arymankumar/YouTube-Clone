

import mongoose,{Schema} from "mongoose";
const mongoose =require('mongoose')
const commentSchema=new Schema(
{
    content:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true

    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video",
        required:true

    },
},
{
    timestamps:true,
}
);
module.exports=mongoose.model('Comment',CommentSchema)

