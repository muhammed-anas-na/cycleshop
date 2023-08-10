const config = require('../../config/config')
const nodemailer = require('nodemailer')
const user = require('../../models/user-model')
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
            user.findByIdAndUpdate(req.params.id , {name:req.body.name,email:req.body.email,number:req.body.number},{new:true})
            res.redirect('/profile/'+req.params.id)
        }else if(emailUser.email == req.body.email){
            console.log("Dont save")
            res.redirect('/edit-profile/'+req.params.id)
        }else{
            console.log("Save else")
            user.findByIdAndUpdate(req.params.id , {name:req.body.name,email:req.body.email,number:req.body.email})
        }
    }

}