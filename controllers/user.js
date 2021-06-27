const Users = require("../models/users");
const {OAuth2Client} = require('google-auth-library');
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

exports.googleLogin = async (req ,res) => {
    try{
        var googleAccessToken = req.body.accessToken;
        var googleRefreshToken = req.body.refreshToken;
        const client = new OAuth2Client(process.env.CLIENT_ID);
        async function verify() {
          const ticket = await client.verifyIdToken({
              idToken: req.body.idToken,
              audience: "407408718192.apps.googleusercontent.com"
          });
          const payload = ticket.getPayload();
          const userid = payload['sub'];

          const user = await Users.findOne({email:payload['email']});
          if(!user){
            var username= payload['email'];
            var email = payload['email'];
            console.log(email);
            var googleId = userid;
            var name = payload['name'];
            newUser=await Users.create({
                username,
                email,
                name,
                googleId,
                googleAccessToken,
                googleRefreshToken
            })
            var token = await newUser.generateAuthToken();
            var data = {
                _id: newUser._id,
                message:"Successfully logged in!",
                name: newUser.name,
                username:newUser.username,
                email:newUser.email,
                token:token,
                expiresIn: 36000,
            }
            res.status(200).send(data);
          }else{
            user.googleAccessToken = googleAccessToken;
            user.googleRefreshToken = googleRefreshToken;   
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
            user.save();
            res.status(200).send(data);
          }
        }
        verify().catch(console.error);
    }catch(e){
        console.log(e);
        res.status(403).send({"message": "failed to login "})
    }
}