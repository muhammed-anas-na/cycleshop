const config = require('../../config/config')
const nodemailer = require('nodemailer')
const user = require('../../models/user-model')
const mongodb = require('mongodb');
const productModel = require('../../models/product-model')
const orderModel = require('../../models/order-model');
const bcrypt = require('bcrypt')
const Razorpay = require('razorpay');
const paypal = require('paypal-rest-sdk');
const bannerModel = require('../../models/banner-model');
const { accessSync } = require('fs');
const sendInvoice =require('../../config/send-invoice');
const categoryModel = require('../../models/category-model')

const couponModel = require('../../models/coupon-model');
const voucher_codes = require('voucher-code-generator');
const userModel = require('../../models/user-model');

require('dotenv').config();
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEYID,
    key_secret: process.env.RAZORPAY_KEYSECRET,
});

module.exports={
    loadHome:(req,res)=>{
        try{
            res.render('user/index',{user:req.session.loggedIn , userData:req.session.user})
        }catch{
            res.redirect('/login')
        }

    },
    Login_page:(req,res)=>{
        try{    
            if(req.session.loggedIn){
                res.redirect('/')
            }else{
                res.render('user/login-page' , {userErr:false,passErr:false , to:req.query.to})
            }
        }catch(err){
            console.log(err);
            res.redrect('/login')
        }
  
    },
    signup_page:(req,res)=>{
        try{
            res.render('user/signup')
        }catch{
            res.send('Error')
        }
    },
    otp_page:async (req,res)=>{

        try{
            const referalExistUser = await user.findOneAndUpdate(
                { referal: req.body.referalCode },
                { $inc: { wallet: 250 } }
              );
            if(referalExistUser){
                req.session.wallet = 100
            }else{
                req.session.wallet = 0;
            }
            let userExist = await user.findOne({email:req.body.email})
            Object.freeze(userExist)
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
        }catch(err){
            console.log(err)
            res.redirect('/login')
        }
    },
    checkOtp:async (req,res)=>{
        if(req.session.otp == req.body.otp.join('')){
            req.session.signupData.password = await bcrypt.hash(req.session.signupData.password,10)
            let code = voucher_codes.generate({
                prefix: "referal-",
                postfix: "-2023",
                charset:'muhammedanas',
                count:1
            });
            let use = new user({
                name:req.session.signupData.name,
                email:req.session.signupData.email,
                number:req.session.signupData.number,
                password:req.session.signupData.password,
                referal:code[0],
                verified:1,
                wallet:req.session.wallet,
            })

            await use.save().then((data)=>{
                req.session.loggedIn = true;
                req.session.user = use;
                res.redirect('/')
            }).catch((err)=>{
                console.log(err);
                res.status(500).json({err : 'Otp error'})
            })
        }else{
            res.redirect('/signup')
        }
    },
    doLogin:async (req,res)=>{
        console.log(req.query)
        let userExist = await user.findOne({email:req.body.email , isAdmin:0 , isBlocked:0}).lean()
        Object.freeze(userExist)
        if(userExist){
            bcrypt.compare(req.body.password,userExist.password).then((status)=>{
                if(status){
                    req.session.loggedIn = true;
                    req.session.user = userExist;
                    if(req.query.to){
                        res.redirect('/'+req.query.to)
                    }else{
                        res.redirect('/')
                    }
                }else{
                    res.render('user/login-page' , {userErr:false,passErr:true,to:undefined})
                }
            }).catch((err)=>{
                console.log(err);
                res.redirect('user/login-page')
            })
        }else{
            
            res.render('user/login-page' , {userErr:true,passErr:false,to:undefined})
        }
    },
    showProducts:async(req,res)=>{
        try{
            let bannerData =  await bannerModel.find({})
            let categoryData = await categoryModel.find({isListed:'1'})
            const categoryName = categoryData.map(category => category.category);
            const data = await productModel.find({ category: { $in: categoryName } });
            Object.freeze(data);
            const itemsperpage = 12;
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage;
            const totalpages = Math.ceil(data.length / 5);
            const currentproduct = data.slice(startindex,endindex);
            const userSession = req.session.user;
            res.render('user/men' , {categoryData,data:currentproduct ,userData:userSession, bannerData ,user:req.session.loggedIn,totalpages,currentpage})
        }catch(err){
            console.log(err);
            res.status(500).send("Something went wrong")
        }
    },
    sendTwillio:async (req,res)=>{
        let userExist = await user.findOne({number:req.body.number})
        Object.freeze(userExist)
        if(userExist){
            otp = Math.floor(1000 + Math.random() * 9000).toString()
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
                res.render('user/forget-pass-otp')
            }).catch((err)=>{
                console.log("Eree", err)
            })
        }else{
            req.session.no_number = true
            res.redirect('/forget-password')
        }

    },
    forgetPassword:(req,res)=>{
        try{
            res.render('user/forget-pass' ,{err:req.session.no_number , isAdmin:0})
            req.session.no_number = false;
        }catch(err){
            console.log(err);
        }

    },
    forgetCheckOtp:(req,res)=>{
        if(req.session.otp == req.body.otp.join('')){
            res.render('user/reset-pass')
        }else{
            res.redirect('/forget-password')
        }
    },
    resetPass:async (req,res)=>{
        if(req.body.password1 == req.body.password2){
            req.body.password2 = await bcrypt.hash(req.body.password2,10)
            user.findOneAndUpdate({number : req.session.number} , {password:req.body.password2} , {new:true}).then((data)=>{
                console.log(data)
                res.redirect('/login')
            })
        }
    },
    showProfile:async(req,res)=>{
        try{
            const userSession = req.session.user;
            let userData = await user.findById(userSession._id)
            Object.freeze(userData);
            res.render('user/profile' , {userData})
        }catch(err){
            console.log(err);
            res.send("Error while loading profile")
        }
    },
    showEditProfile:async(req,res)=>{
        try{
            const userSession = req.session.user;
            let userData = await user.findById(userSession._id)
            Object.freeze(userData)
            res.render('user/edit-profile' ,{userData})
        }catch(err){
            console.log(err);
            res.send("Error while loading edit profile page")
        }
    },
    editProfile:async (req,res)=>{
        let baseUser = await user.findById(req.params.id).lean()
        let emailUser = await user.findOne({email:req.body.email}).lean()
        Object.freeze(baseUser)
        Object.freeze(emailUser)
        if(emailUser == null){
            emailUser = {}
        }
        if(baseUser.email == emailUser.email){
            console.log("Save")
            if(req.file){
                await user.findByIdAndUpdate(req.params.id , 
                    {name:req.body.name,email:req.body.email,number:req.body.number,image:req.file.filename},{new:true}).then((status)=>{
                    console.log(status)
                })
            }else{
                await user.findByIdAndUpdate(req.params.id , 
                    {name:req.body.name,email:req.body.email,number:req.body.number},{new:true}).then((status)=>{
                })
            }
            res.redirect('/profile?id='+req.params.id)
        }else if(emailUser.email == req.body.email){
            res.redirect('/edit-profile?id='+req.params.id)
        }else{
            if(req.file){
                await user.findByIdAndUpdate(req.params.id , {name:req.body.name,email:req.body.email,number:req.body.email,image:req.file.pathname})
            }else{
                await user.findByIdAndUpdate(req.params.id , {name:req.body.name,email:req.body.email,number:req.body.email})
            }
            res.redirect('/profile?id='+req.params.id);
        }
    },
    showProductDetail:async (req,res)=>{
        let data = await productModel.findById(req.params.id)
        res.render('user/product-detail-page' , {data})
    },  
    ShowCart:async (req,res)=>{
        try{
            let userSession = req.session.user;
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
            let GrandTotal = 0
            for(let i=0;i<data.length;i++){
                let qua = parseInt(data[i].quantity);
                GrandTotal = GrandTotal+(qua*parseInt(data[i].ProductDetails[0].sale_price))
            }
            res.render('user/cart' , {data , GrandTotal})
        }catch(err){
            console.log(err)
            res.send("Error")
        }
    },
    AddToCart:async(req,res)=>{
        try{
            data = req.session.user
            let userData = await user.findOne({
                _id: data._id,
                cart: { $elemMatch: { ProductId: req.params.ProId } }
            }).lean();
            Object.freeze(userData)
            if(userData == null){
                req.body.quantity = parseInt(req.body.quantity)
                let proDetails = await productModel.find({_id:req.params.ProId})
                proDetails.sale_price = parseInt(proDetails[0].sale_price)
                user.updateOne(
                    { _id: data._id },
                    { $push: { cart: {ProductId:req.params.ProId,
                    size:req.body.size,
                    quantity:req.body.quantity,
                    price:proDetails.sale_price,
                    } } }
                ).then((data)=>{
                    res.json({added:true})
                }).catch(()=>{
                    res.json({err:true})
                })
            }else{
                const matchingUser = userData;
                const matchingCartItem = matchingUser.cart.find(item => item.ProductId === req.params.ProId)
                let totalQua = parseInt(matchingCartItem.quantity)+parseInt(req.body.quantity);
                let unit = await productModel.findById(req.params.ProId , {unit:1 , _id:0});
                if(totalQua>unit.unit){
                    return res.json({stockerr:true})
                }
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
                    res.json({added:true})
                }).catch((err)=>{
                    res.json({err:false})
                })
            }
        }catch(err){
            console.log(err)
            res.redirect('/login')
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
            req.body.password2 = await bcrypt.hash(req.body.password2,10);
            let data = await user.findByIdAndUpdate(req.params.id,{password:req.body.password2} , {new:true})
            res.redirect('/profile/'+req.params.id)
        }catch{
            res.status(500).send({err:"Something went wrong"})
        }
    },
    changeQuantity:(req,res)=>{
        req.body.count = parseInt(req.body.count);
        req.body.quantity = parseInt(req.body.quantity);
        if(req.body.count == -1 && req.body.quantity == 1){
            user.updateOne(
                {_id: req.body.userId},
                {$pull: {cart: {ProductId: req.body.proId}}
            }).then((status)=>{
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
        res.render('user/add-adress' , {from:req.query.from})
    },
    removeFromCart:(req,res)=>{
        user.updateOne(
            {_id: req.body.userId},
            {$pull: {cart: {ProductId: req.body.proId}}
        }).then((status)=>{
            res.json(true)
        }).catch((err)=>{
            res.json(false)
        })
    },
    addAdress:(req,res)=>{
        try{
            let userData = req.session.user;
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
                if(req.query.from == 'buynow'){
                    res.redirect('/buy-now')
                }else{
                    res.redirect('/profile?id='+userData._id);
                }
            })
        }catch{
            res.redirect('/login')
        }
    },
    removeAdress:(req,res)=>{
        req.body.adressId = parseInt(req.body.adressId)
        user.updateOne(
            {_id: req.body.userId},
            {$pull: {adress: {_id: req.body.adressId}}
        }).then((status)=>{
            res.json(true);
        }).catch((err)=>{
            res.json(false);
        })
    },
    ShowEditAdress:async(req,res)=>{
        try{
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
            res.render('user/edit-adress' , {Adressdata:Adressdata[0] , from:req.query.from})
        }catch{
            res.redirect('/login')
        }
        
    },
    editAdress:(req,res)=>{
        try{
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
                if(req.query.from == 'buynow'){
                    res.redirect('/buy-now')
                }else{
                    res.redirect('/profile?id='+userData._id)
                }
                
            })
        }catch{
            res.redirect('/login')
        }
        
    },
    showBuyNow:async(req,res)=>{
        try{
            if(req.query.proId){
                if(req.query.quantity == undefined){
                }else{
                    req.session.quantity = req.query.quantity
                }
                let userSession = req.session.user;
                let oid = new mongodb.ObjectId(req.query.proId)
                let ProductDetails =  await productModel.find({_id:oid})
                let userData = await user.findOne(
                    {_id:userSession._id},
                    {_id:1, adress:1,wallet:1}
                ).lean()
                Object.freeze(userData);
                let total = parseInt(ProductDetails[0].sale_price)*parseInt(req.session.quantity)
                let couponData = await couponModel.find(
                    { minPrice: { $lte: total } }
                )
                Object.freeze(couponData)
                if(productDetails.length == 0){
                    return res.redirect('/cart');
                }
                res.render('user/buy-now' ,{userData , ProductDetails ,total, isSingle:true , quantity:req.session.quantity , size:req.query.size , couponData})
                //res.render('user/buy-now' , {isSingle:true , productDetails} )
            }else{
                let userSession = req.session.user;
                let userData = await user.findOne(
                    {_id:userSession._id},
                    {_id:1,cart:1 , adress:1,wallet:1}
                ).lean()
                Object.freeze(userData)
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
                Object.freeze(productDetails)
                let couponData = await couponModel.find(
                    { minPrice: { $lte: total } }
                )
                Object.freeze(couponData)
                if(productDetails.length == 0){
                    return res.redirect('/cart')
                }
                res.render('user/buy-now' , {productDetails , total , userData , isSingle:false , couponData})   
            }
        }catch(err){
            console.log(err)
            res.send("Error")
        }
        
    },
    BuyNow:async(req,res)=>{
        const userSession = req.session.user;
        if(req.body.isWalletUsed == 'used'){
            const discount = "-"+req.body.discount;
            await user.findByIdAndUpdate(userSession._id, {
                wallet: 0,
                $push: { 'history': discount  }
            });
        }
        if(req.body.isSingle == true){
            let userSession = req.session.user;
            req.body.total = parseInt(req.body.total);
            if(req.body.paymentMethod == 'cod'){
                paymentstatus = 'completed'
            }else{
                paymentstatus = 'pending'
            }
            let details = await productModel.findById(
                req.body.proId
            )
            if(details.unit<=0){
                return res.json({stockerr:true})
            }

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
            let updatedDetails = await productModel.findByIdAndUpdate(
                req.body.proId,
                { $inc: { unit: -parseInt(req.body.quantity, 10) } },
                { new: true }
            )
            Object.freeze(data);
            Object.freeze(updatedDetails)
            const date = new Date();
            const day = date.getDate(); // Returns the day of the month (1-31)
            const month = date.getMonth() + 1; // Returns the month (0-11), so adding 1 to get 1-12
            const year = date.getFullYear(); // Returns the year (e.g., 2023)
            let createdOn = ` ${day}/${month}/${year}`
            req.body.discount = parseInt(req.body.discount);   //Converting discout into integer;
            let order = new orderModel({
                adress:data[0].adress,
                GrandTotal:req.body.total,
                paymentstatus:paymentstatus,
                orderStatus:'pending',
                payment:req.body.paymentMethod,
                userId:userSession._id,
                items:req.body.proId,
                createdOn:createdOn,
                discount:req.body.discount
            })
            order.save().then((status)=>{
                return res.json(true)
            })
        }else{
        try{
            let userSession = req.session.user;
            req.body.total = parseInt(req.body.total);
            if(req.body.paymentMethod == 'cod' || req.body.paymentMethod == 'wallet'){
                paymentstatus = 'completed'
            }else{
                paymentstatus = 'pending'
            }
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
            for (let i = 0; i < data[0].cart.length; i++) {
                let cartItem = data[0].cart[i];
                let details = await productModel.findById(
                    cartItem.ProductId,
                )
                console.log("Unit checking ==> ",details.unit)
                if(details.unit<=0){
                    return res.json({stockerr:true})
                }
            }
            for (let i = 0; i < data[0].cart.length; i++) {
                let cartItem = data[0].cart[i];
                let updatedDetails = await productModel.findByIdAndUpdate(
                    cartItem.ProductId,
                    { $inc: { unit: -parseInt(cartItem.quantity, 10) } },
                    { new: true }
                )
                
            }
            const date = new Date();
            const day = date.getDate(); // Returns the day of the month (1-31)
            const month = date.getMonth() + 1; // Returns the month (0-11), so adding 1 to get 1-12
            const year = date.getFullYear(); // Returns the year (e.g., 2023)
            let createdOn = ` ${day}/${month}/${year}`;
            req.body.discount = parseInt(req.body.discount);
            let order = new orderModel({
                adress:data[0].adress,
                GrandTotal:req.body.total,
                paymentstatus:paymentstatus,
                orderStatus:'pending',
                payment:req.body.paymentMethod,
                userId:userSession._id,
                items:data[0].cart,
                createdOnS:createdOn,
                discount:req.body.discount,
            })
            order.save().then(()=>{
                if(req.body.paymentMethod == 'cod' || req.body.paymentMethod == 'wallet'){
                    res.json(true)
                    try{
                        sendInvoice.generateAndSendInvoice(req,res,order._id,userSession.email)
                    }catch(err){
                        console.log(err);
                    }
                }else if(req.body.paymentMethod =='razorpay'){
                    var options = {
                        amount: req.body.total*100,  // amount in the smallest currency unit
                        currency: "INR",
                        receipt: ""+order._id
                      };
                      instance.orders.create(options, function(err, order) {
                        if(err){
                            console.log("Error while creating order : ",err)
                        }else{
                            res.json({order:order , razorpay:true})
                        }
                    });
                }
                else if(req.body.paymentMethod == 'paypal'){
                    require('dotenv').config();
                    paypal.configure({
                        'mode':'sandbox',
                        'client_id':'AQmlApX2q1qjQXK7bNVH9xD0zWQT7otByQH9j9aai5nYwA6VwvzSJh4XPdlcPzjgVUA_HPH7tBSp0cGC',
                        'client_secret':'EGVHCRL6rJedKYtMA6bkpPTQNz25ghmzq43G3hrsuGkD7w3B3YnSL5mBf6WnUVLfuNRBtguxMWgT4LxJ',
                    })
                    const create_payment_json = {
                        "intent": "sale",
                        "payer": {
                            "payment_method": "paypal"
                        },
                        "redirect_urls": {
                            "return_url": "http://localhost:3000/success",
                            "cancel_url": "http://localhost:3000/cancel"
                        },
                        "transactions": [{
                            "item_list": {
                                "items": [{
                                    "name": "Red Sox Hat",
                                    "sku": "001",
                                    "price": "25.00",
                                    "currency": "USD",
                                    "quantity": 1
                                }]
                            },
                            "amount": {
                                "currency": "USD",
                                "total": "25.00"
                            },
                            "description": "Hat for the best team ever"
                        }]
                    }

                    paypal.payment.create(create_payment_json, function (error, payment) {
                    if (error) {
                        console.error('PayPal API Error:', error);
                        res.status(500).json({ error: 'An error occurred with PayPal API' });
                    } else {
                        for(let i = 0;i < payment.links.length;i++){
                        if(payment.links[i].rel === 'approval_url'){
                            res.json({approvedUrl:payment.links[i].href});
                        }
                        }
                    }
                    })
                }

            }).catch((err)=>{
                console.log(err)
                res.status(500).json({err:'Error'})
            })
        }catch(err){
            console.log(err);
            res.send("😥")
        }
        }
        
    },
    VerifyPayment:(req,res)=>{
        try{
            const userSession = req.session.user
            details = req.body;
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256' , process.env.RAZORPAY_KEYSECRET)
            hmac.update(details['response[razorpay_order_id]']+'|'+details['response[razorpay_payment_id]'])
            hmac = hmac.digest('hex');
            if(hmac == details['response[razorpay_signature]']){
                if(req.body.from == 'wallet'){
                    const amount = parseInt(details['order[order][amount]']/100)
                    const discount = "+"+amount;
                    user.findByIdAndUpdate(userSession._id , {$inc:{'wallet':amount} , $push:{'history':discount}}).then((status)=>{
                        console.log(status);
                        res.json(true);
                    }).catch((err)=>{
                        res.json(false);
                    })
                }else{
                    orderModel.findByIdAndUpdate(req.body['order[receipt]'] , {$set:{paymentstatus:'completed'}}).then((status) =>{
                        res.json(true);
                        try{
                            sendInvoice.generateAndSendInvoice(req,res,details['order[receipt]'],userSession.email)
                        }catch(err){
                            console.log(err);
                        }
                    }).catch((err)=>{
                        res.json(false);
                    })
                }
                
            }else{
                res.json(false);
            }
        }catch{
            console.log("Catch error")
        }
    },
    ShowOrders:async(req,res)=>{
        try{
            let orders =  await orderModel.aggregate([
                {$match:{userId:req.params.id}},
                {$unwind:'$items'},
                {$project:{
                    proId:{'$toObjectId':'$items.ProductId'},
                    quantity:'$items.quantity',
                    size:'$items.size',
                    adress:'$adress',
                    GrandTotal:'$GrandTotal',
                    orderedOn:'$createdOnS',
                    orderStatus:'$orderStatus',
                    paymentMethod:'$payment'
                }},
                {$lookup:{
                    from:'products',
                    localField:'proId', 
                    foreignField:'_id',
                    as:'ProductDetails',
                }}
            ])
            orders.reverse();
            Object.freeze(orders);
            const itemsperpage = 5;
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage;
            const totalpages = Math.ceil(orders.length / 5);
            const currentproduct = orders.slice(startindex,endindex);
            let userData = req.session.user
            res.render('user/orders',{orders:currentproduct,totalpages,currentpage,userData})
        }catch(err){
            console.log(err)
            res.send("Error")
        }
    },

    cancelOrder: (req,res)=>{
        console.log("Cancle order functionn")
        try{
            const userSession = req.session.user;
            orderModel.findByIdAndUpdate(
                req.body.orderId,
                {orderStatus:'cancled'},
                {new:true}
            ).then(async(status)=>{
                if(status.paymentstatus == 'completed'){
                    const discount = "+"+status.GrandTotal;
                    await user.findByIdAndUpdate(userSession._id , { $inc: { 'wallet': status.GrandTotal } , $push:{'history':discount}})    
                }
                res.json(true)
            })
        }catch(err){
            console.log(err);
            res.send("Error while canceling the order")
        }
        
    },
    searchProducts:async (req,res)=>{
        try{
            let data = await productModel.find({
                $or: [
                  { "name": { $regex: '^' + req.body.search, $options: 'i' } }, // Search for strings
                  { "sale_price":  { $regex: '^' + req.body.search, $options: 'i' } }, // Search for numbers
                  {"category":  { $regex: '^' + req.body.search, $options: 'i' }}
                ]
              });
            Object.freeze(data);
            res.render('user/show-products' , {data})
        }catch(err){
            console.log(err);
            res.send("Error")
        }
    },
    categoryFilter:async(req,res)=>{
        try { 
          if(req.body.category == 'All'){
          
          let products = await productModel.find({})
          res.json({products})
          console.log(products);
          console.log(req.body.category);
        }else{
            let category = await categoryModel.findOne({category:req.body.category})
            let products = await productModel.find({category:category.category})
            res.json({products})
            console.log(products);
            console.log(req.body.category);
  
        }
        } catch (error) {
          console.log(error.message);
        }
    },
    search:async(req,res)=>{
        try{
            if(req.query.min){
                let data = await productModel.find({
                    sale_price: {
                        $gte: req.query.min, 
                        $lte: req.query.max,
                    }
                })
                Object.freeze(data);
                res.render('user/show-products' , {data})
            }else{
                let data = await productModel.find({
                $or: [
                  { "category": { $regex: '^' + req.query.key, $options: 'i' } }, // Search for strings
                  { "size":  { $regex: '^' +  req.query.key, $options: 'i' } }, // Search for numbers
                  {"brand":  { $regex: '^' +  req.query.key, $options: 'i' }}
                ]
              });
              Object.freeze(data);
              res.render('user/show-products' , {data})
            }
        }catch(err){

        }
    },
    changeStatus:async(req,res)=>{
        const userSession = req.session.user;
        if(req.body.status == 'all'){
            let orders =  await orderModel.aggregate([
                {$match:{userId:userSession._id}},
                {$unwind:'$items'},
                {$project:{
                    proId:{'$toObjectId':'$items.ProductId'},
                    quantity:'$items.quantity',
                    size:'$items.size',
                    adress:'$adress',
                    GrandTotal:'$GrandTotal',
                    orderedOn:'$createdOnS',
                    orderStatus:'$orderStatus',
                    paymentMethod:'$payment'
                }},
                {$lookup:{
                    from:'products',
                    localField:'proId', 
                    foreignField:'_id',
                    as:'ProductDetails',
                }}
            ])
            Object.freeze(orders)
            res.json({orders});
        }else{
            let orders =  await orderModel.aggregate([
                {$match:{userId:userSession._id}},
                {$match:{orderStatus:req.body.status}},
                {$unwind:'$items'},
                {$project:{
                    proId:{'$toObjectId':'$items.ProductId'},
                    quantity:'$items.quantity',
                    size:'$items.size',
                    adress:'$adress',
                    GrandTotal:'$GrandTotal',
                    orderedOn:'$createdOnS',
                    orderStatus:'$orderStatus',
                    paymentMethod:'$payment'
                }},
                {$lookup:{
                    from:'products',
                    localField:'proId', 
                    foreignField:'_id',
                    as:'ProductDetails',
                }}
            ])
            orders.reverse();
            res.json({orders});
        }

    },
    showWallet:async(req,res)=>{
        try{
            const userSession = req.session.user;
            const userData = await user.findById(userSession._id)
            res.render('user/wallet' , {userData})
        }catch(err){
            console.log(err);
            res.send("Error while loading wallet")
        }
    },
    LogOut:(req,res)=>{
        try{
            req.session.destroy();
            res.redirect('/login')
        }catch(err){
            console.log(err);
            res.send("Error while logging out")
        }

    },
    showContactUs:(req,res)=>{
        res.render('user/contact');
    },
    addMoney:(req,res)=>{
        try{
            var options = {
                amount: req.body.total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+Date.now()
              };
              instance.orders.create(options, function(err, order) {
                if(err){
                    console.log("Error while creating order : ",err)
                }else{
                    res.json({order:order , razorpay:true})
                }
            });
        }catch(err){
            console.log(err);
            res.send("Cannot add amount into your acccount");
        }
    },
    returnOrder:async(req,res)=>{
        const userSession = req.session.user;
        const orderDetails = await orderModel.findByIdAndUpdate(req.body.orderId,{
            orderStatus:'return'
        },{new:true})
        Object.freeze(orderDetails);
        console.log(orderDetails)
        if(orderDetails.paymentstatus == 'completed'){
            const discount = "+"+orderDetails.GrandTotal
            userModel.findByIdAndUpdate(userSession,
                {
                    $inc:{'wallet':orderDetails.GrandTotal},
                    $push:{'history':discount}
                }
            ).then((status)=>{
                res.json({isRefunded:true})
            })
        }
    },
    showHistory:async(req,res)=>{
        try{
            const userSession = req.session.user;
            const data = await userModel.findById(userSession._id); 
            res.render('user/wallet-history' , {data})
        }catch(err){
            console.log(err)
        }
    }
}