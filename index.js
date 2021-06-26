const express = require('express');
const morgan= require('morgan');
const mongoose = require('mongoose');
const cors= require('cors');
const cookieSession= require('cookie-session');
const bodyParser=require('body-parser');
const passport=require('passport');
const errorHandler = require('./errorHandlers/errorHandlers');
var flash = require('connect-flash');

const userRouter=require('./routes/users');
const mailRouter = require('./routes/mailer');

require('./auth/authenticate');
require('dotenv').config();

const port = process.env.PORT || 8000;

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:false})
.then((db)=>{
    console.log("connected to db")
})
. catch((err)=>{
    console.log("err",err)
})

const app=express();
app.use(morgan('common'));

app.use(cookieSession({
    maxAge:5*24*60*60*1000,
    keys:[process.env.cookieKey]
}))
app.use(passport.initialize())
app.use(passport.session())
var corsOptions = {
    origin: 'http://localhost:3000',
    credentials:  true
}
  
app.use(cors(corsOptions))

// app.use((req, res, next) => {
//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
app.use(flash());
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
})

app.use(bodyParser.json({ extended: false }))

//app.use('/',homeRouter)
app.use('/auth',userRouter)
app.use('/mail',mailRouter);
app.use('/',express.static(__dirname + "/static"));

app.use(errorHandler.notFound);
app.use(errorHandler.errorHandler);

app.listen(port, ()=>{
    console.log(`server running at port ${port}`)
})