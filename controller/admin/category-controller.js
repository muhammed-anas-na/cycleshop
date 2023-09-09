const { Rembg } = require('rembg-node');
const sharp = require('sharp');
const categoryModel = require('../../models/category-model')

module.exports={
    category:(req,res)=>{
        categoryModel.find({}).then((data)=>{
            console.log(req.session)
            res.render('admin/category' , {data , category_err:req.session.category_err})
            console.log(req.session)
        }).catch((err)=>{
            res.status(200).json({err:'Error loaidng category'})
        })
    },
    addCategory:async (req,res)=>{
        let categoryExist = await categoryModel.find({
            category: { $regex: new RegExp(req.body.category, 'i') }
        });
        console.log(categoryExist);
        if(categoryExist.length == 0){
            (async () => {
                const rembg = new Rembg({
                  logging: true,
                });

                let category = new categoryModel({
                    category:req.body.category,
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
            }else{
                req.session.category_err = true
                res.redirect('/admin/category')
            }
    },
    UnlistCat:(req,res)=>{
        categoryModel.findByIdAndUpdate(req.params.id , {isListed:0},{upsert:true},{new:true}).then((status)=>{
            res.redirect('/admin/category')
        })
    },
    ListCat:(req,res)=>{
        categoryModel.findByIdAndUpdate(req.params.id , {isListed:1},{upsert:true},{new:true}).then((status)=>{
            res.redirect('/admin/category')
        }) 
    },
    showEditCateroty:async (req,res)=>{
        let data = await categoryModel.findById(req.params.id);
        res.render('admin/edit-category' , {data})
    },
    EditCategory:(req,res)=>{
        console.log(req.file)
        if(req.file==undefined){
            let newObj = {
                category:req.body.category,
                base_price:req.body.base_price,
                description:req.body.description,
            }
            categoryModel.findByIdAndUpdate(req.params.id, newObj).then((status)=>{
                console.log(status);
                res.redirect('/admin/edit-category/'+req.params.id)
            })
        }else{
            (async () => {
                const rembg = new Rembg({
                  logging: true,
                });
                // userController.createAcc(req.body).then((id)=>{})
                let newObj = {
                    category:req.body.category,
                    base_price:req.body.base_price,
                    description:req.body.description,
                    image:req.file.filename,
                }
                await categoryModel.findByIdAndUpdate(req.params.id, newObj)
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
        }
    }
}
