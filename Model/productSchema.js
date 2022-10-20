const mongoose=require('mongoose')

const productSchema=new mongoose.Schema({
    prdName:{
        type:String,
        required:true
    },
    Categoryname:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Price:{
        type:String,
        required:true
    },
    allImages:
    {
        type:Array,
        required:true
    }
})

module.exports=mongoose.model("Product",productSchema)