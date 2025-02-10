const mongoose=require("mongoose");

const productSchema=new mongoose.Schema({
    name:{type:String,required:true,trim:true},
    description:{type:String,required:true,trim:true},
    price:{type:Number,required:true,min:0},
    stock:{type:Number,required:true,min:0},
    imageUrl:{type:String,required:true},
    isDeleted: {type: Boolean,default: false},
    sellerId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
});
const Product=mongoose.model("Product",productSchema);
module.exports=Product;