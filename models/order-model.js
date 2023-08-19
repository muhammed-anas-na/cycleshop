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
    payment:{
        type:String,
        required:true
    },
    items:{
        type:Array,
        required:true,
    }
});

module.exports = mongoose.model('order' ,orderModel)