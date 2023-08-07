const config = require('../../config/config')
const nodemailer = require('nodemailer')
const user = require('../../models/user-model')
const productModel = require('../../models/product-model')
const bcrypt = require('bcrypt')


module.exports={
    loadHome:(req,res)=>{
        res.render('user/index',{user:req.session.loggedIn})
    },
    Login_page:(req,res)=>{
        console.log(req.session)
        res.render('user/login-page' , {user_err:req.session.no_user , pass_err:req.session.pass_err})
        req.session.no_user=false;
        req.session.pass_err=false;
    },
    signup_page:(req,res)=>{
        res.render('user/signup')
    },
    otp_page:(req,res)=>{
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
    }
}