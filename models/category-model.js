const mongoose =  require('mongoose');


let categoryModel = new mongoose.Schema({
    category:{
        type:String,
        require:true,
    },
    base_price:{
        type:Number,
        require:true,
    },
    description:{
        type:String,
        require:true
    },
    image:{
        type:String,
        require:true
    }
});

module.exports = mongoose.model('category' , categoryModel)
