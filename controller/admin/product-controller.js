const categoryModel = require('../../models/category-model')
const productModel = require('../../models/product-model')

const multer = require('multer')

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
        let product = new productModel({
          name:req.body.product_name,
          description:req.body.description,
          category:req.body.category,
          regular_price:req.body.regular_price,
          sale_price:req.body.sale_price,
          created_on:Date.now(),
          unit:req.body.units,
          gst:req.body.tax_rate,
          images:[req.files[0].filename,req.files[1].filename,req.files[2].filename,req.files[3].filename,]
        })
        await product.save()

    },
    deleteProduct:(req,res)=>{
        productModel.findByIdAndDelete(req.params.id).then((status)=>{
            res.redirect('/admin/all-products')
        })
    }
}