const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');
const flash = require("connect-flash");


const homeStartingContent = "Globe Trotters, a travel blog for those who love to explore the world and its wonders. Whether you’re looking for inspiration, tips, or stories, you’ll find them here. We as a community share our adventures and experiences from different countries and cultures. We’ll show you the best places to visit, the most amazing things to do, and the most delicious food to eat. We’ll also give you honest and helpful advice on how to travel smarter, cheaper, and better. Globe Trotters is more than just a travel blog. It’s a community of passionate travellers who want to make the most of their journeys and live their dreams 😊";
const aboutContent = "From a wanderer to a wanderer. This is Soham Khatavkar, the creater of this webpage.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://1260soham:<password>@cluster0.yaniyqu.mongodb.net/BlogDB", { useNewUrlParser: true, useUnifiedTopology: true })
.catch(error => console.log(error));

const userSchema = new mongoose.Schema({
  name: String,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Post = mongoose.model("Post",postSchema);


app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.post("/register", function (req, res) {
  User.findOne({ username: req.body.username })
    .then(existingUser => {
      if (existingUser) {
        return res.render("register", { errormail: "Email already registered, please proceed to login", errorname: null });
      }

      User.findOne({ name: req.body.name })
        .then(existingname => {
          if (existingname) {
            return res.render("register", { errorname: "User already registered, please proceed to login", errormail: null });
          }

          User.register({ username: req.body.username, name: req.body.name }, req.body.password)
            .then(user => {
              passport.authenticate("local")(req, res, function () {
                res.redirect("/home");
              });
            })
            .catch(err => {
              console.log(err);
              return res.render("register", { errorMessage: "An error occurred. Please try again later." });
            });
        })
        .catch(err => {
          console.error(err);
          return res.render("register", { errorMessage: "An error occurred. Please try again later." });
        });
    })
    .catch(err => {
      console.error(err);
      return res.render("register", { errorMessage: "An error occurred. Please try again later." });
    });
});


app.post("/login", passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/login",
  failureFlash: true
}));

app.get("/home",ensureAuthenticated, function(req, res) {
      Post.find({})
      .populate('user') // POSTS CONTAIN USER ID(REFERENCE) INSTEAD OF THEIR DATA
      .then(posts => {
          res.render("home", {
              startingContent: homeStartingContent,
              posts: posts
          });
      })
      .catch(error => {
          console.error('Error fetching posts:', error);
          res.redirect('/home');
      });
});

app.post("/compose", ensureAuthenticated, function(req, res) {
  const post = new Post({
      title: req.body.postTitle,
      content: req.body.postBody,
      user: req.user._id // USER ID OF CURRENTLY LOGGED USER
  });

  post.save()
  .then(savedPost => {
      console.log('Post saved successfully');
      User.findByIdAndUpdate(req.user._id, { $push: { posts: savedPost._id } })// USER HAS ARRAY OF POST_ID
        .then(() => {
          console.log('User posts array updated successfully');
          res.redirect('/home');
        })
        .catch(error => {
          console.error('Error updating user posts array:', error);
          res.redirect('/home');
        });
  })
  .catch(error => {
      console.error('Error saving post:', error);
      res.redirect('/home');
  });
});

app.post("/delete", ensureAuthenticated, function(req, res) {
      const postTitle = req.body.postTitle;

      Post.findOne({ title: postTitle })
      .populate('user')
      .then(post => {
          if (!post) {
              console.log('Post Not Found');
              return res.render('delete',{error:"Post Not Found"});
          }

          if (post.user._id.equals(req.user._id)) {
              return post.deleteOne()
                .then(() => {
                  console.log('Post deleted successfully');
                  return res.redirect('/home');
                });
          } 
          else {
              console.log('Unauthorized to delete this post');
              return res.render('delete',{error:"Unauthorized to delete this post"});
          }
      })
      .catch(error => {
          console.error('Error deleting post:', error);
          res.redirect('/home');
      });
});

app.get("/", function (req, res) {
  res.render("register",{errorname:null,errormail:null});
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/login", function (req, res) {
  res.render("login",{ messages: req.flash() });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.get("/delete", function(req, res){
  res.render("delete",{error:null});
});

app.get("/my-posts", ensureAuthenticated, function(req, res) {
  const userId = req.user._id; // Use the currently authenticated user's ID
  
  User.findOne({_id:userId })
    .populate("posts")
    .then(user => {
      if (!user) {
        // User not found
        return res.redirect("/home");
      }
      res.render("userposts", {
        posts: user.posts
      });
    })
    .catch(error => {
      console.error("Error fetching user's posts:", error);
      res.redirect("/home");
    });
});

app.get("/posts/:postID", function(req, res){
  const requestedPostId  = req.params.postID;

  Post.findOne({_id:requestedPostId })
  .populate('user')
  .then((post) =>
      res.render("post", {
        title: post.title,
        content: post.content,
        name:post.user.name
      })
    )
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    req.logout(function () {}); // Add a dummy callback function
    res.redirect("/");
  });
});



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next(); // User is authenticated, proceed to the next middleware
  }
  // User is not authenticated, redirect to login page or handle it accordingly
  res.redirect('/login'); // Change this to your desired redirection path
}


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
