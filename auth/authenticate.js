var passport= require('passport');
var User= require('../models/users');
var GoogleStrategy=require('passport-google-oauth20');
var LocalStrategy = require('passport-local').Strategy;

require('dotenv').config();

passport.serializeUser((user,done)=>{
    done(null,user.id);
});
passport.deserializeUser((id,done)=>{
    User.findById(id)
    .then((user)=>{
        done(null,user)
    });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({$or:[ {username: username},{email:username} ]}, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        console.log("No user with that username")
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      if (user.password!==password) {
        console.log("password not matching ",user);
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      console.log("Successful Login ",user);
      return done(null, user);
    });
  }
));

passport.use(
    new GoogleStrategy({
        callbackURL:`/auth/google/redirect`,
        clientID:process.env.google_client_id,
        clientSecret:process.env.google_client_secret
},(accessToken,refreshToken,profile,done)=>{
    console.log("profile:",profile._json.email)
    User.findOne({email:profile._json.email})
    .then((user)=>{
        if(user===null)
        {
            new User({
                username:profile.displayName,
                name:`${profile.name.givenName} ${profile.name.familyName}`,
                googleId:profile.id,
                email:profile._json.email,
            }).save()
            .then((user)=>{
                // console.log("new user created",user)
                done(null,user)
            })
            .catch((err)=>{
                console.log(err);
            })
        }
        else{
            console.log("already present");
            done(null,user)
        }
    })
    .catch(err=>{
        console.log(err)
    })
}))