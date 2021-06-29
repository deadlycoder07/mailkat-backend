const express = require('express')
const campaignDetails = require('../models/campaignDetails');
const mailRouter = express.Router();
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const emailLogs = require('../models/emailLogs');
const users = require('../models/users');
const parser = require('cron-parser');
const schedule = require('node-schedule');
const emailDetails = require('../models/emailDetails');
const e = require('express');

const url_taskMap = {};

exports.sendEmail = async (req, res, next) => {
    var { campaignName = null, subject, body, second = '*', minute = '*', hour = '*', dayOfMonth = '*', month = '*', dayOfWeek = '*', year = 2021, recurrence = null, to, cc, bcc } = req.body;
    if(subject == "") return res.status(403).send({error:"subject can't be left blank"})
    if(body == "") return res.status(403).send({error:"body can't be left blank"})
    console.log(recurrence, second, minute, hour, month, dayOfMonth, dayOfWeek, to, cc, bcc, campaignName)
    user = await users.findOne(req.user);
    if (campaignName !== null) {
        var campaign = await campaignDetails.findOne({ campaignName, userDetails: user._id }).populate('emailDetails').populate('userDetails')

        console.log(campaign)

        campaignId = campaign._id
        emailDetailId = campaign.emailDetails

        var { to, bcc, cc } = campaign.emailDetails;
        console.log(to, bcc, cc);
    }
    else {
        if (to == "") return res.status(403).send({error:"Email To can't be left blank"})
        newEmailDetail = await emailDetails.create({
            userDetails: user._id
        })
        console.log(newEmailDetail)
        emailDetailId = newEmailDetail._id
        console.log(to, cc, bcc)
        updatedEmail = await emailDetails.updateOne({
            _id: emailDetailId
        },
            {
                $push: {
                    to: { $each: to },
                    cc: { $each: cc },
                    bcc: { $each: bcc }
                }
            })
        campaignId = null;
        console.log(emailDetailId)
        email = await emailDetails.find({ _id: emailDetailId }).populate('userDetails')
        console.log("email", email);
    }

    var transporter;
    var mailOptions;
    // if (user.googleAccessToken) {
    //     transporter = nodemailer.createTransport({
    //         // host: 'mail.weblikate.com',
    //         host: 'smtp.gmail.com',
    //         port: 465,
    //         secure: true,
    //         auth: {
    //             type: 'OAuth2',
    //             clientId:process.env.CLIENT_ID,
    //             clientSecret:process.env.CLIENT_SECRET,

    //         }
    //     });
    //     mailOptions = {
    //         from: user.email,
    //         to,
    //         cc,
    //         bcc,
    //         subject: subject,
    //         html: body,
    //         auth: {
    //             user: user.email,
    //             accessToken: user.googleAccessToken,
    //             refreshToken: user.googleRefreshToken
    //         }
    //     };
    // } else {
    //     transporter =  nodemailer.createTransport({
    //         // host: 'mail.weblikate.com',
    //         service: 'gmail',
    //         auth: {
    //             user: process.env.auth_emailid,
    //             pass: process.env.auth_password
    //         }
    //         });
    //     mailOptions = {
    //         from: process.env.auth_emailid,
    //         to,
    //         cc,
    //         bcc,
    //         subject: subject,
    //         html: body
    //     };
    // }
    transporter = nodemailer.createTransport({
        // host: 'mail.weblikate.com',
        service: 'gmail',
        auth: {
            user: process.env.auth_emailid,
            pass: process.env.auth_password
        }
    });
    mailOptions = {
        from: `${user.name} <${process.env.auth_emailid}>`,
        replyTo: user.email,
        to,
        cc,
        bcc,
        subject: subject,
        html: body
    };

    if (recurrence === null) //immediate mailing
    {
        console.log("sending immediately!");
        transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
                console.log(error);
            } else {
                try {
                    newLog = await emailLogs.create({
                        subject, body, campaignDetails: campaignId, emailDetails: emailDetailId, userDetails: user._id, sent: true, lastSent: new Date()
                    })
                    console.log("added to log", newLog)
                    res.status(200);
                    res.json({ "message": "mail sent successfully" });
                    console.log('Email sent: ' + info.response);
                } catch (error) {
                    console.log(error);
                    res.status(403).send({ error: "we are facing issue in sending your email" })
                    next();
                }
            }
        });
    }
    else if (recurrence === "Once") {
        console.log("Printing once")
        const date = new Date(year, month, dayOfMonth, hour, minute, 0);
        console.log(date.toString());
        try {
            const job = schedule.scheduleJob(date, async function () {
                transporter.sendMail(mailOptions, async function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        newLog = await emailLogs.updateOne({
                            subject, body, campaignDetails: campaignId, emailDetails: emailDetailId, userDetails: user._id, nextScheduleTime: date
                        }, {
                            sent: true,
                            lastSent: new Date(),
                            nextScheduleTime: null
                        })
                        console.log("added to log", newLog)
                        console.log('Email sent: ' + info.response);
                    }
                }
                )
            })
            const idx = Object.keys(url_taskMap).length
            console.log("idx",idx)
            url_taskMap[idx] = job;
            console.log(url_taskMap[idx]);
            if("cancel" in url_taskMap[idx])
            {
                console.log("cncl is a key");
            }

            newLog = await emailLogs.create({
                recurrence, subject, body, campaignDetails: campaignId, emailDetails: emailDetailId, userDetails: user._id, nextScheduleTime: date, task_id: idx
            })
            res.status(200)
            res.json({ "task_id":idx,"message": "Scheduled your mail successfully" })
        }
        catch (error) {
            console.log(error);
            res.status(403).send({ error: "we are facing issue in sending your email" })
            next();
        }
    }
    else //recurring
    {
        if (recurrence === 'Timely')
            second = '*/' + second;
        cron_schedule_string = `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`

        const task = cron.schedule(cron_schedule_string, async () => {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    res.status(200);
                    console.log('Email sent: ' + info.response);
                }
            });
            try {
                const interval = parser.parseExpression(cron_schedule_string);
                nextScheduleTime = interval.next().toISOString();
                console.log("updating");
                updatedLog = await emailLogs.findOneAndUpdate({
                    recurrence, subject, body, second, minute, hour, dayOfMonth, month, month, dayOfWeek, emailDetails: emailDetailId,
                    campaignDetails: campaignId, userDetails: user._id
                }, {
                    sent: true,
                    lastSent: new Date(),
                    nextScheduleTime
                })
                console.log("updatedLog", updatedLog)
            } catch (error) {
                console.log(error)
                res.status(403).send({ error: "we are facing issue in sending your email" })
                next();
            }
        })
        const idx = Object.keys(url_taskMap).length
        console.log(idx)
        res.json({ id: idx, "message": "mail scheduled successfully" })
        url_taskMap[idx] = task;

        const interval = parser.parseExpression(cron_schedule_string);
        nextScheduleTime = interval.next().toISOString();

        updatedLog = await emailLogs.create({
            recurrence, subject, body, second, minute, hour, dayOfMonth, month, month, dayOfWeek, emailDetails: emailDetailId,
            campaignDetails: campaignId, userDetails: user._id, task_id: idx, nextScheduleTime
        })

        console.log("map", url_taskMap)
    }
};

