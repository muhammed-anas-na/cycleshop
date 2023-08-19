const config = require('../../config/config')
const nodemailer = require('nodemailer')
const user = require('../../models/user-model')
const mongodb = require('mongodb');
const productModel = require('../../models/product-model')
const orderModel = require('../../models/order-model');
const bcrypt = require('bcrypt')
const Razorpay = require('razorpay');

require('dotenv').config();
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEYID,
    key_secret: process.env.RAZORPAY_KEYSECRET,
});

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
            }},


        ])
        console.log("Dataaaa",data)
        let GrandTotal = 0
        for(let i=0;i<data.length;i++){
            let qua = parseInt(data[i].quantity);
            GrandTotal = GrandTotal+(qua*parseInt(data[i].ProductDetails[0].sale_price))
        }
        console.log("This is grandtotal",GrandTotal)
        res.render('user/cart' , {data , GrandTotal})
    },
    AddToCart:async(req,res)=>{
        console.log("Add too cart function =================    ")
        data = req.session.user
        console.log("User Id :",data._id)
        console.log("ProductId :",req.params.ProId)
        let userData = await user.findOne({
            _id: data._id,
            cart: { $elemMatch: { ProductId: req.params.ProId } }
        }).lean();

        console.log("User data=====> ",userData)
        if(userData == null){
            req.body.quantity = parseInt(req.body.quantity)
            let proDetails = await productModel.findOne({_id:req.params.ProId} , {sale_price:1})
            proDetails.sale_price = parseInt(proDetails.sale_price)
            user.updateOne(
                { _id: data._id },
                { $push: { cart: {ProductId:req.params.ProId,
                size:req.body.size,
                quantity:req.body.quantity,
                price:proDetails.sale_price,
                } } }
            ).then((data)=>{
                console.log("Dataaaa",data)
                res.json(true)
            }).catch(()=>{
                res.json(false)
            })
        }else{
            const matchingUser = userData;
            const matchingCartItem = matchingUser.cart.find(item => item.ProductId === req.params.ProId)
            let totalQua = parseInt(matchingCartItem.quantity)+parseInt(req.body.quantity);
            user.updateOne(
                {
                  _id: data._id,
                  'cart.ProductId': req.params.ProId,
                },
                {
                  $set: {
                    'cart.$.quantity': totalQua,
                  }
                }
              ).then((status)=>{
                console.log(status);
                res.json(true)
              }).catch((err)=>{
                res.json(false)
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
    },
    showAddAdress:(req,res)=>{
        res.render('user/add-adress')
    },
    removeFromCart:(req,res)=>{
        user.updateOne(
            {_id: req.body.userId},
            {$pull: {cart: {ProductId: req.body.proId}}
        }).then((status)=>{
            console.log(status);
            res.json(true)
        }).catch((err)=>{
            res.json(false)
        })
    },
    addAdress:(req,res)=>{
        let userData = req.session.user;
        console.log(req.body)
        user.updateOne(
            {_id:userData._id},
            {$push:{adress:{
                _id:Date.now(),
                name:req.body.name,
                number:req.body.number,
                altNumber:req.body.altNumber,
                pinCode:req.body.pinCode,
                house:req.body.house,
                area:req.body.area,
                landmark:req.body.landmark,
                town:req.body.town,
                state:req.body.state,
                country:req.body.country,
            }}}
        ).then((data)=>{
            console.log(data)
            res.redirect('/profile/'+userData._id);
        })
    },
    removeAdress:(req,res)=>{
        console.log(req.body)
        req.body.adressId = parseInt(req.body.adressId)
        user.updateOne(
            {_id: req.body.userId},
            {$pull: {adress: {_id: req.body.adressId}}
        }).then((status)=>{
            console.log(status);
            res.json(true);
        }).catch((err)=>{
            res.json(false);
        })
    },
    ShowEditAdress:async(req,res)=>{
        console.log(req.params.AdressId)
        req.params.AdressId = parseInt(req.params.AdressId)
        let userData = req.session.user;
        let Adressdata = await user.aggregate([
            {
                $unwind:'$adress'
            },
            {
                $match:{'adress._id':req.params.AdressId}
            }
        ])
        console.log(Adressdata)
        res.render('user/edit-adress' , {Adressdata:Adressdata[0]})
    },
    editAdress:(req,res)=>{
        let userData = req.session.user;
        req.params.AdressId = parseInt(req.params.AdressId)
        user.updateOne(
            {
                _id: userData._id,
                'adress._id': req.params.AdressId,
            },
            {
                $set: {
                  'adress.$.name': req.body.name,
                  'adress.$.number': req.body.number,
                  'adress.$.altNumber': req.body.altNumber,
                  'adress.$.pinCode': req.body.pinCode,
                  'adress.$.house': req.body.house,
                  'adress.$.area': req.body.area,
                  'adress.$.landmark': req.body.landmark,
                  'adress.$.town': req.body.town,
                  'adress.$.state': req.body.state,
                  'adress.$.country': req.body.country,

                }
            }
        ).then((status)=>{
            console.log(status)
            res.redirect('/profile/'+userData._id)
        })
    },
    showBuyNow:async(req,res)=>{
        // console.log("Requsst.boyd====" , req.body)
        // let userData = req.session.user;
        // console.log("Pro Id" , req.params.proId)
        // productModel.findOne({_id:req.params.proId}).then((status)=>{
        //     user.findOne({_id:userData._id}).then((userData)=>{
        //         res.render('user/buy-now' ,{status , userData , quantity:req.body.quantity , size:req.body.size})
        //     })
        // })
        if(req.query.proId){
            let userSession = req.session.user;
            let oid = new mongodb.ObjectId(req.query.proId)
            let productDetails =  await productModel.find({_id:oid})
            let userData = await user.findOne(
                {_id:userSession._id},
                {_id:1, adress:1}
            ).lean()
            console.log(productDetails)
            console.log(userData);
            res.send('😎')
            //res.render('user/buy-now' , {isSingle:true , productDetails} )
        }else{
            let userSession = req.session.user;
            let userData = await user.findOne(
                {_id:userSession._id},
                {_id:0,cart:1 , adress:1}
            ).lean()
            let total = 0;
            for(i=0;i<userData.cart.length;i++){
                let price = parseInt(userData.cart[i].price)
                total = total+(price*userData.cart[i].quantity);
            }
    
            const oid = new mongodb.ObjectId(userSession._id);
            let productDetails = await user.aggregate([
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
                }},
            ])
            console.log("ProductData",productDetails);
            res.render('user/buy-now' , {productDetails , total , userData})   
        }
    },
    BuyNow:async(req,res)=>{
        let userSession = req.session.user;
        req.body.total = parseInt(req.body.total);
        if(req.body.paymentMethod == 'cod'){
            paymentstatus = 'completed'
        }else{
            paymentstatus = 'pending'
        }
        console.log("Req boyddd" , req.body)
        let oid = new mongodb.ObjectId(userSession._id)
        req.body.adressId = parseInt(req.body.adressId);
        let data = await user.aggregate([
            {
                $match:{_id:oid}
            },
            {
                $unwind:'$adress'
            },
            {
                $match:{'adress._id': req.body.adressId}
            }

        ])
        console.log(data)
        let order = new orderModel({
            adress:data[0].adress,
            GrandTotal:req.body.total,
            paymentstatus:paymentstatus,
            payment:req.body.paymentMethod,
            userId:userSession._id,
            items:data[0].cart
        })
        order.save().then(()=>{
            if(req.body.paymentMethod == 'cod'){
                console.log("IFFFFFFFFFFFF")
                res.json(true)
            }else if(req.body.paymentMethod =='razorpay'){
                console.log(req.body.total)
                console.log("razorpayyyy")
                var options = {
                    amount: req.body.total,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: ""+order._id
                  };
                  instance.orders.create(options, function(err, order) {
                    if(err){
                        console.log("Error while creating order : ",err)
                    }else{
                        console.log(order);
                        res.json(order)
                    }
                  });

            }
            
        }).catch((err)=>{
            res.state(500).json({err:'Error'})
        })
    },
    VerifyPayment:(req,res)=>{
        try{
            console.log(req.body)
            details = req.body;
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256' , process.env.RAZORPAY_KEYSECRET)
            hmac.update(details['response[razorpay_order_id]']+'|'+details['response[razorpay_payment_id]'])
            hmac = hmac.digest('hex');
            console.log(details['response[razorpay_order_id]'])
            console.log(details['response[razorpay_signature]'])
            console.log(hmac)
            if(hmac == details['response[razorpay_signature]']){
                orderModel.findByIdAndUpdate(req.body['order[receipt]'] , {$set:{paymentstatus:'completed'}}).then((status) =>{
                    console.log("status",status)
                    res.json(true);
                }).catch((err)=>{
                    res.json(false);
                })
                
            }else{
                console.log('hmac not matchinggg..')
                res.json(false);
            }
        }catch{
            console.log("Catch error")
        }
    },
    showSucess:(req,res)=>{
        res.render()
    }
}