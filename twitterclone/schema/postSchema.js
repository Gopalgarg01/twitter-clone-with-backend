const mongoose = require("mongoose");
const User = require("../schema/UserSchema");

const Schema  =  mongoose.Schema;

const postSchema = new Schema({
   
    content: {type: String , trim: true},
    postedBy: {type: Schema.Types.ObjectId, ref: 'User'},
    pinned : Boolean,
    likes : [{type: Schema.Types.ObjectId, ref: 'User'}],
    retweetUsers : [{type: Schema.Types.ObjectId, ref: 'User'}],
    retweetData : {type: Schema.Types.ObjectId, ref: 'Post'},
    replyTo : {type: Schema.Types.ObjectId, ref: 'Post'},

 },{timestamps: true});

var Post = mongoose.model('Post', postSchema );

module.exports = Post;