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

//Cookies&Sessions
//express-session
const session = require('express-session');
//passport & passport-local
const passport = require('passport');
//passport-local-mongoose
const passportLocalMongoose = require('passport-local-mongoose');

//set up session
app.use(session({
  secret:"Our little secret.",
  resave: false,
  saveUninitialized: false
}));

//initialize passport
app.use(passport.initialize());
//use passport to mannage our sessions
app.use(passport.session());

//mongoose
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
//solve deprecationWarning
mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema ({
  email: String,
  password:String
});

//set up userSchema to use passportLocalMongoose as a plugin
userSchema.plugin(passportLocalMongoose);

//userSchema.plugin(encrypt,{secret: process.env.SECRET, encryptedFields:["password"]});

//md5
//const md5 = require("md5");

//bcrypt
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

const User = new mongoose.model("User",userSchema);

//use passportLocalMongoose to creat a local mongo strategy
//The createStrategy is responsible to setup passport-local LocalStrategy with the correct options.
passport.use(User.createStrategy());
//serializeUser/deserializeUser functions.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


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

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
})

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/")
})

app.post("/register",function(req,res){
  // bcrypt.hash(req.body.password, saltRounds,function(err,hash) {
  //   // Store hash in your password DB.
  //   const newUser = new User({
  //     email: req.body.username,
  //     password: hash
  //   })
  //
  //   newUser.save(function(err){
  //     if(err){
  //       console.log(err);
  //     }else{
  //       res.render("secrets");
  //     }
  //   })
  // });
  //register user
  User.register({username:req.body.username},req.body.password, function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      //authenticate user using passport
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      })
    }
  })
});

app.post("/login",function(req,res){
  // const username = req.body.username;
  // const password = req.body.password;
  //
  // User.findOne({email:username}, function(err,foundUser){
  //   if(err) {
  //     console.log(err);
  //   } else{
  //     if(foundUser) {
  //       bcrypt.compare(password, foundUser.password,function(err,result) {
  //         if(result == true){
  //           res.render("secrets");
  //         }
  //       });
  //     }
  //   }
  // })
  const user =new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  })
});
