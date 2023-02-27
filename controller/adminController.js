const User = require("../models/userModel")
const Category =require('../models/categoryModel')
const Product = require('../models/productModel')
const fs = require('fs')
const path = require('path')
const ObjectId = require('mongodb').ObjectId

const bcrypt = require('bcrypt')


const securePassword = async (password) => {
    try{
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    }catch (error){
        console.log(error.message)

    }
}     

const loadLogin= async (req,res)=>{
    try{
        res.render('login')
    }catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async (req,res)=>{
    try{
        const email=req.body.email
        const password=req.body.password;

        const userData=await User.findOne({email:email})

        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){

                if(userData.is_admin === 0){
                    res.render('login',{message:"Email and Password Is Inccorect"})
                }else{
                    req.session.user_id = userData._id
                    res.redirect('/admin/home')
                }

            }else{
                res.render('login',{message:"Email and Password is Inccorect"})
            }

        }else{
            res.render('login',{message:"Email and Password is Inccorect"})
        }

    }catch(error){
        console.log(error.message);
    }
}

const loadDashboard = async (req,res)=>{
    try{

        const userData = await User.find({is_admin:0})
        res.render('home')
    }catch(error){
        console.log(error.message);
    }
}
const loadUserManagement = async(req,res)=>{
    try{
        const userData = await User.find({is_admin:0})
        res.render('userManagement',{users:userData})

    }catch(error){
        console.log(error.message);
    }
}
const blockUser = async(req,res)=>{
    try{
        console.log(req.query.id);
        const id = req.query.id
        const userData = await User.findOne({_id:id},{block:1,_id:id})
        if(userData.block == false){
            const wait = await User.updateOne({_id:id},{$set:{block:true}})
            req.session.user_id=false
            res.redirect('/admin/user')
        }else{
            const wait = await User.updateOne({_id:id},{$set:{block:false}})
            req.session.user_id=true
            res.redirect('/admin/user')

        }
        

    }catch(error){
        console.log(error.message);
    }
}



const loadCategory = async(req,res)=>{
    try{
        const categoryData =await Category.find({})
        res.render('categoryManagement',{categoryData})

    }catch(error){
        console.log(error.message);
    }
}
const AddCategorry = async (req,res)=>{
    try{
        res.render('addCategory')
    }catch(error){
        console.log(error.message);
    }
}
const insertCategory = async (req,res)=>{
    try{
        if(req.body.categoryName=='' || req.body.description==''){
            res.render('addCategory',{message:'fill all field'})

        }else{
        const cat = req.body.categoryName
        const catUP = cat.toUpperCase()
        let exist = await Category.findOne({categoryName:catUP})
        if(exist){
            res.render('addCategory',{message:'This Category already Exist'})
            exist=null
        }else{
            console.log(catUP);
            const category = new Category({
                categoryName:catUP,
                description:req.body.description,
                // image:req.file.filename
                
                
            })
            const categoryData = await category.save()
            if(categoryData){
                res.render('addCategory',{message2:'category insert successfully'})
                console.log("sucsess fullsdfahwescvfuylwH;O");
            }else{
                res.render('addCategory',{message:'category did not inserted'})
            }
        }
        
        
        // const categoryData = await category.save()

        
        
    }
    }catch(error){
        console.log(error.message);
    }
}
const DeleteCategory = async (req,res)=>{
    try{
        const id = req.query.id
        await Category.deleteOne({_id:id})
        res.redirect('/admin/category')



    }catch(error){
        console.log(error.message);
    }
}
const UpdateCategory = async(req,res)=>{
    try{
        const id =req.query.id
        const categoryData = await Category.findById({_id:id})
        if(categoryData){
            res.render('updateCategory',{category:categoryData})
        }else{
            res.render('category')
        }

    }catch(error){
        console.log(error.message);
    }
}
const UpdatedCategory=async(req,res)=>{
    try{
        const cat =req.body.categoryName
        const catUP= cat.toUpperCase()
        const UpdatedCategory=await Category.findByIdAndUpdate({_id:req.body.id},{$set:{categoryName:catUP,description:req.body.description}})
        if(UpdatedCategory){
            res.redirect('/admin/category')
        }


    }catch(error){
        console.log(error.message);
    }
}

const AddProduct = async(req,res)=>{
    try{
        const categoryData=await Category.find()
        // if(req.session.admin){
        res.render('addProduct',{categoryData})
        // }else{
        //     res.redirect('/admin')
        // }

    }catch(error){
        console.log(error.message);
    }
}
const InertProduct = async (req,res)=>{
    try{
        const images = []
        for(file of req.files){
            images.push(file.filename)
        }
        const productData = new Product({
            product_name:req.body.product_name,
            category:req.body.category,
            description:req.body.description,
            quantity:req.body.quantity,
            image:images,
            price:req.body.price
        })
        const result =await productData.save()
        if(result){
            res.redirect('/admin/product')
        }else{
            console.log("not save product");
        }

    }catch(error){
        console.log(error.message);
    }
}
const loadProduct = async (req,res)=>{
    try{
    const productData= await Product.find({})
  
    res.render("products",{productData})

    }catch(error){
        console.log(error.message);
    }
}
const EditProduct = async (req,res)=>{
    try{
        const productData = await  Product.findOne({_id:req.query.id})
        const categoryData = await  Category.find()
        res.render("edit-product",{productData,categoryData})
   
    }catch(error){
        console.log(error.message);
    }
}
const UpdateProduct = async (req,res)=>{
    try{
        const id = req.body.id
        const productData = await Product.updateOne({_id:id},{$set:{
            product_name:req.body.productname,
            category:req.body.categoryName,
            description:req.body.description,
            quantity:req.body.quantity,
            image:images,
            price:req.body.price
        }})
        if(productData){
            res.redirect('/admin/product')
        }
   
    }catch(error){
        console.log(error.message);
    }
}
const DeleteProduct = async (req,res)=>{
    try{
        const id = req.query.id
        const productData=await Product.deleteOne({_id:id})
        if(productData){
            res.redirect('/admin/product')
        }
        const imgId =req.query.id
   fs.unlink(path.join(__dirname,'../public/products',imgId),()=>{})
    Product.deleteOne({_id:id}).then(()=>{
        res.redirect('/admin/products')
    })
   
    }catch(error){
        console.log(error.message);
    }
}
const ViewProduct = async (req,res)=>{
    try{
        const id = req.query.id
        const data = await Product.findOne({_id:id})
        res.render('view-product',{data})
   
    }catch(error){
        console.log(error.message);
    }
}
module.exports={
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadUserManagement,
    blockUser,
    loadCategory,
    AddCategorry,
    insertCategory,
    DeleteCategory,
    UpdateCategory,
    UpdatedCategory,
    AddProduct,
    InertProduct,
    loadProduct,
    EditProduct,
    UpdateProduct,
    DeleteProduct,
    ViewProduct
}    