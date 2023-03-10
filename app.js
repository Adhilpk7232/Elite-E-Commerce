const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/user_eliteShoppie')
const path = require("path")
const User =require('./models/userModel')
const express = require("express")
const app = express()

const env = require('dotenv').config()

const { dirname } = require('path')

/// admin connetion of js,css etc
app.use(express.static(path.join(__dirname,'public')))

///for user route

const userRoute = require('./routes/userRoute')
app.use('/',userRoute)
const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)
const { sessionSecret } = require('./config/config')
app.listen(3001,function(){
    console.log("server is running on 3001");
})

module.exports ={
    app
}