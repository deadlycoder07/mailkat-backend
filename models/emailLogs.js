var mongoose = require('mongoose');
const emailDetails = require('./emailDetails');
const users = require('./users');
var {Schema}=mongoose;

var emailLogs= new Schema({
    recurring:{
        type:String,
        default:null
    },
    subject:{
        type:String,
        default:''
    },
    body:{
        type:String,
        default:''
    },
    second:{
        type:String,
        default:"*"
    },
    minute:{
        type:String,
        default:"*"
    },
    hour:{
        type:String,
        default:"*"
    },
    dayOfMonth:{
        type:String,
        default:"*"
    },
    month:{
        type:String,
        default:"*"
    },
    dayOfWeek:{
        type:String,
        default:"*"
    },
    campaignDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:emailDetails
    },
    userDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:users
    }
});

module.exports=mongoose.model('emailLogs',emailLogs);