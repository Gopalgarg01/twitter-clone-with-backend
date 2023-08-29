const express = require('express');
const app = express();
const router = express.Router();
const bodyparser = require("body-parser");
const User = require("../schema/UserSchema");
const bcrypt = require("bcrypt");

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyparser.urlencoded({extended: false}));

router.get("/", (req, res, next)=>{
    
    res.status(200).render("login");  // 404 is status code like 200 is the status code for success // respone - is something we used to send data back to the user after the user has finished //  , request - the req which is incoming to the path right here, next which handles any middleware
})  
router.post("/", async(req, res, next)=>{
    var payload = req.body;
    
    if(req.body.logUsername && req.body.logPassword){
        var user = await User.findOne({ 
            $or:[
                {username : req.body.logUsername},
                {email : req.body.logUsername}
            ]
         })
         .catch((error)=>{
            console.log(error);
            payload.errorMessage = "Something went wrong";
            res.status(200).render("login",payload); 
         });
         if(user!=null){
            var result = await bcrypt.compare(req.body.logPassword, user.password);
            if(result === true){
                req.session.user = user;
                return res.redirect("/");
            }
         }
         payload.errorMessage = "Login credentials incorrect";
         return res.status(200).render("login",payload);


    }
    payload.errorMessage = "Make sure the field has a valid vallue";
    res.status(200).render("login",payload);
})      

module.exports = router;                // pug is a template engine
