const userModel = require('../../models/user-model')
module.exports={
    viewUser:(req,res)=>{
        userModel.find({isAdmin:0}).then((data)=>{
            console.log(data)
            res.render('admin/view-users',{data})

        })
    },
    blockUser:(req,res)=>{
        userModel.findByIdAndUpdate(req.params.id, { isBlocked: 1 },{new:true}).then((data)=>{
            console.log(data)
            res.redirect('/admin/view-users')
        }).catch((err)=>{
            console.log(err)
        })

    },
    unBlockUser:(req,res)=>{
        userModel.findByIdAndUpdate(req.params.id, { isBlocked: 0 },{new:true}).then((data)=>{
            console.log(data)
            res.redirect('/admin/view-users')
        }).catch((err)=>{
            console.log(err)
        })
    }
}