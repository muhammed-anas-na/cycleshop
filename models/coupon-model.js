const mongoose =  require('mongoose');


let couponModel = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    code:{
        type:String,
        required:true,
    },
    created:{
        type:String,
        required:true
    },
    createdS:{
        type:String,
        requried:true
    },
    expiryS:{
        type:String,
        required:true
    },
    expiry:{
        type:String,
        required:true
    },
    user:{
        type:Array,
    },
    minPrice:{
        type:Number,
        required:true,
    },
    offerPrice:{
        type:Number,
        required:true,
    }
});

module.exports = mongoose.model('coupon' , couponModel)