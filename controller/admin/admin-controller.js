const user = require("../../models/user-model");
const bcrypt = require('bcrypt');
const { Rembg } = require('rembg-node');
const sharp = require('sharp');
const categoryModel = require('../../models/category-model')

module.exports={
    dashboard:(req,res)=>{
        res.render('admin/dashboard' , {admin:true})
    },
    login:(req,res)=>{
        res.render('admin/admin-login')
    },
    doLogin:async (req,res)=>{
        console.log(req.body);
        req.body.email = req.body.email.trim();
        user.findOne({email:req.body.email,isAdmin:1}).then((data)=>{
            bcrypt.compare(req.body.password , data.password).then((status)=>{
                if(status){
                    res.redirect('/admin')
                }else{
                    res.redirect('/admin/admin-login')
                }
            })
        }).catch((err)=>{
            console.log(err)
        })
    },
    category:(req,res)=>{
        res.render('admin/category')
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
              await output.webp().toFile('./Images/'+req.file.filename);
              res.redirect('/admin/category')
            } catch (error) {
              res.status(500).json({ error: 'An error occurred while processing the image.' });
            }
          })();
    }
}