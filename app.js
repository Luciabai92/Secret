//jshint esversion:6
//dotenv
//require('dotenv').config()
//express
const express = require("express");
const app = express();
app.use(express.static("public")); //put css/image files into public folder

//body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//ejs
app.set('view engine', 'ejs');

//mongoose
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema ({
  email: String,
  password:String
});

//userSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields:["password"]});

//md5
const md5 = require("md5");

//bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;

const User = new mongoose.model("User",userSchema);

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  bcrypt.hash(req.body.password, saltRounds,function(err,hash) {
    // Store hash in your password DB.
    const newUser = new User({
      email: req.body.username,
      password: hash
    })

    newUser.save(function(err){
      if(err){
        console.log(err);
      }else{
        res.render("secrets");
      }
    })
  });
});

app.post("/login",function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email:username}, function(err,foundUser){
    if(err) {
      console.log(err);
    } else{
      if(foundUser) {
        bcrypt.compare(password, foundUser.password,function(err,result) {
          if(result == true){
            res.render("secrets");
          }
        });
      }
    }
  })
})
