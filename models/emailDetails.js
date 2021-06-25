var mongoose = require('mongoose');
var {Schema}=mongoose;

var emailSchema= new Schema({
    campaignName:{
        type:String,
        required:true
    },
    to:[{type:String}],
    cc:[{type:String}],
});

module.exports=mongoose.model('EmailDetails',emailSchema);