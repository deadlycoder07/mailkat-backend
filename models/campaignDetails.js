var mongoose = require('mongoose');
var {Schema}=mongoose;
const emailDetails = require('./emailDetails')
const users = require('./users')

var campaignSchema= new Schema({
    campaignName:{
        type:String,
        required:true,
        unique:true
    },
    emailDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:emailDetails
    },
    userDetails:{
        type:mongoose.Schema.Types.ObjectId,
        ref:users
    },
});

module.exports=mongoose.model('CampaignDetails',campaignSchema);