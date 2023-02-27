const express= require('express')
const route = express()
const path = require('path')

const bodyparser = require('body-parser')
route.use(bodyparser.json())
route.use(bodyparser.urlencoded({extended:true}))



route.set('view engine','ejs')
route.set('views','./views/users')
const auth = require('../middleware/auth')

const config = require('../config/config')
const session = require('express-session')

// route.use('/css',express.static(path.join(__dirname,"/public/css")))
// route.use('/img',express.static(path.join(__dirname,"/public/img")))
// route.use('/js',express.static(path.join(__dirname,"/public/js")))

route.use(session({secret:config.sessionSecret,
    saveUninitialized:true,
    cookie:{maxAge:60000},
    resave:false    
}))

const userController = require('../controller/userController')
const  sessionSecret  = require('../config/config')

route.get('/register',auth.isLogout ,userController.loadSignup)
route.post('/register',userController.insertUser)
route.get('/verify',userController.verifyMail)
route.get('/mobileCheck',auth.isLogout,userController.mobileCheck)
route.post('/mobileCheck',userController.verifyPhone)
route.post('/otp',userController.verifyOtp)
route.get('/',auth.isLogout,userController.loadLandingPage)
route.get('/login',auth.isLogout,userController.loginLoad)
route.post('/login',userController.verifyLogin)

route.get('/home',userController.loadHome)
route.get('/logout',userController.userLogout)

route.get('/forget',auth.isLogout,userController.forgetLoad)
route.post('/forget',userController.forgetVerify)
route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad)

route.post('/forget-password',userController.resetPassword)
        
module.exports = route