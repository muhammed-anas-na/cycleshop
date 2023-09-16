const user = require("../../models/user-model");
const bcrypt = require('bcrypt');
const orderModel = require('../../models/order-model')
const productModel = require('../../models/product-model')
const categoryModel = require('../../models/category-model')

module.exports={
    dashboard:async(req,res)=>{
        if(req.session.isAdmin){
            const orderCount = await orderModel.find({}).count();
            const productCount = await productModel.find({}).count();
            const categoryCount = await categoryModel.find({}).count();
            res.render('admin/dashboard' , {admin:true , orderCount,productCount,categoryCount})
        }else{
            res.redirect('/admin/admin-login')
        }
    },

    login:(req,res)=>{
        if(req.session.isAdmin){
            res.redirect('/admin')
        }else{
            res.render('admin/admin-login',{noAdmin:false,passErr:false})

        }
    },
    doLogin:async (req,res)=>{
        console.log(req.body);
        user.findOne({email:req.body.email,isAdmin:1}).then((data)=>{
            console.log("Admin data" , data)
            bcrypt.compare(req.body.password , data.password).then((status)=>{
                if(status){
                    req.session.isAdmin = data;
                    res.redirect('/admin')
                }else{
                    res.render('admin/admin-login' , {noAdmin:false,passErr:true})
                }
            })
        }).catch((err)=>{
            res.render('admin/admin-login' , {noAdmin:true,passErr:false})
        })
    },
    logOut:(req,res)=>{
        try{
            req.session.isAdmin = false;
            res.redirect("/admin/admin-login")
        }catch(err){
            console.log(err);
            res.send("Errow wile logging out")
        }
    }

}