exports.stopSchedule = async (req, res, next) => {
    const { taskNumber } = req.query
    console.log(taskNumber, url_taskMap[taskNumber])
    if("cancel" in url_taskMap[taskNumber])
    {
        console.log("Once");
        url_taskMap[taskNumber].cancel();
    }
    else
    {
        url_taskMap[taskNumber].stop();
    }
    try {
        updatedLog = await emailLogs.findOneAndUpdate({ task_id: taskNumber }, { nextScheduleTime: null })
        console.log("after stop", updatedLog)
        res.status(200);
        res.json({ "message": `Task ${taskNumber} successfully terminated` });
    } catch (error) {
        console.log(error)
        res.status(403).send({ error: error.message })
    }
};

exports.mailHistory = async (req, res, next) => {
    try {
        var user = await users.findOne(req.user)
        console.log(user);
        var logs = await emailLogs.find({ userDetails: user._id, sent: true }).populate('campaignDetails').populate('userDetails').populate('emailDetails')
        console.log(logs)
        history = logs.map(log => {
            history = {
                recurrence: log.recurrence,
                subject: log.subject,
                to: log.emailDetails.to,
                cc: log.emailDetails.cc,
                bcc: log.emailDetails.bcc,
                body:log.body,
                lastSent: log.lastSent
            }
            if (log.campaignDetails != null) {
                history[campaignName] = log.campaignDetails.campaignName
            }
            return history
        })
        console.log("response", history)
        res.status(200)
        res.send(history)
        return res;
    }
    catch (error) {
        console.log(error);
        res.status(403).send({ error: error.message })
    }
};

exports.mailScheduled = async (req, res, next) => {
    try {
        var user = await users.findOne(req.user)
        // console.log(user);

        var logs = await emailLogs.find({
            userDetails: user._id,
            nextScheduleTime: { $ne: null }
        }).populate('userDetails').populate('emailDetails').populate('campaignDetails')

        history = logs.map(log => {
            history = {
                recurrence: log.recurrence,
                subject: log.subject,
                to: log.emailDetails.to,
                cc: log.emailDetails.cc,
                bcc: log.emailDetails.bcc,
                body: log.body,
                task_id: log.task_id,
                nextMailTime: log.nextScheduleTime
            }
            console.log(log.campaignDetails)
            if (log.campaignDetails !== null) {
                console.log(log.campaignDetails)
                history[campaignName] = log.campaignDetails.campaignName
            }
            return history
        })
        res.status(200)
        res.send(history)
        return res;
    }
    catch (error) {
        console.log(error);
        res.status(403).send({ error: error.message })
    }
};

