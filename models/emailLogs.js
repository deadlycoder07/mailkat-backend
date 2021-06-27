var mongoose = require('mongoose');
const emailDetails = require('./emailDetails');
const users = require('./users');
var {Schema}=mongoose;

var emailLogs= new Schema({
    recurrence:{
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
    emailDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:emailDetails
    },
    userDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:users
    },
    sent:{
        type:Boolean,
        default:false
    },
    lastSent:{
        type:Date,
    },
    nextScheduleTime:{
        type:Date,
    },
    task_id:{
        type:Number
    }
});

module.exports=mongoose.model('emailLogs',emailLogs);