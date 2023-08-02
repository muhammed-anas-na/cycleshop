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
    }
});

module.exports = mongoose.model('users' , userModel)
