const couponModel = require('../../models/coupon-model')
module.exports={
    ShowCoupen:(req,res)=>{
        res.render('user/coupen')
    },
    applyCoupon:async(req,res)=>{
        const userSession = req.session.user;
        console.log(req.body)
        const coupon = await couponModel.findOne({code:req.body.coupon})
        console.log(coupon)
        if(!coupon){
            console.log("NO coupon")
            res.json({noCoupon:true})
        }else if(coupon.user.includes(userSession._id)){
            res.json({used:true})
        }
        else{
            console.log("Coupon exist")
            const gt = parseInt(req.body.total)-parseInt(coupon.offerPrice);
            res.json({gt:gt,offerPrice:parseInt(coupon.offerPrice)})
        }
    }
}