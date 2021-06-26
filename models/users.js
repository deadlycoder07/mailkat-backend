var mongoose = require('mongoose');
const emailDetails = require('./emailDetails');

var {Schema}=mongoose;

var UserSchema= new Schema({
    username:{
        type:String,
        default:''
    },
    password:{
        type:String,
        default:''
    },
    name:{
        type:String,
        default:''
    },
    emailVerified:{
        type:Boolean
    },
    Tokens:{
        accessToken:String,
        refreshToken:String
    },
    googleId:String,
    email: String,
    clients: {
        type: mongoose.Schema.Types.ObjectId,
        ref:emailDetails
    }
});

module.exports=mongoose.model('User',UserSchema);