const Users = require("../models/users");

exports.signUp = async(req, res, next)=>{
    // console.log(req.body);
    var {username, password, email}=req.body;
    user=await Users.findOne({$or:[{username},{email:email}]});
    if(user!==null)
    {
        console.log("Already exists");
        res.setHeader("Content-Type","application/json");
        res.status(400);
        res.json({"message":"User with that username or email already exists!!"});
        return res;
    }
    newUser=await Users.create({
        username,
        password,
        email
    })
    console.log(newUser);
    var token = await newUser.generateAuthToken();
    res.setHeader("Content-Type","application/json");
    res.status(200);
    res.json({token: token ,message:"Successfully Signed Up!"});
};

exports.loginUser = async (req, res, next) => {
    try {
      const user = await Users.findByCredentials(req.body.username, req.body.password);
      const token = await user.generateAuthToken();
      var data = {
          _id: user._id,
          message:"Successfully logged in!",
          name: user.name,
          username:user.username,
          email:user.email,
          token:token,
          expiresIn: 36000,
      }
      res.status(200).send(data);
    }catch(e){
        console.log(e);
        res.status(400).send(e);
    }
};