const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/user_eliteShoppie')
const path = require("path")
const User =require('./models/userModel')
const express = require("express")
const app = express()
const nocache=require('nocache')
app.use(nocache())

const session = require('express-session')
app.use(session({secret:"thisismyscreatkey12344"}))

const env = require('dotenv').config()

const { dirname } = require('path')

/// admin connetion of js,css etc
app.use(express.static(path.join(__dirname,'public')))

///for user route

const userRoute = require('./routes/userRoute')
app.use('/',userRoute)
const adminRoute = require('./routes/adminRoute')
const { sessionSecret } = require('./config/config')
app.use('/admin',adminRoute)
app.listen(3001,function(){
    console.log("server is running on 3001");
})

module.exports ={
    app
}