exports.creatCampaign = async (req, res, next) => {
    // console.log(req.body)

    try {
        var { campaignName, to, cc, bcc } = req.body;
        if (campaignName == "") throw new Error("Campaign name can't be left blank");
        if (to == "") throw new Error("EmailTo can't be left blank");
        console.log(to, campaignName, cc, bcc);

        user = await users.findOne(req.user)
        console.log("user", user)
        foundCampaign = await campaignDetails.findOne({
            campaignName,
            userDetails: user._id
        });
        console.log(foundCampaign)
        if (foundCampaign) {
            res.status(402)
            res.json({ "error": `You have already used that campaign name!. Choose another one!` })
            return
        }

        newEmailDetail = await emailDetails.create({
            userDetails: user._id
        });
        updatedEmailDetail = await emailDetails.updateOne({ _id: newEmailDetail._id }, {
            $push: {
                to: { $each: to },
                cc: { $each: cc },
                bcc: { $each: bcc }
            }
        })
        console.log(updatedEmailDetail)

        newCampaign = await campaignDetails.create({
            campaignName,
            userDetails: user._id,
            emailDetails: newEmailDetail._id
        });

        res.status(200);
        res.json({ "message": "Campaign created!" });
        return res;

    } catch (error) {
        console.log(error);
        res.status(403).send({ error: error.message })
        next();
    }
};

exports.getallCampaign = async (req, res, next) => {
    user = await users.findOne(req.user)
    console.log(user)
    try {
        allCampaigns = await campaignDetails.find({ userDetails: user._id }).populate('userDetails').populate('emailDetails');
        console.log(allCampaigns)
        campaigns = allCampaigns.map(campaign => {
            return {
                campaignName: campaign.campaignName,
                to: campaign.emailDetails.to,
                cc: campaign.emailDetails.cc,
                bcc: campaign.emailDetails.bcc
            }
        })
        res.status(200);
        res.send(campaigns);
        return res;
    } catch (error) {
        console.log(error);
        res.status(403).send({ error: "failed to fetch your campaigns please try again later" })
        next();
    }
};

exports.userCampaign = async (req, res, next) => {
    user = await users.findOne(req.user)
    try {
        allCampaigns = await campaignDetails.find({ userDetails: user._id });
        res.status(200);
        campaignNames = allCampaigns.map((campaign) => campaign.campaignName)
        res.send(campaignNames);
        console.log(campaignNames);
        return res;
    } catch (error) {
        console.log(error);
        res.status(403).send({ error: "failed to fetch campaigns please try again later" });
        next();
    }
};

exports.addEmail = async (req, res, next) => {
    user = await users.findOne(req.user)
    var { campaignName, to, cc, bcc } = req.body;
    console.log(to, cc, bcc);
    try {
        campaign = await campaignDetails.findOne({ campaignName, userDetails: user._id }).populate('userDetails').populate('emailDetails');
        console.log(campaign)
        updatedEmailDetails = await emailDetails.updateOne({
            _id: campaign.emailDetails
        }, {
            $push: {
                to: { $each: to },
                cc: { $each: cc },
                bcc: { $each: bcc },
            }
        })

        updatedCampaign = await campaignDetails.findOne({ campaignName, userDetails: user._id }).populate('userDetails').populate('emailDetails');
        console.log(updatedCampaign);
        res.send(updatedCampaign);
        res.status(200);
    } catch (error) {
        console.log(error);
        res.status(403).send({ error: error.message })
    }
}

exports.deleteEmail = async (req, res, next) => {
    user = await users.findOne(req.user)
    var { campaignName, to, cc, bcc } = req.body;
    console.log(to, cc, bcc);
    try {
        campaign = await campaignDetails.findOne({ campaignName, userDetails: user._id }).populate('userDetails').populate('emailDetails');
        console.log(campaign)
        updatedEmailDetails = await emailDetails.updateOne({
            _id: campaign.emailDetails
        }, {
            $pull: {
                to: { $in: to },
                cc: { $in: cc },
                bcc: { $in: bcc },
            }
        })

        updatedCampaign = await campaignDetails.findOne({ campaignName, userDetails: user._id }).populate('userDetails').populate('emailDetails');
        console.log(updatedCampaign);
        res.send(updatedCampaign);
        res.status(200);
    } catch (error) {
        console.log(error);
        res.status(403).send({ error: error.message })
    }
}
exports.updateCampaign = async(req,res) => {
    const user = req.user;
    var { campaignName, to, cc, bcc } = req.body;
    if(to == "")  return res.status(403).send({error: "Email to can't be left blank"});
    try{
        var campaign = await campaignDetails.findOne({campaignName,userDetails: user._id}).populate('userDetails').populate('emailDetails');
        eDetails = await emailDetails.updateOne(
            {
                _id:campaign.emailDetails
            },
            {
                $set:{
                    to: to,
                    cc: cc,
                    bcc: bcc
                }
            }
        );
        return res.status(200).send({message:"campaign updated successfully"});
    }catch(error){
        return res.status(403).send({error:"Failed to update please try again later"});
    }
}
