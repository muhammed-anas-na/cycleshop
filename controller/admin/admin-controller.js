const user = require("../../models/user-model");
const bcrypt = require('bcrypt');

module.exports={
    dashboard:(req,res)=>{
        res.render('admin/dashboard' , {admin:true})
    },
    login:(req,res)=>{
        res.render('admin/admin-login')
    },
    doLogin:async (req,res)=>{
        console.log(req.body);
        user.findOne({email:req.body.email,isAdmin:1}).then((data)=>{
            console.log("Admin data" , data)
            bcrypt.compare(req.body.password , data.password).then((status)=>{
                if(status){
                    res.redirect('/admin')
                }else{
                    res.redirect('/admin/admin-login')
                }
            })
        }).catch((err)=>{
            res.send('No admin found')
        })
    },

}