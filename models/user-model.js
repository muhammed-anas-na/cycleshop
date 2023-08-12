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
        type:String,
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
    },
    isBlocked:{
        type:String,
        require:true,
        default:0,
    },
    cart:{
        type:Array,
    }
});

module.exports = mongoose.model('users' , userModel)
