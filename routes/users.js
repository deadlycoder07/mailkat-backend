const express= require('express')
const Users= require('../models/users');
const userRouter= express.Router();
const passport= require('passport')

userRouter.route('/signup')
.post(async(req, res, next)=>{
    // console.log(req.body);
    var {username, password, email}=req.body;
    user=await Users.findOne({$or:[{username},{email:email}]});
    if(user!==null)
    {
        console.log("Already exists");
        res.setHeader("Content-Type","application/json");
        res.status(400);
        res.json("User with that username or email already exists!!");
        return res;
    }
    newUser=await Users.create({
        username,
        password,
        email
    })
    console.log(newUser);

    res.setHeader("Content-Type","application/json");
    res.status(200);
    res.json({message:"Successfully Signed Up!"});
})

userRouter.post('/login', passport.authenticate('local'),(req,res,next)=>{
    res.status(200)
    res.send("successful login");
    return res;
});

userRouter.get('/google',passport.authenticate('google',{scope:['profile','email']
}));

userRouter.route('/logout')
.get((req,res,next)=>{
    if(req.user)
    {
        req.logout();
        res.status(200)
        res.send("Successfully Logged Out!")
        return res;
    }
    else
    {
        console.log("User not logged in")
        res.status(400)
        res.send("You are not logged in!")
    }
});

userRouter.get('/google/redirect',passport.authenticate('google',{failureRedirect:'/login'}),(req,res)=>{
    res.redirect('/')
});

module.exports=userRouter;