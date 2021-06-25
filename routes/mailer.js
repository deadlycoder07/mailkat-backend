const express= require('express')
const emailDetails= require('../models/emailDetails');
const mailRouter= express.Router();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const emailLogs = require('../models/emailLogs');

require('dotenv');

mailRouter.route('/send')
.post(async(req, res, next)=>{
    var {campaignName, subject, body, second='*', minute='*', hour='*', dayOfMonth='*', month='*', dayOfWeek='*', recurrence=null}=req.body;
    console.log(recurrence, second, minute, hour, month, dayOfMonth, dayOfWeek);
    var campaign = await emailDetails.findOne({campaignName})

    // console.log(campaign.to.concat(campaign.cc));

    var transporter = nodemailer.createTransport({
    // host: 'mail.weblikate.com',
    service: 'gmail',
    auth: {
        user: process.env.auth_emailid,
        pass: process.env.auth_password
    }
    });
    
    var mailOptions = {
        from: process.env.auth_emailid,
        to:campaign.to,
        cc:campaign.cc,
        subject: subject,
        html: body
    };
    cron_schedule_string=`*/${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`

    cron.schedule(cron_schedule_string,()=>{
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                emailLogs.create({
                    recurring, subject, body, second, minute, hour, dayOfMonth, month, month, dayOfWeek, 
                    campaignDetails:campaign._id
                })
                res.status(200);
                res.json({"status":"mail sent"});
                console.log('Email sent: ' + info.response);
                return res;
            }
        }); 
    })
})

mailRouter.route('/createCampaign')
.post(async(req,res,next)=>{
    // console.log(req.body)
    var {campaignName, recepients, cc}=req.body;
    console.log(typeof(recepients));
    try {
        newCampaign=await emailDetails.create({
            campaignName,
        });
        var camp=await emailDetails.updateOne({_id:newCampaign._id},{
            $push: {
                to: { $each: recepients},
                cc: { $each: cc }
            }
        })
        res.status(201);
        res.send("Campaign created!");
        return res;
        
    } catch (error) {
        console.log(error);
        next();
    }
})

module.exports=mailRouter;