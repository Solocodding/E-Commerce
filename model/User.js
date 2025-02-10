const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    // isAdmin:{type:Boolean,default:false},
    // isSeller:{type:Boolean,default:false},
    role:{type:String,required:true},
    profilePicture:{type:String,default:""},
    isVerified:{type:Boolean,required:false}
})

const User=mongoose.model("User",userSchema);
module.exports=User;