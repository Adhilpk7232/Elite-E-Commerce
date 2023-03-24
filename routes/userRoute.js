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

const nocache =require('nocache')
route.use(nocache())
const session = require('express-session')

route.use(session({secret:config.sessionSecret,
    saveUninitialized:true,
    cookie:{maxAge:60000*1000},
    resave:false    
}))

const userController = require('../controller/userController')
const  sessionSecret  = require('../config/config')

//Landing Page
route.get('/',auth.isLogout,userController.loadLandingPage)
//user registeration
route.get('/register',auth.isLogout ,userController.loadSignup)
route.post('/register',userController.insertUser)
route.get('/verify',userController.verifyMail)


///otp mobile verification
route.get('/mobileCheck',auth.isLogout,userController.mobileCheck)
route.post('/mobileCheck',userController.verifyPhone)
route.post('/otp',userController.verifyOtp)
//user login
route.get('/login',auth.isLogout,userController.loginLoad)
route.post('/login',userController.verifyLogin)

///login OTP
route.get('/loginOtp',userController.loginOtp)
route.post('/loginOtp',userController.verifyNum)
route.post('/loginOtpveryfy',userController.verifyNumOtp)

route.get('/logout',userController.userLogout)
//user forgot password
route.get('/forget',auth.isLogout,userController.forgetLoad)
route.post('/forget',userController.forgetVerify)
route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad)
route.post('/forget-password',userController.resetPassword)
// Render Home Page dynamically
route.get('/home',auth.isLogin,userController.loadHome)
///Cart
route.post('/add-to-cart',auth.isLogin,userController.AddToCart)
route.get('/cart',auth.isLogin,userController.loadCart)
route.post('/delete-cart-product',userController.deleteCartProduct)
route.post('/change-quantity',userController.change_Quantities)
//Wishlist
route.get('/wishlist',auth.isLogin,userController.loadWhishlist)
route.post('/add-to-wishlist',auth.isLogin,userController.AddToWishlist)
route.post('/remove-wishlist',auth.isLogin,userController.deleteWishlistProduct)
route.post('/wishlistToCart',auth.isLogin,userController.wishlistToCart)

route.get('/shop',userController.loadShop)

route.get('/checkout',userController.loadCheckout)
route.get('/shopCategory/:id',userController.loadShopCategory)
route.get('/single-product/:id',userController.loadSingleProduct)
//user profile 
route.get('/profile',userController.loadProfile)
route.post('/add-address',userController.insertAddress)
route.get('/edit-address/:id/:adrsId',auth.isLogin,userController.editAddress)
route.post('/add-address-checkOut',userController.addAddressCheckout)


route.post('/edit-update-address/:addressIndex',auth.isLogin,userController.updateAddress)
route.get('/delete-address/:id/:adrsId',userController.DeleteAddress)

route.post('/coupon-apply',auth.isLogin,userController.couponApply)


route.get('/orderlist',auth.isLogin,userController.orderList)
route.get('/ordered-products',auth.isLogin,userController.orderedProducts)
route.get("/cancel",auth.isLogin,userController.cancelOrder)

route.post('/place-order',auth.isLogin,userController.placeOrder)
route.post('/verify-payment',auth.isLogin,userController.verifyPayment)
route.get('/ordersuccess',auth.isLogin,userController.orderSuccess)
// route.get('/export-order',userController.exportOrder)
// route.get('/export-order-pdf',userController.exportOrderPdf)



        
module.exports = route