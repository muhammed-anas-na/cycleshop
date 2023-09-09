const mongoose =  require('mongoose');


let orderModel = new mongoose.Schema({
    adress:{
        type:Object,
        required:true,
    },
    GrandTotal:{
        type:Number,
        required:true,
    },
    paymentstatus:{
        type:String,
    },
    userId:{
        type:String,
        required:true
    },
    orderStatus:{
        type:String,
        required:true
    },
    payment:{
        type:String,
        required:true
    },
    discount:{
        type:Number
    },
    items:{
        type:Array,
        required:true,
    },
    createdOn:{
        type:Date,
        default:Date.now
    },
    createdOnS:{
        type:String,
        required:true,
    }
});

module.exports = mongoose.model('order' ,orderModel)