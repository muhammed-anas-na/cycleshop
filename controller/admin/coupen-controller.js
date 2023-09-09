const Coupon = require('../../models/coupon-model')
const voucher_codes = require('voucher-code-generator');

module.exports={
    ShowBanner:async(req,res)=>{
        await Coupon.find({}).then((couponData)=>{
            res.render('admin/add-coupen' , {couponData})
        })
    },
    AddCoupon:async(req,res)=>{
        try{
            let code = voucher_codes.generate({
                prefix: "promo-",
                postfix: "-2023",
                charset:'muhammedanas',
                count:1
            });
            console.log(code);
            console.log(req.body);
            const newCoupon = new Coupon({
                name:req.body.couponName,
                code:code[0],
                created:new Date(req.body.startingDate),
                expiry:new Date(req.body.exipiringDate),
                createdS: req.body.startingDate,
                expiryS : req.body.exipiringDate,
                minPrice:req.body.minimumPrice,
                offerPrice:req.body.offerPrice
            })
            newCoupon.save().then((status)=>{
                res.redirect('/admin/add-coupen')
            }).catch((err)=>{
                console.log(err);
                res.status(500);
            })
        }catch(err){
            console.log(err);
            res.status(500);
        }
    }
}