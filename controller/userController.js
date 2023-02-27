const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const randormstring = require('randomstring')
const nodemailer = require('nodemailer')
const config = require('../config/config')
//----------------------------------
const {TWILIO_SERVICE_SID,TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN} = process.env
const client = require('twilio')(TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,{
    lazyLoading:true
})

//-----------------------------------

const securePassword = async (password) => {
    try{
        const passwordHash =  await bcrypt.hash(password,10)
        return passwordHash

    }catch(error){
        console.log(error.message);
    }
}
///for send mail
const sendVerifyMail = async(name,email,user_id)=>{
    try{
        const transporter  = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            tls:true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        })
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject:'for verification mail',
            html:'<p>Hii '+name+',please click here to <a href ="http://localhost:3001/verify?id='+user_id+'">verify</a>your mail .</p>'
        
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
                console.log("Mail transporter in send mail section");
            }else{
                console.log("Email has been sent:- ",info.response);
            }
        })
        console.log(name);
        console.log(user_id);
        console.log(email);
    }catch(error){
        console.log(error.message);
        console.log("send mail section");
    }
}

// for reset password and email

const sendResetMail = async(name, email,token)=>{
    try{
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            tls:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        })
        const mailOptions ={
            from:config.emailUser,
            to:email,
            subject:'For reset Password',
            html:'<p>Hii '+name+',please click here to <a href ="http://localhost:3001/forget-password?token='+token+'">reset</a>your password .</p>'

        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log("Email has been sent:- ",info.response);
            }
        })

    }catch(error){
        console.log(error.message);
    }

}

const loadSignup = async(req,res)=>{
    try{        res.render('registration')

    }catch(erorr){
        console.log(error.message);
    }
}

const insertUser = async(req,res)=>{
    try{
        const spassword = await securePassword(req.body.password)
        const userEmail =req.body.email
        const usermobile =req.body.mno
        const checkData = await User.find({email:userEmail})
        // if(checkData){
        //     return res.render('registration',{message:'Email is already exist'})
        // }
        

        
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            password:spassword,
            is_admin:0
        })
        const userData = await user.save()

        if(userData){
            sendVerifyMail(req.body.name,req.body.email,userData._id);
            res.render('registration',{message:"your registration succseeful please verify your email"})
            // res.send("success")
        }else{
            res.render('registration',{message:"registration failed"})
            // res.send("failed")
        }
        // }

    }catch(erorr){
    console.log(erorr.message);
    }
}


const verifyMail = async(req,res)=>{
    try{
        const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1}})

        console.log(updateInfo);
        res.render('email-verified')
    }catch(error){
        console.log(error.message);
        console.log("verify mail section");
    }
    
}


//landing page

const loadLandingPage = async(req,res)=>{
    try{
        res.render('landingpage')
    }catch(error){
        console.log(error.message);
    }
}
//LOGIN USER METHOD STARTED

const loginLoad = async (req,res)=>{
    try{
        res.render('login')
    }catch(error){
        console.log(error.message);
    }
}
const verifyLogin = async(req,res)=>{
    try{
    const email = req.body.email
    const password = req.body.password
    const userData = await User.findOne({email:email})

    if(userData){
        const passwordMatch = await bcrypt.compare(password,userData.password)
        if(passwordMatch){
            if(userData.is_verified === 0){
                
                req.session.user_id = userData._id;
                res.render('login',{message:"Please verify your mail"})
                console.log("verified user zero");
                   
            }else{
                res.redirect('/home') 
                console.log("hello home");
                
            }

        }else{
            res.render('login',{message:"Email and password id incorrect"})
        }

    }else{
        res.render('login',{message:"Email and Password is incorrect"})
    }
    }catch(error){
        console.log(error.message);
    }
    
}

const mobileCheck = async(req,res)=>{
    try{
        res.render('mobileCheck',{message:""})
    }catch(error){
        console.log(error.message);
    }
}

const verifyPhone = async(req,res)=>{

    try{
        const num= await req.body.mno
        const check = await User.findOne({mobile:num})
        if(check){
            const otpResponse  = await client.verify.
                v2.services(TWILIO_SERVICE_SID)
                .verifications.create({
                    to: num,
                    channel:"sms"
                })
               
            res.render('otp',{message:num})

        }else{
            res.render('mobileCheck',{message:"Did not register this mobile number"})
        }
    }catch(error){
        console.log(error.message);
        console.log("from error of phone verify");
    }
}

const verifyOtp = async(req,res)=>{
    try{
        const num = req.body.mno
        const otp = req.body.otp
        console.log(otp+""+num);
        const verifiedResponse = await client.verify.
            v2.services(TWILIO_SERVICE_SID)
            .verificationChecks.create({
                to:num,
                code:otp,
            })
                if(verifiedResponse.status=='approved'){
                    const userDetails = User.findOne({mobile:num})
                    req.session.user_id = userDetails._id
                    const userId = userDetails._id
                    res.redirect('/home')
                    console.log("true otp");
                }else{
                    res.render('otp',{message:'incorect otp'})
                    console.log("false otp");
                }
    }catch(error){
        console.log(error.message);
        console.log("veriftotp section");
    }
}
    




const loadHome = async (req,res)=>{
    try{
        
        res.render('home')
        // console.log("poda");
    }catch(error){
        console.log(error.message);
    }
}

const userLogout = async (req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/');

    }catch(error){
        console.log(error.message);
    }
}
const forgetLoad = async(req,res)=>{
    try{
        res.render('forget')
    }catch(error){
        console.log(error.message);
    }
}
const forgetVerify = async(req,res)=>{
    try{
        const email=req.body.email

        const userData = await User.findOne({email:email})
        if(userData){
            
            if(userData.is_verified === 0){
                res.render('forget',{message:"please verify your mail"})
            }else{
                const randomstring = randormstring.generate()
                const updatedData = await User.updateOne({email:email},{$set:{token:randomstring}})
                sendResetMail(userData.name,userData.email,randomstring)
                res.render('forget',{message2:'Please check your mail to rest your password'})
            }

        }else{
            res.render('forget',{message:'User email is incorrect'})
        }

    }catch(error){
        console.log(error.message);
    }
}

const forgetPasswordLoad = async(req,res)=>{
    try{
        const token = req.query.token
        const tokenData = await User.findOne({token:token})
        if(tokenData){
            res.render('forget-password',{user_id:tokenData._id})

        }else{
            res.render('404',{message:"token is invalid"})
        }

    }catch(error){
        console.log(error.message);

    }
}


const resetPassword = async (req,res)=>{
    try{
        const password = req.body.password
        const user_id = req.body.user_id
        const secure_password = await securePassword(password)

        const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}})
        console.log(updatedData);
        res.redirect('/login')

    }catch(error){
        console.log(error.message);
    }
}

module.exports={
    loadLandingPage,
    loadSignup,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    mobileCheck,
    verifyPhone,
    verifyOtp,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword
}