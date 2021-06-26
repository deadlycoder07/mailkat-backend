const express= require('express')
const emailDetails= require('../models/emailDetails');
const mailRouter= express.Router();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const emailLogs = require('../models/emailLogs');
const users = require('../models/users');
const parser = require('cron-parser');
const schedule = require('node-schedule');

exports.sendEmail = async(req, res, next)=>{
    if(!req.user)
    {
        res.status(401);
        res.json({"message":"You need to login first!"})
        return res;
    }
    var {campaignName, subject, body, second='*', minute='*', hour='*', dayOfMonth='*', month='*', dayOfWeek='*', recurrence=null}=req.body;
    console.log(recurrence, second, minute, hour, month, dayOfMonth, dayOfWeek);
    var campaign = await emailDetails.findOne({campaignName})

    console.log(campaign.to, campaign.bcc, campaign.cc);

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
        bcc:campaign.bcc,
        subject: subject,
        html: body
    };

    user=await users.findOne(req.user);
    console.log(req.user);

    if(recurrence===null) //immediate mailing
    {
        console.log("sending immediately!");
        transporter.sendMail(mailOptions, async function(error, info){
            if (error) {
                console.log(error);
            } else {
                try {
                    newLog=await emailLogs.create({
                        subject, body, campaignDetails:campaign._id, userDetails:user._id, sent:true, lastSent:new Date()
                    })
                    console.log("added to log", newLog)
                    res.status(200);
                    res.json({"message":"mail sent"});
                    console.log('Email sent: ' + info.response);
                } catch (error) {
                    console.log(error);
                    next();
                }
            }
        });
    }
    else if(recurrence==="Once") //problematic
    {
        console.log("Printing once")
        const date = new Date(2021, 05, 26, 20, 38, 0);
        try {
            const job = schedule.scheduleJob(date, async function(){
                console.log("sending at 20:20!");
                transporter.sendMail(mailOptions, async function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                            newLog=await emailLogs.create({
                                subject, body, campaignDetails:campaign._id, userDetails:user._id, sent:true, lastSent:new Date()
                            })
                            console.log("added to log", newLog)
                            res.status(200);
                            res.json({"message":"mail sent"});
                            console.log('Email sent: ' + info.response);
                        }
                    }
                )
            })
        }
        catch (error) {
            console.log(error);
            next();
        }
    }
    else //recurring
    {
        if(recurrence==='Timely')
        second='*/'+second;
        cron_schedule_string=`${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`

        const task=cron.schedule(cron_schedule_string,async()=>{
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    res.status(200);
                    console.log('Email sent: ' + info.response);
                }
            }); 
            try {
                const interval = parser.parseExpression(cron_schedule_string);
                nextScheduleTime=interval.next().toISOString();
            
                foundLog=await emailLogs.findOne({
                    recurrence, subject, body, second, minute, hour, dayOfMonth, month, month, dayOfWeek, 
                    campaignDetails:campaign._id, userDetails:user._id, sent:true
                })
                console.log(foundLog);
                if(foundLog===null)
                {
                    console.log("creating");

                    newLog=await emailLogs.create({
                        recurrence, subject, body, second, minute, hour, dayOfMonth, month, month, dayOfWeek, 
                        campaignDetails:campaign._id, userDetails:user._id, sent:true, lastSent:new Date(), nextScheduleTime
                    })
                    console.log(newLog);
                }
                else
                {
                    console.log("updating");
                    updatedLog=await emailLogs.findOneAndUpdate({
                        recurrence, subject, body, second, minute, hour, dayOfMonth, month, month, dayOfWeek, 
                        campaignDetails:campaign._id, userDetails:user._id, sent:true
                    },{
                        lastSent:new Date(),
                        nextScheduleTime
                    })
                    console.log("updatedLog",updatedLog)
                }
            } catch (error) {
                console.log(error)
                next();
            }
        })
        const idx=Object.keys(url_taskMap).length
        console.log(idx)
        res.json({id:idx, "message":"mail sent"})
        url_taskMap[idx] = task;

        updatedLog=await emailLogs.findOneAndUpdate({
            recurrence, subject, body, second, minute, hour, dayOfMonth, month, month, dayOfWeek, 
            campaignDetails:campaign._id, userDetails:user._id, sent:true
        },{
            task_id:idx
        })

        console.log("map",url_taskMap)
    }
};
