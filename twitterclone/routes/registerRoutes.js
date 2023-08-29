const express = require('express');
const app = express();
const router = express.Router();
const bodyparser = require("body-parser"); //body-parser is a piece of express middleware that reads a form's input and stores it as a javascript object accessible through req.body
const User = require("../schema/UserSchema")
const bcrypt = require("bcrypt");
const session = require("session");


app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyparser.urlencoded({extended: false}));


router.get("/", (req, res, next)=>{   
    
    res.status(200).render("register");  // 404 is status code like 200 is the status code for success // respone - is something we used to send data back to the user after the user has finished //  , request - the req which is incoming to the path right here, next which handles any middleware
})   

 router.post("/", async (req, res, next)=>{

    var firstname = req.body.firstname.trim();
    var lastname = req.body.lastname.trim();
    var username = req.body.username.trim();
    var email = req.body.email.trim();
    var password = req.body.password;
    // res.status(200).render("register"); 

    var payload = req.body;

   
    if(firstname && lastname && username && email && password){
        var user = await User.findOne({ 
            $or:[
                {username : username},
                {email : email}
            ]
         })
         .catch((error)=>{
            console.log(error);
            payload.errorMessage = "Something went wrong";
            res.status(200).render("register",payload); 
         })
         if(user == null){
            var data = req.body;

            data.password = await bcrypt.hash(password , 10); 

            User.create(data)
            .then((user)=>{
                req.session.user = user;
                return res.redirect("/");
            })
         }else{
            if(email == user.email){
                payload.errorMessage = "Email already in use";
            }else{
                payload.errorMessage = "username already in use";
            }
            res.status(200).render("register", payload); 
         }
        // .then((user)=>{
        //     console.log(user);
        // })
        console.log("helooo");
    }
    else{
        // console.log("heelo i am here");
        payload.errorMessage = "Make sure each field has a valid value";
        res.status(200).render("register", payload);
    }
})  

module.exports = router;    