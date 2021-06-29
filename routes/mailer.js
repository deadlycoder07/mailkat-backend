const express = require('express')
const emailDetails = require('../models/emailDetails');
const mailRouter = express.Router();
const emailLogs = require('../models/emailLogs');
const users = require('../models/users');
const mailController = require('../controllers/mailer');
const auth = require('../middlewares/auth');
require('dotenv');

mailRouter.post('/send',auth, mailController.sendEmail);
mailRouter.get('/stopSchedule',auth,mailController.stopSchedule);
mailRouter.get('/history',auth,mailController.mailHistory);
mailRouter.get('/scheduled',auth,mailController.mailScheduled);
mailRouter.post('/campaign',auth,mailController.creatCampaign);
mailRouter.get('/campaign',auth,mailController.getallCampaign);
mailRouter.get('/campaignNames',auth,mailController.userCampaign);
mailRouter.post('/addEmail',auth,mailController.addEmail);
mailRouter.post('/deleteEmail',auth,mailController.deleteEmail);
mailRouter.post('/updateCampaign',auth,mailController.updateCampaign);

module.exports = mailRouter;