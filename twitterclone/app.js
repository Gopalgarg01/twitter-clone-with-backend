const express = require('express');
const app = express();
const port = 3000;                                  //set the port no. 3003
const middleware = require('./middleware');
const path = require("path");
const bodyparser = require("body-parser");
const mongoose = require("./databse");
const session = require("express-session");



const server= app.listen (port, ()=> console.log("server listening on port 3000"));

app.set("view engine", "pug");
app.set("views", "views");

// routes
const loginRoute = require("./routes/loginRoutes");
const logoutRoute = require("./routes/logout");
const registerRoute = require("./routes/registerRoutes");
//api routes
const postRoute = require("./routes/postRoutes")
const profileRoute = require("./routes/profileRoute")
const postApiRoute = require("./routes/api/posts")

const { Session } = require('session/lib/session');

app.use(bodyparser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname , "public"))); //it means anything in public is serve as a static files and can directly accesible
app.use(session({
    secret : "big chips",
    resave : true,
    saveUnintialised: false
}))

app.use("/login", loginRoute);
app.use("/logout", logoutRoute);
app.use("/register", registerRoute);
app.use("/posts", middleware.requireLogin, postRoute);
app.use("/profile/", middleware.requireLogin, profileRoute);

app.use("/api/posts", postApiRoute)
// Get requests are mean to fetch data from specified resources and POST requets are meant to submit data to a specified resource

app.get("/", middleware.requireLogin, (req, res,
     next)=>{
    var payload = {
        pageTitle: "Home",                   // payload is term which is used to refer to a database sending to a function
        userLoggedIn : req.session.user,
        userLoggedInJS : JSON.stringify(req.session.user),
        profileUser: req.session.user
    }

    res.status(200).render("Home", payload);  // 404 is status code like 200 is the status code for success // respone - is something we used to send data back to the user after the user has finished //  , request - the req which is incoming to the path right here, next which handles any middleware
})  



app.set("view engine", "pug");                  // pug is a template engine
