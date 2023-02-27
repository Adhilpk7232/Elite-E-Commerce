const mongoose= require('mongoose')

const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        unique:true,
        require:true
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    description:{
        type:String,
        require:true
    },
    image:{
        type:String,
        require:true
    }
})

module.exports =mongoose.model("category",categorySchema)