const bannerCrop = require('../../config/banner-crop')
const bannerModel = require('../../models/banner-model')

module.exports={
    showBanner:async(req,res)=>{
        try{
            let bannerData = await bannerModel.find({})
            console.log(bannerData)
            res.render('admin/banner' , {bannerData})

        }catch(err){
            console.log(err);
            res.status(300).send('Error while fetching banner data');
        }
    },
    ShowAddBanner:(req,res)=>{
        res.render('admin/add-banner')
    },
    addBanner:async(req,res)=>{
        try{
            if (!req.file) {
                return res.status(404).send('No file uploaded.');
            }
            console.log(req.file)
            let newBanner = new bannerModel({
                name:req.body.name,
                description:req.body.description,
                image:req.file.filename,
                ExpiryDate:req.body.date
            })
            newBanner.save().then((status)=>{
                res.redirect('/admin/add-banner')
            }).catch((err)=>{
                return res.status(300).send('Error while savind the banner');
            })
        }catch(err){
            console.log(err)
            return res.status(300).send('Error while trying to add new banner')
        }
    }
}