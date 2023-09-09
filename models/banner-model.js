const mongoose =  require('mongoose');

let bannerModel = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true
    },
    ExpiryDate:{
        type:String,
        required:true
    },
    image:{
        type:String,
        require:true 
    }
});

module.exports = mongoose.model('banner' , bannerModel)
