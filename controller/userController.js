const User = require('../models/userModel')
const Category =require('../models/categoryModel')
const Product =require('../models/productModel')
const Address = require('../models/addressModel')
const bcrypt = require('bcrypt')
const randormstring = require('randomstring')
const nodemailer = require('nodemailer')
const config = require('../config/config')
const mongoose = require('mongoose')
const { response } = require('../routes/userRoute')
const fs=require('fs')
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

    }catch(error){
        console.log(error.message);
    }
}
const insertUser = async(req,res)=>{
    try{
        const spassword = await securePassword(req.body.password)
        const userEmail =req.body.email
        const usermobile =req.body.mno
        const checkData = await User.findOne({email:userEmail})
        // console.log(checkData);
        if(checkData){
             res.render('registration',{message:'Email is already exist'})
        }else{
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            password:spassword,
            is_admin:0,
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
        }
        // }

    }catch(erorr){
    console.log(erorr.message);
    }
}
const verifyMail = async(req,res)=>{
    try{
        const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1}})
        // console.log(updateInfo);
        res.render('email-verified')
    }catch(error){
        console.log(error.message);
        // console.log("verify mail section");
    }
    
}
//landing page

const loadLandingPage = async(req,res)=>{
    try{
        const user = false
        const categoryData = await Category.find()
        const productData = await Product.find()
        res.render('home',{categoryData,productData,user})
    }catch(error){
        console.log(error.message);
    }
}

