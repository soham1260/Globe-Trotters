require('dotenv').config()
const mongoose = require('mongoose');
const express = require('express');
mongoose.connect(process.env.DB);
const app = express();
var cors = require("cors");
app.use(cors());
app.use(express.json());

const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.listen(5000,() => {
    console.log("Listening to port 5000");
    console.log("Logging on console "+new Date());
})

const postSchema = new mongoose.Schema({
    date : {type : Date, default : Date.now},
    title : {type : String, required : true},
    content: {type : String, required : true},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: {type: String}
});
const Post = mongoose.model("Post",postSchema);

const userSchema = new mongoose.Schema({
    name: {type: String,required: true},
    email:{type: String,required: true},
    password : {type : String, required : true},
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});
const User = mongoose.model('User', userSchema);

const JWT_SECRET = process.env.JWT;

app.post('/signup', [
            body('name', 'name').isLength({ min: 3 }),
            body('email', 'email').isEmail(),
            body('password', 'password').isLength({ min: 5 }),
        ], (req, res) => {
        
        const errors = validationResult(req);

        if (!errors.isEmpty()) 
        {
            return res.status(400).json({ errors: errors.array() });
        }

        User.findOne({ email: req.body.email })
        .then((user) => {
            if(user) throw new Error("UserExistsError");
        })
        .then(()=>{
            return bcrypt.genSalt(10);
        })
        .then((salt) => {
            return bcrypt.hash(req.body.password, salt);
        })
        .then((secPass) => {
            return User.create({
                name: req.body.name,
                password: secPass,
                email: req.body.email,
            });
        })
        .then((user) => {
            const data = {
            user:{
                id: user.id
            }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true
            console.log(new Date().toLocaleString([], { hour12: false })+" : New user" + user.email + " signed in");
            res.json({success,authtoken})
        })
        .catch ((error) => {
        console.error(error.message);
        if (error.message === "UserExistsError") {
            res.status(400).json({success : false, errors: [{msg : "exist"}] });
        } else {
            console.log(new Date().toLocaleString([], { hour12: false })+" : " +error.message);
            res.status(500).send("Internal Server Error");
        }
        })
})

app.post('/login', [ 
            body('email', 'Enter a valid email').isEmail(), 
            body('password', 'Password cannot be blank').exists(), 
        ], (req, res) => {
    
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
    
        const {email, password} = req.body;
        User.findOne({email})
        .then((user) => { 
            if(!user){
                throw new Error("Invalid email or password");
            }
            return Promise.all([user.id, bcrypt.compare(password, user.password)]);
        })
        .then(([x,passwordCompare]) => {
            if(!passwordCompare){
                throw new Error("Invalid email or password"); 
            }
            const data = {
            user:{
                id: x
            }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            console.log(new Date().toLocaleString([], { hour12: false })+" : " + email + " logged in");
            res.json({success : true, authtoken});
        })
        .catch((error) => {
            if(error.message === "Invalid email or password") 
            {
                console.log(new Date().toLocaleString([], { hour12: false })+" : " +error.message+" "+email);
                res.status(400).json({success : false, error: "Please try to login with correct credentials"});
            }
            else
            {
                console.log(new Date().toLocaleString([], { hour12: false })+" : " +error.message);
                res.status(500).send("Internal Server Error");
            }
        })
  })

const fetchuser = (req,res,next ) => {
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error : "Invalid token"});
    }

    try {
        const data = jwt.verify(token,JWT_SECRET);
        req.user = data.user;
        console.log(new Date().toLocaleString([], { hour12: false })+" : JWT verified user " + req.user.id);
        next();
    } catch (error) {
        console.log(new Date().toLocaleString([], { hour12: false })+" : JWT verification failed");
        res.status(401).send({error : "Invalid token"});
    }
}

app.post('/compose' ,fetchuser,[
        body('title', 'Enter a valid title').exists(),
        body('content', 'Content must be atleast 5 characters').exists(),
    ] , async (req,res) => {
    try
    {    
        const {title,content} = req.body;
        console.log(title);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const user = await User.findById(req.user.id);
        const post = new Post ({
            title,content,user:req.user.id,name:user.name
        })
        const savedpost = await post.save();
        user.posts.push(savedpost.id);
        await user.save();

        res.json(savedpost);
    }
    catch(error)
    {
        console.log(new Date().toLocaleString([], { hour12: false })+" : " +error.message);
        res.status(500).send("Internal Server Error");
    }
})

app.put('/updatepost/:id' ,fetchuser , async (req,res) =>{
    const {title,content} = req.body;
    try {
        const newpost = {};

        if(title){newpost.title = title};
        if(content){newpost.content = content};

        let post = await Post.findById(req.params.id);
        if(!post) {return res.status(404).send("Not found")};

        if(post.user.toString() !== req.user.id) {return res.status(401).send("Unauthorized")};

        post = await Post.findByIdAndUpdate(req.params.id , {$set : newpost}, {new : true});
        res.json(post);
    } catch (error) {
        console.log(new Date().toLocaleString([], { hour12: false })+" : " +error.message);
        res.status(500).send("Internal Server Error");
    }
})

app.delete('/deletepost/:id' ,fetchuser , async (req,res) =>{
    try {
        let post = await Post.findById(req.params.id);
        if(!post) {return res.status(404).send("Not found")};

        if(post.user.toString() !== req.user.id) {return res.status(401).send("Unauthorized")};

        await Post.findByIdAndDelete(req.params.id);
        let user= await User.findById(req.user.id);
        user.posts.remove(req.params.id);
        await user.save();
        res.send(true);
    } catch (error) {
        console.log(new Date().toLocaleString([], { hour12: false })+" : " +error.message);
        res.status(500).send("Internal Server Error");
    }
})

app.get('/fetchposts' ,fetchuser, async (req,res) => {
    try {
        const posts = await Post.find({user : req.user.id})
        res.json(posts);
    } 
    catch (error) {
        console.log(new Date().toLocaleString([], { hour12: false })+" : " +error.message);
        res.status(500).send("Internal Server Error");
    }
})

app.get('/fetchallposts' ,fetchuser, async (req,res) => {
    try {
        const posts = await Post.find()
        res.json(posts);
    } 
    catch (error) {
        console.log(new Date().toLocaleString([], { hour12: false })+" : " +error.message);
        res.status(500).send("Internal Server Error");
    }
})