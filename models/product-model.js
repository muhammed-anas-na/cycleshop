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
        type:String,
        require:true
    },
    sale_price:{
        type:String,
        requrie:true
    },
    created_on:{
        type:String,
        require:true
    },
    unit:{
        type:Number,
        require:true
    },
    images:{
        type:Array,
        require:true 
    },
    isListed:{
        type:Number,
        default:1
    },
});

module.exports = mongoose.model('product' , productModel)