const loadHome = async (req,res)=>{
    try{
        if(req.session.user_id){
        const user=true
        const categoryData = await Category.find()
        const productData = await Product.find()
        res.render('home',{categoryData,productData,user})
        }
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
            if(userData.is_verified === 0||userData.is_mobileVerified ===0){
                if(userData.is_verified === 0){
                    res.render('login',{message:"Please verify your mail"})
                    console.log("verified user zero");

                }else{
                    res.render('login',{message:"Please verify your Mobile Number"})
                    console.log("Mobile verified user zero");
                }    
            }else{
                req.session.user_id = userData._id;
                console.log(req.session.user_id);
                res.redirect('/home') 
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
                    const userDetails = await User.find({mobile:num})
                    console.log(userDetails);
                    const updateInfo = await User.updateOne({mobile:num},{$set:{is_mobileVerified:1}})
                    req.session.user_id = userDetails._id
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
const loginOtp = async(req,res) => {
    try{
        res.render('loginMobile')

    }catch(error){
        console.log(error.message);
    }
}
const verifyNum = async(req,res) => {
    try{
        const num= await req.body.mno
        const check = await User.findOne({mobile:num})
        if(check){
            const otpResponse  = await client.verify.
                v2.services(TWILIO_SERVICE_SID)
                .verifications.create({
                    to:num,
                    channel:"sms"
                })
               
            res.render('loginOtp',{message:num})

        }else{
            res.render('loginMobile',{message:"Did not register this mobile number"})
        }

    }catch(error){
        console.log(error.message);
    }
}
const verifyNumOtp = async(req,res)=>{
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
                    // const num = req.body.mno
                    const userDetails =await User.findOne({mobile:num})
                    req.session.user_id = userDetails._id
                    console.log(req.session.user_id);
                    res.redirect('/home')
                    console.log("true otp");
                }else{
                    res.render('loginOtp',{message2:'incorect otp',message:num})
                    console.log("false otp");
                }
    }catch(error){
        console.log(error.message);
        console.log("veriftotp section");
    }
}
const userLogout = async (req,res)=>{
    try{
        req.session.user_id=null
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


const AddToCart = async(req,res) => {
    try{ 
        const productId = req.body.productId
        console.log(req.session.user_id);
        let exist =await User.findOne({id:req.session.user_id,'cart.productId':productId})
        console.log(exist);
        if(exist){
            const user = await User.findOne({_id:req.session.user_id})
            const index =await user.cart.findIndex(data=>data.productId._id == req.body.productId );
            console.log(index);
                 user.cart[index].qty +=1;
                user.cart[index].productTotalPrice= user.cart[index].qty * user.cart[index].price
                await user.save();
            // const productPrice= user.cart[index].price
            // const productQty = user.cart[index].qty
            // const updateTotalPrice = productQty*productPrice
            // const update =await user.updateOne({productId},{$push:{cart:{productTotalPrice:productPrice}}})
            // console.log(update);
              // res.send(true)
        }else{
            const product =await Product.findOne({_id:req.body.productId})
            const _id = req.session.user_id
            console.log(_id);
            const userData = await User.findOne({_id})
            console.log(userData);
            const result = await User.updateOne({_id},{$push:{cart:{productId:product._id,qty:1,price:product.price,productTotalPrice:product.price}}})
            if(result){
                res.redirect('/home')
                console.log('added to cart');
            }else{
                console.log('not addeed to cart');
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

const loadCart = async(req,res) => {
    try{
        console.log("showing cart....");
        const userId = req.session.user_id
        const temp = mongoose.Types.ObjectId(req.session.user_id)
        const usercart =  await User.aggregate([ { $match: { _id: temp } }, { $unwind: '$cart' },{ $group: { _id: null, totalcart: { $sum: '$cart.productTotalPrice' } } }])
        const cartTotal =usercart[0].totalcart
        // console.log(cartTotal);
        const cartTotalUpdate = await User.updateOne({_id:userId},{$set:{cartTotalPrice:cartTotal}})
        // console.log(cartTotalUpdate);
        const userData = await User.findOne({_id:userId}).populate('cart.productId').exec()
        res.render('cart',{userData})
        // res.send("hello")

    }catch(error){
        console.log(error.message);
    }
}
const change_Quantities = async(req,res) => {
    try{
        const {user,product,count,Quantity,proPrice} =req.body
        const producttemp=mongoose.Types.ObjectId(product)
        const usertemp=mongoose.Types.ObjectId(user)
        const updateQTY = await User.findOneAndUpdate({_id:usertemp,'cart.productId':producttemp},{$inc:{'cart.$.qty':count}})
        // console.log(updateQTY);
        const currentqty = await User.findOne({_id:usertemp,'cart.productId':producttemp},{_id:0,'cart.qty.$':1})
        // console.log(currentqty);
        const qty = currentqty.cart[0].qty
        // console.log(qty);
        const productSinglePrice =proPrice*qty
        // console.log(productSinglePrice);
        await User.updateOne({_id:usertemp,'cart.productId':producttemp},{$set:{'cart.$.productTotalPrice':productSinglePrice}})
        const cart = await User.findOne({_id:usertemp})
        let sum=0
        for(let i=0;i<cart.cart.length;i++){
            sum=sum + cart.cart[i].productTotalPrice
        }
        const update =await User.updateOne({_id:usertemp},{$set:{cartTotalPrice:sum}})
        .then(async(response)=>{
            res.json({ response: true,productSinglePrice,sum })
            })
    }catch(error){
        console.log(error.message);
    }
}

const loadCheckout = async(req,res) => {
    try{
        const userId = req.session.user_id
        console.log(userId);
        const userData = await User.findOne({_id:userId})
        const address = await Address.findOne({userId:userId})
        res.render('checkout',{userData,address})

    }catch(error){
        console.log(error.message);
    }

}
const loadShopCategory = async (req,res) =>{
    try{
        const catId=req.params.id
        const productCate =await Product.find({category:catId})
        res.render('category',{productCate})

    }catch(error){
        console.log(error.message);
    }
}
const loadProfile = async (req,res) => {
    try{
        const userId = req.session.user_id
        const userData = await User.findOne({_id:req.session.user_id})
        const address = await Address.findOne({userId:req.session.user_id})
        console.log(address);
        
        // console.log(userData);
        res.render('profile',{userData,address})
        
    }catch(error){
        console.log(error.message);
    }
}

const insertAddress = async(req,res) => { 
    try{
        if(req.session.user_id){
            const userId =req.session.user_id
            console.log(req.body.fullname);
            let AddressObj ={
                fullname:req.body.fullname,
                mobileNumber:req.body.number,
                pincode:req.body.zip,
                houseAddress:req.body.houseAddress,
                streetAddress:req.body.streetAddress,
                landMark:req.body.landmark,
                cityName:req.body.city,
                state:req.body.state
            }
            const userAddress= await Address.findOne({userId:userId})
            if(userAddress){
                console.log("addred to exist address");
                const userAdrs=await Address.findOne({userId:userId}).populate('userId').exec()
                // console.log(userAdrs);
                userAdrs.userAddresses.push(AddressObj)
                await userAdrs .save().then((resp)=>{
                    res.redirect('/profile')
                }).catch((err) => { 
                    res.send(err)
                })
                console.log(userAdrs);
                
            }else{
                console.log("added to new address ");
                let userAddressObj ={
                    userId:userId,
                    userAddresses:[AddressObj]
                }
                await Address.create(userAddressObj).then((resp)=>{
                    res.redirect('/profile')
                })
            }
        
        }
    }catch(error){
        console.log(error.message);
    }
}
const editAddress = async(req,res) => {
    try{
        const adrsSchemaId = req.params.id
        const adrsId = req.params.adrsId
        const address=mongoose.Types.ObjectId(adrsSchemaId)
        const addresses=mongoose.Types.ObjectId(adrsId)
        console.log(address);
        console.log(addresses);
        const addressData = await Address.findOne({address})
        console.log(addressData);
        const addressIndex = await addressData.userAddresses.findIndex(data=> data.id == addresses)
        
        console.log(addressIndex);
        const editAddress = addressData.userAddresses[addressIndex]
        console.log(editAddress);
        res.render('edit-address',{editAddress,addressIndex})


    }catch(error){
        console.log(error.message);
    }
}
const updateAddress = async(req,res) =>{
    try{
        // const userAddresses = req.params.id
        const addressIndex = req.params.addressIndex
        const editData = { ...req.body }
        const userId = req.session.user_id
        const updateAdrs = await Address.findOne({userId})
        updateAdrs.userAddresses[addressIndex]= {...editData}
        await updateAdrs.save()
        res.redirect('/profile')

    
    }catch(error){
        console.log(error.message);
    }
}
const DeleteAddress = async(req,res)=>{
    try{
        const adrsSchemaId = req.params.id
        const adrsId = req.params.adrsId
        const addressId=mongoose.Types.ObjectId(adrsSchemaId)
        const addresses=mongoose.Types.ObjectId(adrsId)
        console.log(addressId);
        console.log(addresses);
        const addressData = await Address.findOne({addressId})
        console.log(addressData);
        const addressIndex = await addressData.userAddresses.findIndex(data=> data.id == addresses)
        console.log(addressIndex);
        addressData.userAddresses.splice(addressIndex,1)
        await addressData.save()
        res.redirect('/profile')
        

    }catch(error){
        console.log(error.message);
    }
}
const loadSingleProduct = async(req,res) => {
    try{
        const id=req.params.id
        const product = await Product.findOne({_id:id}).populate('category').exec()
        res.render('singleProduct',{product})

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
    resetPassword,
    AddToCart,
    loadCart,
    loadCheckout,
    loadShopCategory,
    loginOtp,
    verifyNum,
    verifyNumOtp,
    loadProfile,loadSingleProduct,
    insertAddress,
    editAddress,
    updateAddress,
    DeleteAddress,
    change_Quantities
}