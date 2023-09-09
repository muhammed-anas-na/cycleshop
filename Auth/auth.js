const userModel = require('../models/user-model')
module.exports={
    isLogin:async(req,res,next)=>{
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
            res.redirect('/login')
        }
    },
}