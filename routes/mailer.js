const express = require('express')
const emailDetails = require('../models/emailDetails');
const mailRouter = express.Router();
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
    .get(auth, async (req, res, next) => {
        const { taskNumber } = req.query
        console.log(taskNumber, url_taskMap[taskNumber])
        url_taskMap[taskNumber].stop();
        try {
            updatedLog = await emailLogs.findOneAndUpdate({ task_id: taskNumber }, { recurrence: null })
            console.log("after stop", updatedLog)
            res.status(200);
            res.json({ "message": `Task ${taskNumber} successfully terminated` });
        } catch (error) {
            console.log(error)
        }
    })

mailRouter.route('/history')
    .get(auth, async (req, res, next) => {
        try {
            var user = await users.findOne(req.user)
            // console.log(user);
            var logs = await emailLogs.find({ userDetails: user._id, sent: true }).populate('campaignDetails').populate('userDetails')
            // console.log(logs)
            history = logs.map(log => {
                return ({
                    recurrence: log.recurrence,
                    subject: log.subject,
                    to: log.campaignDetails.to,
                    cc: log.campaignDetails.cc,
                    bcc: log.campaignDetails.bcc,
                    campaignName: log.campaignDetails.campaignName,
                    lastSent: log.lastSent
                })
            })
            console.log("response", history)
            res.status(200)
            res.send(history)
            return res;
        }
        catch (error) {
            console.log(error);
        }
    })

mailRouter.route('/scheduled')
    .get(auth, async (req, res, next) => {
        try {
            var user = await users.findOne(req.user)
            // console.log(user);

            var logs = await emailLogs.find({
                userDetails: user._id,
                recurrence: { $ne: null }
            }).populate('campaignDetails').populate('userDetails')
            console.log(logs)

            history = logs.map(log => {
                return ({
                    recurrence: log.recurrence,
                    subject: log.subject,
                    to: log.campaignDetails.to,
                    cc: log.campaignDetails.cc,
                    bcc: log.campaignDetails.bcc,
                    campaignName: log.campaignDetails.campaignName,
                    nextMailTime: log.nextScheduleTime
                })
            })
            res.status(200)
            res.send(history)
            return res;
        }
        catch (error) {
            console.log(error);
        }
    })

mailRouter.route('/campaign')
    .post(auth, async (req, res, next) => {
        // console.log(req.body)
        var { campaignName, to, cc, bcc } = req.body;
        console.log(to, campaignName, cc, bcc);

        user = await users.findOne(req.user)
        console.log("user", user)
        try {
            newCampaign = await emailDetails.create({
                campaignName,
                userDetails: user._id
            });
            console.log(newCampaign)
            var camp = await emailDetails.updateOne({ _id: newCampaign._id }, {
                $push: {
                    to: { $each: to },
                    cc: { $each: cc },
                    bcc: { $each: bcc }
                }
            })
            res.status(201);
            res.json({ "message": "Campaign created!" });
            return res;

        } catch (error) {
            console.log(error);
            next();
        }
    })

mailRouter.route('/campaign')
    .get(auth, async (req, res, next) => {
        user = await users.findOne(req.user)
        console.log(user)
        try {
            allCampaigns = await emailDetails.find({ userDetails: user._id }).populate('userDetails');
            console.log(allCampaigns)
            campaignDetails = allCampaigns.map(campaign => {
                return {
                    campaignName: campaign.campaignName,
                    to: campaign.to,
                    cc: campaign.cc,
                    bcc: campaign.bcc
                }
            })
            res.status(200);
            res.send(campaignDetails);
            return res;
        } catch (error) {
            console.log(error);
            next();
        }
    })

mailRouter.route('/campaignNames')
    .get(auth, async (req, res, next) => {
        user = await users.findOne(req.user)
        try {
            allCampaigns = await emailDetails.find({ userDetails: user._id });
            res.status(200);
            campaignNames = allCampaigns.map((campaign) => campaign.campaignName)
            res.send(campaignNames);
            console.log(campaignNames);
            return res;
        } catch (error) {
            console.log(error);
            next();
        }
    })

module.exports = mailRouter;