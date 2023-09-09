let productModel = require('../../models/product-model')
let userModel = require('../../models/user-model')
const mongodb = require('mongodb');

module.exports={
    showWishList:async(req,res)=>{
        try{
            let userSession = req.session.user;
            const oid = new mongodb.ObjectId(userSession._id);
            let data = await userModel.aggregate([
                {$match:{_id:oid}},
                {$unwind:'$wishList'},
                {$project:{
                    proId:{'$toObjectId':'$wishList.proId'},
                }},
                {$lookup:{
                    from:'products',
                    localField:'proId', 
                    foreignField:'_id',
                    as:'ProductDetails',
                }}
            ])
            res.render('user/wishlist', {data})
        }catch(err){
            console.log(err);
            res.send("Error")
        }
    },
    addToWishList:async (req,res)=>{
        try{
            let userSession = req.session.user;
            console.log(userSession)
            proId = req.body.proId
            let data = await userModel.findByIdAndUpdate(
                userSession._id,
                { $addToSet: { wishList: {proId} } },
                { new: true }
            );
            res.json(true);
        }catch(err){
            console.log(err);
            res.send('Error while addid to wish list');
        }
    },
    deleteWishList:async(req,res)=>{
        try{
            let userSession = req.session.user;
            let proId = req.body.proId
            let deletedData = await userModel.findByIdAndUpdate(
                userSession._id,
                { $pull: { wishList: {proId:proId} } },
                { new: true },
            )
            console.log(deletedData);
            res.json(true);
        }catch(err){
            console.log(err);
            res.send("Error while deleting wishlist")
        }
    }
}