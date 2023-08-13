const config = require('../../config/config')
const nodemailer = require('nodemailer')
const user = require('../../models/user-model')
const mongodb = require('mongodb');
const productModel = require('../../models/product-model')
const bcrypt = require('bcrypt')
const { errorMonitor } = require('nodemailer/lib/xoauth2')

module.exports={
    loadHome:(req,res)=>{
        console.log(req.session.user)
        res.render('user/index',{user:req.session.loggedIn , userData:req.session.user})
    },
    Login_page:(req,res)=>{
        console.log(req.session)
        res.render('user/login-page' , {user_err:req.session.no_user , pass_err:req.session.pass_err})
        delete req.session.no_user;
        delete req.session.pass_err;    
    },
    signup_page:(req,res)=>{
        res.render('user/signup')
    },
    otp_page:async (req,res)=>{
        let userExist = await user.findOne({email:req.body.email})
        if(userExist == null){
            otp = Math.floor(1000 + Math.random() * 9000).toString()
            req.session.otp = otp
            const transport = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:config.EMAIL,
                    pass:config.PASSWORD
                }
            })
            var mailObj = {
                from:'anasna6005@gmail.com',
                to:req.body.email,
                subject:'CycleShop otp varification',
                text:`Thank you for choosing CycleShop. Use the following OTP to complete your Sign Up procedures. ${otp} `
            }
            transport.sendMail(mailObj ,async (err , status)=>{
                if(err){
                    console.log('Err' , err)
                }else{
                    req.session.signupData = req.body;
                    res.render('user/otp-page' ,{email:req.body.email})
                    
                }
            })
        }else{
            res.redirect('/signup')
        }

    },
    checkOtp:async (req,res)=>{
        if(req.session.otp == req.body.otp.join('')){
            req.session.signupData.password = await bcrypt.hash(req.session.signupData.password,10)
            let use = new user({
                name:req.session.signupData.name,
                email:req.session.signupData.email,
                number:req.session.signupData.number,
                password:req.session.signupData.password,
                verified:1,
            })

            await use.save().then((data)=>{
                console.log("Sucess" , req.session) 
                res.redirect('/')
            }).catch((err)=>{
                console.log(err);
                res.status(500).json({err : 'Otp error'})
            })
        }else{
            console.log("Not success");
            res.redirect('/signup')
        }
    },
    doLogin:async (req,res)=>{
        console.log("Do login");
        let userExist = await user.findOne({email:req.body.email , isAdmin:0 , isBlocked:0}).lean()
        console.log(userExist);
        if(userExist){
            bcrypt.compare(req.body.password,userExist.password).then((status)=>{
                console.log(status);
                if(status){
                    req.session.loggedIn = true;
                    req.session.user = userExist;
                    res.redirect('/')
                }else{
                    req.session.pass_err = true;
                    res.redirect('/login')
                }
            }).catch((err)=>{
                console.log(err);
                res.redirect('/login')
            })
        }else{
            console.log("No user found");
            req.session.no_user = true;
            res.redirect('/login')
        }
    },
    showProducts:(req,res)=>{
        productModel.find({}).then((data)=>{
            console.log(data)
            res.render('user/show-products' , {data})
        }).catch((err)=>{
            res.status(200).json({err:'Error loaidng Products'})
        })
    },
    sendTwillio:async (req,res)=>{
        let userExist = await user.findOne({number:req.body.number})
        if(userExist){
            otp = Math.floor(1000 + Math.random() * 9000).toString()
            console.log(otp)
            req.session.otp = otp;
            req.session.number = req.body.number;
            require('dotenv').config();
            const accountSid = process.env.TWILIO_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const client = require('twilio')(accountSid, authToken);
            client.messages
            .create({
                body:  `Otp to reset your password is ${otp}`,
                to: '+91'+req.body.number,
                from: '+16625032416',
            })
            .then((message)=>{
                console.log(message.sid);
                res.render('user/forget-pass-otp')
            }).catch((err)=>{
                console.log("Eree", errorMonitor)
            })
        }else{
            req.session.no_number = true
            res.redirect('/forget-password')
        }

    },
    forgetPassword:(req,res)=>{
        res.render('user/forget-pass' ,{err:req.session.no_number , isAdmin:0})
        
        req.session.no_number = false;
    },
    forgetCheckOtp:(req,res)=>{
        if(req.session.otp == req.body.otp.join('')){
            res.render('user/reset-pass')
        }else{

            res.redirect('/forget-password')
        }
    },
    resetPass:(req,res)=>{
        console.log(req.body)
        if(req.body.password1 == req.body.password2){
            console.log(req.session)
            req.body.password2 = bcrypt.hash(req.body.password2,10)
            user.findOneAndUpdate({number : req.session.number} , {password:req.body.password} , {new:true}).then((data)=>{
                console.log(data);
                res.redirect('/login')
            })
        }
    },
    showProfile:async(req,res)=>{
        let userData = await user.findById(req.params.id)
        res.render('user/profile' , {userData})
    },
    showEditProfile:async(req,res)=>{
        let userData = await user.findById(req.params.id)
        res.render('user/edit-profile' ,{userData})
    },
    editProfile:async (req,res)=>{
        let baseUser = await user.findById(req.params.id).lean()
        let emailUser = await user.findOne({email:req.body.email}).lean()
        console.log(baseUser)
        console.log(emailUser)
        console.log(req.body)
        if(emailUser == null){
            emailUser = {}
        }
        if(baseUser.email == emailUser.email){
            console.log("Save")
            await user.findByIdAndUpdate(req.params.id , {name:req.body.name,email:req.body.email,number:req.body.number},{new:true}).then((status)=>{
                console.log(status)
            })
            res.redirect('/profile/'+req.params.id)
        }else if(emailUser.email == req.body.email){
            console.log("Dont save")
            res.redirect('/edit-profile/'+req.params.id)
        }else{
            console.log("Save else")
            await user.findByIdAndUpdate(req.params.id , {name:req.body.name,email:req.body.email,number:req.body.email})
            res.redirect('/profile/'+req.params.id);
        }
    },
    showProductDetail:async (req,res)=>{
        let data = await productModel.findById(req.params.id)
        console.log(data)
        res.render('user/product-detail-page' , {data})
    },
    ShowCart:async (req,res)=>{
        let userSession = req.session.user;
        console.log(userSession._id)
        const oid = new mongodb.ObjectId(userSession._id);
        let data = await user.aggregate([
            {$match:{_id:oid}},
            {$unwind:'$cart'},
            {$project:{
                proId:{'$toObjectId':'$cart.ProductId'},
                quantity:'$cart.quantity',
                size:'$cart.size'
            }},
            {$lookup:{
                from:'products',
                localField:'proId', 
                foreignField:'_id',
                as:'ProductDetails',
            }}
        ])
        console.log(data)
        res.render('user/cart' , {data})
    },
    AddToCart:async(req,res)=>{
        data = req.session.user
        console.log("User Id :",data._id)
        console.log("ProductId :",req.query.ProId)
        let userData = await user.findOne({
            _id: data._id,
            cart: { $elemMatch: { ProductId: req.query.ProId } }
        }).lean();

        console.log("User data=====> ",userData)
        if(userData == null){
            req.body.quantity = parseInt(req.body.quantity)
            user.updateOne(
                { _id: data._id },
                { $push: { cart: {ProductId:req.query.ProId,
                size:req.body.size,
                quantity:req.body.quantity
                } } }
            ).then((data)=>{
                console.log("Dataaaa",data)
                res.redirect('/product-detail-page/'+ req.query.ProId);
            })
        }else{
            const matchingUser = userData;
            console.log(matchingUser)
            const matchingCartItem = matchingUser.cart.find(item => item.ProductId === req.query.ProId)
            console.log("Matchin cart Item   : ",matchingCartItem)
            console.log("Quantity : " , matchingCartItem.quantity)

            let totalQua = parseInt(matchingCartItem.quantity)+parseInt(req.body.quantity);
            user.updateOne(
                {
                  _id: data._id,
                  'cart.ProductId': req.query.ProId,
                },
                {
                  $set: {
                    'cart.$.quantity': totalQua,
                  }
                }
              ).then((status)=>{
                console.log(status);
                res.redirect('/product-detail-page/'+ req.query.ProId)
              })
        }
        

    },
    ShowChangePass:(req,res)=>{
        res.render('user/change-password' , {id:req.params.id})
    },
    showNewPass:(req,res)=>{
        let id = req.params.id;
        user.findById(id).then((data)=>{
            bcrypt.compare(req.body.password , data.password).then((status)=>{
                if(status){
                    res.render('user/new-password',{id:req.params.id})
                }else{
                    res.redirect('/change-password/'+req.params.id)
                }
            })
        })
    },
    SetNewPass:async(req,res)=>{
        try{
            console.log(req.body)
            req.body.password2 = await bcrypt.hash(req.body.password2,10);
            let data = await user.findByIdAndUpdate(req.params.id,{password:req.body.password2} , {new:true})
            console.log(data)
            res.redirect('/profile/'+req.params.id)
        }catch{
            res.status(500).send({err:"Something went wrong"})
        }
    },
    changeQuantity:(req,res)=>{
        req.body.count = parseInt(req.body.count);
        req.body.quantity = parseInt(req.body.quantity);
        console.log(req.body)   
        if(req.body.count == -1 && req.body.quantity == 1){
            // user.findByIdAndDelete(req.body.userId , {'cart.ProductId':req.body.proId}).then((status)=>{
            //     console.log(status);
            // })
            user.updateOne(
                {_id: req.body.userId},
                {$pull: {cart: {ProductId: req.body.proId}}
            }).then((status)=>{
                console.log(status);
                res.json({status:true})
            })
        }else{
            user.updateOne(
                {
                  _id: req.body.userId,
                  'cart.ProductId': req.body.proId,
                },
                {
                  $inc: {
                    'cart.$.quantity': req.body.count,
                  }
                },
                {
                    new:true
                }
            ).then((status)=>{
                res.json({status:false})
            })
        }
    }


}