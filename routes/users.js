const express= require('express')
const Users= require('../models/users');
const userRouter= express.Router();
const passport= require('passport')

userRouter.route('/signup')
.post(async(req, res, next)=>{
    // console.log(req.body);
    var username=req.body.username;
    var password=req.body.password;
    console.log(username);
    user=await Users.findOne({username});
    if(user!==null)
    {
        console.log("Already exists");
        res.setHeader("Content-Type","application/json");
        res.status(400);
        res.json("User with that username already exists!!");
        return res;
    }
    newUser=await Users.create({
        username,
        password
    })
    console.log(newUser);

    res.setHeader("Content-Type","application/json");
    res.status(200);
    res.json({message:"Successfully Signed Up!"});
})

userRouter.post('/login', passport.authenticate('local', {successRedirect:'/', failureMessage: "Incorrect Username or Password!"}));

userRouter.get('/google',passport.authenticate('google',{scope:['profile','email']
}));

userRouter.route('/logout')
.get((req,res,next)=>{
    if(req.user)
    {
        req.logout();
        res.redirect('/')
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