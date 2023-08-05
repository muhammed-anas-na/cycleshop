const { Rembg } = require('rembg-node');
const sharp = require('sharp');
const categoryModel = require('../../models/category-model')

module.exports={
    category:(req,res)=>{
        categoryModel.find({}).then((data)=>{
            console.log(data)
            res.render('admin/category' , {data})
        }).catch((err)=>{
            res.status(200).json({err:'Error loaidng category'})
        })
        
    },
    addCategory:(req,res)=>{
        (async () => {
            const rembg = new Rembg({
              logging: true,
            });
            // userController.createAcc(req.body).then((id)=>{})
            let category = new categoryModel({
                category:req.body.category,
                base_price:req.body.basePrice,
                description:req.body.description,
                image:req.file.filename,
            })
            category.save().then((data)=>{
                console.log(data)
            })
            try {
              console.log(req.file)
              const input = sharp(req.file.path);
              const output = await rembg.remove(input);
              await output.webp().toFile('./public/upload/category/'+req.file.filename);
              res.redirect('/admin/category')
            } catch (error) {
              res.status(500).json({ error: 'An error occurred while processing the image.' });
            }
          })();
    },
    delete:(req,res)=>{
        categoryModel.findByIdAndDelete(req.params.id).then((status)=>{
            res.redirect('/admin/category')
        })
    }
}