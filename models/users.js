var mongoose = require('mongoose');
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
    googleId:String,
    email: String
});

module.exports=mongoose.model('User',UserSchema);