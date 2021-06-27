const express= require('express')
const Users= require('../models/users');
const userRouter= express.Router();
const passport= require('passport')
const userController = require('../controllers/user');
//signup
userRouter.post('/signup',userController.signUp);
//login
userRouter.post('/login', userController.loginUser);

userRouter.post('/google',userController.googleLogin);

userRouter.route('/logout')
.get((req,res,next)=>{
    if(req.user)
    {
        req.logout();
        res.status(200)
        res.json({"message":"Successfully Logged Out!"})
        return res;
    }
    else
    {
        console.log("User not logged in")
        res.status(400)
        res.json({"message":"You are not logged in!"})
    }
});

userRouter.get('/google/redirect',passport.authenticate('google',{failureRedirect:'/login'}),(req,res)=>{
    res.redirect('/')
});

module.exports=userRouter;