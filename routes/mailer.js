const express= require('express')
const emailDetails= require('../models/emailDetails');
const mailRouter= express.Router();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const emailLogs = require('../models/emailLogs');
const users = require('../models/users');
const parser = require('cron-parser');
const schedule = require('node-schedule');
const mailController = require('../controllers/mailer');
require('dotenv');

const url_taskMap = {};

mailRouter.post('/send', mailController.sendEmail);

mailRouter.route('/stopSchedule')
.get(async(req,res,next)=>{
    const {taskNumber}=req.query
    console.log(taskNumber,url_taskMap[taskNumber])
    url_taskMap[taskNumber].stop();
    try {
        updatedLog=await emailLogs.findOneAndUpdate({task_id:taskNumber},{recurrence:null})
        console.log("after stop",updatedLog)
        res.status(200);
        res.json({"message":`Task ${taskNumber} successfully terminated`});   
    } catch (error) {
        console.log(error)
    }
})

mailRouter.route('/history')
.get(async(req,res,next)=>{
    if(!req.user)
    {
        res.status(401);
        res.json({"message":"You need to login first!"})
        return res;
    }
    try{
        var user=await users.findOne(req.user)
        // console.log(user);
        var logs= await emailLogs.find({userDetails:user._id, sent:true}).populate('campaignDetails').populate('userDetails')
        // console.log(logs)
        history=logs.map(log=>{
            return ({
                recurrence: log.recurrence,
                subject: log.subject,
                to: log.campaignDetails.to,
                cc: log.campaignDetails.cc,
                bcc: log.campaignDetails.bcc,
                campaignName:log.campaignDetails.campaignName,
                lastSent:log.lastSent
            })
        })
        console.log("response", history)
        res.status(200)
        res.send(history)
        return res;
    }
    catch(error)
    {
        console.log(error);
    }
})

mailRouter.route('/scheduled')
.get(async(req,res,next)=>{
    if(!req.user)
    {
        res.status(401);
        res.json({"message":"You need to login first!"})
        return res;
    }
    try{
        var user=await users.findOne(req.user)
        // console.log(user);

        var logs= await emailLogs.find({
            userDetails:user._id, 
            recurrence:{$ne:null}
        }).populate('campaignDetails').populate('userDetails')
        console.log(logs)

        history=logs.map(log=>{
            return ({
                recurrence: log.recurrence,
                subject: log.subject,
                to: log.campaignDetails.to,
                cc: log.campaignDetails.cc,
                bcc: log.campaignDetails.bcc,
                campaignName:log.campaignDetails.campaignName,
                nextMailTime:log.nextScheduleTime
            })
        })
        res.status(200)
        res.send(history)
        return res;
    }
    catch(error)
    {
        console.log(error);
    }
})

mailRouter.route('/campaign')
.post(async(req,res,next)=>{
    if(!req.user)
    {
        res.status(401);
        res.json({"message":"You need to login first!"})
        return res;
    }
    // console.log(req.body)
    var {campaignName, to, cc, bcc}=req.body;
    console.log(to,campaignName, cc, bcc);
    try {
        newCampaign=await emailDetails.create({
            campaignName,
        });
        var camp=await emailDetails.updateOne({_id:newCampaign._id},{
            $push: {
                to: { $each: to},
                cc: { $each: cc },
                bcc: { $each: bcc }
            }
        })
        res.status(201);
        res.json({"message":"Campaign created!"});
        return res;
        
    } catch (error) {
        console.log(error);
        next();
    }
})

mailRouter.route('/campaign')
.get(async(req,res,next)=>{
    if(!req.user)
    {
        res.status(401);
        res.json({"message":"You need to login first!"})
        return res;
    }
    user=await user.findOne({userDetails:user})
    try {
        allCampaigns=await emailDetails.find({userDetails:user._id});
        res.status(200);
        res.send(allCampaigns);
        return res;
    } catch (error) {
        console.log(error);
        next();
    }
})

module.exports=mailRouter;