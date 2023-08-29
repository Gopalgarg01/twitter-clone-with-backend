const express = require('express');
const app = express();
const router = express.Router();
const bodyparser = require("body-parser");
const User = require("../schema/UserSchema");
const bcrypt = require("bcrypt");

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyparser.urlencoded({extended: false}));

router.get("/:id",async (req, res, next)=>{
    
    var payload = {
        pageTitle: "View Post",
        userLoggedIn : req.session.user,
        userLoggedInJS : JSON.stringify(req.session.user),
        postId : req.params.id,
        profileUser: req.session.user
    }
 
    
    res.status(200).render("postPage", payload);  // 404 is status code like 200 is the status code for success // respone - is something we used to send data back to the user after the user has finished //  , request - the req which is incoming to the path right here, next which handles any middleware
})  
// router.post("/", async(req, res, next)=>{
   
   
//     res.status(200).render("post");
// })      

module.exports = router;    