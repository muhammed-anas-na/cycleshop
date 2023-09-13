const userModel = require('../models/user-model')
module.exports={
    isLogin:async(req,res,next)=>{
        console.log("ISlogininnn")
        if(req.session.loggedIn){
            console.log("Yes logged in")
            const data = await userModel.findOne({email:req.session.user.email, isBlocked:0})
            if(data){
                console.log("Yes data")
                console.log("Data:",data);
                next()
            }else{
                console.log("Data===========null")
                res.status(500).send("You are blocked by the admin")
            }
        }else{
            console.log("Elseee")
            res.render('user/login-page' , {userErr:false , passErr:false , to:req.query.to})
            // res.json({})
        }
    },
    isAdminLogin:(req,res,next)=>{
        if(req.session.isAdmin){
            next()
        }else{
            res.render('admin/admin-login' ,{noAdmin:false,passErr:false})
        }
    }
}