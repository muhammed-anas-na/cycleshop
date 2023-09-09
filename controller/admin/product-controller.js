const categoryModel = require('../../models/category-model')
const productModel = require('../../models/product-model')
const cropImg = require('../../config/crop')

module.exports={
    allProduct:(req,res)=>{
        productModel.find({}).then((data)=>{
            res.render('admin/view-products' , {data})
        }).catch((err)=>{

        })
        
    },
    showAddProduct:(req,res)=>{
        categoryModel.find({}).then((data)=>{
            console.log(data);
            res.render('admin/add-product',{data})
        })
        
    },
    addProduct:async (req,res)=>{
        console.log("AddProduct")
        const date = new Date();
        const day = date.getDate(); // Returns the day of the month (1-31)
        const month = date.getMonth() + 1; // Returns the month (0-11), so adding 1 to get 1-12
        const year = date.getFullYear(); // Returns the year (e.g., 2023)
        let createdOn = ` ${day}/${month}/${year}`
        req.body.units = parseInt(req.body.units);
        await cropImg.crop(req);
        let product = new productModel({
          name:req.body.product_name,
          description:req.body.description,
          category:req.body.category,
          regular_price:req.body.regular_price,
          sale_price:req.body.sale_price,
          created_on:createdOn,
          unit:req.body.units,
          images:[req.files[0].filename,req.files[1].filename,req.files[2].filename,req.files[3].filename]
        })
        await product.save().then((statsu)=>{
            res.redirect('/admin/add-product')
        })
    },
    deleteProduct:(req,res)=>{
        productModel.findByIdAndDelete(req.params.id).then((status)=>{
            res.redirect('/admin/all-products')
        })
    },
    showEdit:async(req,res)=>{
        let id = req.params.id;
        let category = await categoryModel.find({})
        let data = await productModel.findById(id);
        console.log(category)
        console.log(data)
        res.render('admin/edit-product' , {category:category , data:data})
    },
    editProduct:async (req,res)=>{
        if(req.files.length == 0){
            let updateObj = {
                name:req.body.product_name,
                description:req.body.description,
                category:req.body.category,
                regular_price:req.body.regular_price,
                sale_price:req.body.sale_price,
                created_on:Date.now(),
                unit:req.body.units,
            }
            productModel.findByIdAndUpdate(req.params.id ,updateObj).then(()=>{
                res.redirect('/admin/all-products')
            }).catch((err)=>{
                res.status(500).json({err:"Error occured while updating products"})
            })
        }else{
            await cropImg.crop(req);
            let updateObj = {
                name:req.body.product_name,
                description:req.body.description,
                category:req.body.category,
                regular_price:req.body.regular_price,
                sale_price:req.body.sale_price,
                created_on:Date.now(),
                unit:req.body.units,
                images:[req.files[0].filename,req.files[1].filename,req.files[2].filename,req.files[3].filename]
            }
            productModel.findByIdAndUpdate(req.params.id ,updateObj).then(()=>{
                res.redirect('/admin/all-products')
            }).catch((err)=>{
                res.status(500).json({err:"Error occured while updating products"})
            })
        }
    }
}