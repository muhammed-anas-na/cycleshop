const mongoose =  require('mongoose');


let categoryModel = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    base_price:{
        type:Number,
        require:true,
    },
    descrition:{
        type:String,
        require:true
    },
    image:{
        type:String,
        require:true
    }
});

module.exports = mongoose.model('category' , categoryModel)
