const mongoose =  require('mongoose');


let userModel = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
    },
    number:{
        type:Number,
        require:true,
    },
    password:{
        type:String,
        require:true
    },
    verified:{
        type:Number,
        require:true,
    },
    otp:{
        type:String,
        default:0,
    },
    isAdmin:{
        type:Number,
        required:true,
        default:0
    }
});

module.exports = mongoose.model('users' , userModel)
