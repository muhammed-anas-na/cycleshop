const mongoose =  require('mongoose');


let categoryModel = new mongoose.Schema({
    category:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true
    },
    image:{
        type:String,
        require:true
    },
    isListed:{
        type:String,
        require:true,
        default:1,
    }

});

module.exports = mongoose.model('category' , categoryModel)
