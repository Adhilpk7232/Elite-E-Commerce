const express = require("express")
const router = express()
const path = require('path')
const auth = require('../middleware/adminauth')
const session = require("express-session")

const config = require("../config/config")
const multer =require('multer')

const{upload,categoryMulter}=require('../multers/multer')
const fs = require('fs')

// const auth = require('../middleware/adminAuth')

const bodyParser = require("body-parser")
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended:true}))


router.set('view engine','ejs')
router.set('views','./views/admin')

const adminController = require("../controller/adminController")
// const { verifyLogin } = require("../controllers/userController")

router.get('/',adminController.loadLogin)
router.post('/',adminController.verifyLogin)
router.get('/home',adminController.loadDashboard)

router.get('/user',adminController.loadUserManagement)
router.get('/block-user',adminController.blockUser)

router.get('/category',adminController.loadCategory)
router.get('/addCategory',adminController.AddCategorry)
router.post('/addcategory',categoryMulter.single('image'),adminController.insertCategory)
router.get('/deleteCategory',adminController.DeleteCategory)
router.get('/updateCategory',adminController.UpdateCategory)
router.post('/updateCategory',adminController.UpdatedCategory)


router.get('/addProduct',adminController.AddProduct)
router.post('/addProduct',upload.array('image'),adminController.InertProduct)
router.get('/product',adminController.loadProduct)
router.get('/edit-product/:id',adminController.EditProduct)
router.post('/edit-product',adminController.UpdateProduct)

router.post('/edit-image/:id',upload.array('image'),adminController.updateImage)
router.get('/delete-product-image/:imgid/:prodid',adminController.deleteImage)
router.get('/delete-product',adminController.DeleteProduct)
router.get('/view-product',adminController.ViewProduct)

module.exports = router