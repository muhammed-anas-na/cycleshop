const categoryModel = require('../../models/category-model')
module.exports={
    allProduct:(req,res)=>{
        res.render('admin/view-products')
    },
    addProduct:(req,res)=>{
        categoryModel.find({}).then((data)=>{
            console.log(data);
            res.render('admin/add-product',{data})
        })
        
    }
}