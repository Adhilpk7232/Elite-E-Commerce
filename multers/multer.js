const express = require('express')
const app = express()
const multer = require('multer')
const path =require('path')
app.use(express.static(path.join(__dirname,'public')))
const bodyParser =require('body-parser')

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,"../public/products"))
    },
    filename:function(req,file,cb){
        const name =Date.now()+"-"+file.originalname
        cb(null,name)
    }
})
const upload =multer({storage:storage})

const categoryStorage =multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,"../public/category-img"))
    },
    filename:function(req,file,cb){
        const name = Date.now()+"-"+file.originalname
        cb(null,name)
    }
})

const categoryMulter = multer({storage:categoryStorage})

module.exports ={
    upload,
    categoryMulter
}