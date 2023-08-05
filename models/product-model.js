const mongoose =  require('mongoose');


let productModel = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true
    },
    category:{
        type:String,
        require:true,
    },
    regular_price:{
        type:Number,
        require:true
    },
    sale_price:{
        type:Number,
        requrie:true
    },
    created_on:{
        type:Date,
        require:true
    },
    unit:{
        type:String,
        require:true
    },
    gst:{
        type:String,
        require:true,
    },
    images:{
        type:Array,
        require:true 
    }


});

module.exports = mongoose.model('product' , productModel)
