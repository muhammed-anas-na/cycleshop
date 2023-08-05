const categoryModel = require('../../models/category-model')
const productModel = require('../../models/product-model')

const multer = require('multer')

module.exports={
    allProduct:(req,res)=>{
        res.render('admin/view-products')
    },
    showAddProduct:(req,res)=>{
        categoryModel.find({}).then((data)=>{
            console.log(data);
            res.render('admin/add-product',{data})
        })
        
    },
    addProduct:async (req,res)=>{
        console.log("AddProduct")
        console.log(req.body)
        console.log(req.files[0].filename)
        console.log(req.files[1].filename)
        console.log(req.files[2].filename)
        console.log(req.files[3].filename)
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

    }
}