var mongoose = require('mongoose');
var {Schema}=mongoose;
const users = require('./users')

var emailSchema= new Schema({
    to:[
        {
            type:String,
            required:true
        }
    ],
    cc:[{type:String}],
    bcc:[{type:String}],
    userDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:users
    },
});

module.exports=mongoose.model('EmailDetails',emailSchema);