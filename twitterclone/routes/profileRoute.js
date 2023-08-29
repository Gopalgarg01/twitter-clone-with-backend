const express = require('express');
const app = express();
const router = express.Router();
const bodyparser = require("body-parser");
const User = require("../schema/UserSchema");
const bcrypt = require("bcrypt");

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyparser.urlencoded({extended: false}));

router.get("/:username",async (req, res, next)=>{
    // console.log( req.params.id);
    var payload = {
        pageTitle: req.session.user.username,
        userLoggedIn : req.session.user,
        userLoggedInJS : JSON.stringify(req.session.user),
        postId : req.params.id,
        profileUser: req.session.user
    }
    // var payload = await getPayload(req.params.username, req.session.user);
    // console.log(payload)
    
    res.status(200).render("profilePage", payload);  // 404 is status code like 200 is the status code for success // respone - is something we used to send data back to the user after the user has finished //  , request - the req which is incoming to the path right here, next which handles any middleware
})  
router.get("/:username/replies",async (req, res, next)=>{
    // console.log( req.params.id);
    var payload = {
        pageTitle: req.session.user.username,
        userLoggedIn : req.session.user,
        userLoggedInJS : JSON.stringify(req.session.user),
        postId : req.params.id,
        profileUser: req.session.user
    }
    payload.selectedTab = "replies";
    // var payload = await getPayload(req.params.username, req.session.user);
    // console.log(payload)
    
    res.status(200).render("profilePage", payload);  // 404 is status code like 200 is the status code for success // respone - is something we used to send data back to the user after the user has finished //  , request - the req which is incoming to the path right here, next which handles any middleware
}) 
// async function getPayload(username, userLoggedIn){
//     var user = await User.findOne({username: username})

//     if(user == null){
//         user = await User.findById(username);

//         if(user == null){
//             return{
//                 pageTitle : "user not found",
//                 userLoggedIn : userLoggedIn, 
//                 userLoggedInJS : JSON.stringify(userLoggedIn)
            
//             }

//         }
       
//     }
//     return {
//         pageTitle : req.session.user.username,
//         userLoggedIn : req.session.user,
//         userLoggedInJS : JSON.stringify(req.session.user),
//         postId : req.params.id,
//         profileUser: req.session.user
//     }
// }

module.exports = router;    