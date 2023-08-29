const express = require('express');
const app = express();
const router = express.Router();
const bodyparser = require("body-parser");
const User = require("../../schema/UserSchema");
const Post = require("../../schema/postSchema");
const bcrypt = require("bcrypt");

app.use(bodyparser.urlencoded({extended: false}));

router.get("/", async (req, res, next)=>{
    // Post.find()
    // .populate("postedBy")
    // .populate("retweetData")
    // .sort({"createdAt" : -1})
    // .then(async (results)=>{
    //     results = await User.populate(results, {path : "retweetData.postedBy"});
    //     res.status(200).send(results);
    // })
    // .catch(error=>{
    //     console.log(error);
    //     res.sendStatus(400);
    
    // })

    var searchObj = req.query;
    console.log(searchObj);
    if(searchObj.isReply !== undefined){
        var isReply = searchObj.isReply == "true";
        searchObj.replyTo = {$exists : isReply};
        delete searchObj.isReply;
        console.log(searchObj);
    }
    
    var results = await getposts({});
    res.status(200).send(results);
    
      // 404 is status code like 200 is the status code for success // respone - is something we used to send data back to the user after the user has finished //  , request - the req which is incoming to the path right here, next which handles any middleware
})  
router.get("/:id",async (req, res, next)=>{

    var postId = req.params.id;

    var postData = await getposts({ _id: postId});
    postData = postData[0];

    var results = {
        postData: postData

    }

    if(postData.replyTo != undefined){
        results.replyTo = postData.replyTo;
    }
    results.replies = await getposts({ replyTo: postId});
    res.status(200).send(results);
    
    
      // 404 is status code like 200 is the status code for success // respone - is something we used to send data back to the user after the user has finished //  , request - the req which is incoming to the path right here, next which handles any middleware
}) 



router.post("/", async(req, res, next)=>{   
    
    if(!req.body.content){
        console.log("contant param not sent with request");
        return res.sendStatus(400);
    }
    
    var postData = {
        content: req.body.content,
        postedBy: req.session.user
    }

    if(req.body.replyTo){
        postData.replyTo = req.body.replyTo;
        
    }

    Post.create(postData)
    .then(async newPost =>{        
        newPost = await User.populate(newPost , {path:"postedBy"})
        res.status(201).send(newPost);
    })
    .catch((error) =>{ 
        console.log(error);
        req.sendStatus(400);
    })
}) 

router.put("/:id/like", async (req, res, next) => {
    
    var postId = req.params.id;
    var userId = req.session.user._id;
    let a = req.session.user.likes;
    let b = req.session.user.likes.includes(postId);
    var isLiked = req.session.user.likes && req.session.user.likes.includes(postId);
    // console.log(a);
    // console.log(b);



    var option = isLiked ? `$pull`: `$addToSet`;
    console.log(option);

    const updateOptions = { [option]: { likes: postId } };

    

    req.session.user = await User.findByIdAndUpdate(userId, updateOptions, {new: true}  )
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })


    const updatePostOptions = { [ option ]: { likes: userId } };
    var post = await Post.findByIdAndUpdate(postId, updatePostOptions, {new: true}  )
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
    console.log("post");

    res.status(200).send(post);
})



router.post("/:id/retweet", async (req, res, next) => {
    
    var postId = req.params.id;
    var userId = req.session.user._id;   
    

    var deletePost = await Post.findOneAndDelete({postedBy: userId, retweetData : postId  })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    var option = deletePost != null ? `$pull`: `$addToSet`;

    var repost = deletePost;

    if(repost == null){
        repost = await Post.create({ postedBy: userId, retweetData: postId})
        .catch(error =>{
            console.log(error);
            res.sendStatus(400);
        })
    }


    const updateRetweet = { [ option ]: { retweets: repost._id } };
    req.session.user = await User.findByIdAndUpdate(userId, updateRetweet, {new: true}  )
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    const updatePostRetweet = { [ option ]: { retweetUsers: userId} };
    var post= await Post.findByIdAndUpdate(postId, updatePostRetweet, {new: true}  )
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
    // console.log("option");

    res.status(200).send(post);
})

router.delete("/:id", (req, res, next)=>{
    Post.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

async function getposts(filter){
    var results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({"createdAt" : -1})
    .catch(error=>{
        console.log(error);
         
    })    

    results = await User.populate(results, {path: "replyTo.postedBy"})
    return await User.populate(results, {path : "retweetData.postedBy"});      
    
}

module.exports = router;                // pug is a template engine
