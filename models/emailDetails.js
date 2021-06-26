var mongoose = require('mongoose');
var {Schema}=mongoose;

var emailSchema= new Schema({
    campaignName:{
        type:String,
        required:true,
        unique:true
    },
    to:[
        {
            type:String,
            required:true
        }
    ],
    cc:[{type:String}],
    bcc:[{type:String}]
});

module.exports=mongoose.model('EmailDetails',emailSchema);