const mongoose = require("mongoose");

class Database{
    constructor(){
        this.connect();
    }

    connect(){
        mongoose.set('strictQuery', false); // if strict query is true the undefined value in schema will save in the db.
        mongoose.connect("mongodb+srv://admin:mongodb@twitterclone.asgjzds.mongodb.net/twitterclonedb?retryWrites=true&w=majority",{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            })
        .then(()=>{
            console.log("database connection successful");
        })
        .catch((error)=>{
            console.log("database connection error" + error);
        })


    }
}
module.exports = new Database();