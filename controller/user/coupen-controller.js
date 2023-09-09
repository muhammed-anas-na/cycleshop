const couponModel = require('../../models/coupon-model')
module.exports={
    ShowCoupen:(req,res)=>{
        res.render('user/coupen')
    },
    applyCoupon:async(req,res)=>{
        console.log(req.body)
        const coupon = await couponModel.findOne({code:req.body.coupon})
        console.log(coupon)
        if(!coupon){
            console.log("NO coupon")
        }else{
            console.log("Coupon exist")
            const gt = parseInt(req.body.total)-parseInt(coupon.offerPrice);
            res.json({gt:gt,offerPrice:parseInt(coupon.offerPrice)})
        }
    }
}