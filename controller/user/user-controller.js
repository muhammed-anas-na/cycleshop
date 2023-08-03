const config = require('../../config/config')
const nodemailer = require('nodemailer')
const user = require('../../models/user-model')
const bcrypt = require('bcrypt')


module.exports={
    loadHome:(req,res)=>{
        res.render('user/index',{user:req.session.loggedIn})
    },
    Login_page:(req,res)=>{
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
                req.body.password = await bcrypt.hash(req.body.password,10)
                let use = new user({
                    name:req.body.name,
                    email:req.body.email,
                    number:req.body.number,
                    password:req.body.password,
                    verified:0,
                })

                await use.save().then((data)=>{
                    console.log("Sucess" , req.session)
                    res.render('user/otp-page' ,{email:req.body.email , id:use._id})
                }).catch((err)=>{
                    console.log(err);
                })
                
            }
        })
    },
    checkOtp:async (req,res)=>{
        if(req.session.otp == req.body.otp.join('')){
            await user.findOneAndUpdate({_id:req.params.id} , {verified:1} , {new:true}).then((updated)=>{
                req.session.loggedIn = true;
                req.session.user = user;
                res.redirect('/')
            }).catch((err)=>{
                console.log(err)
                res.redirect('/signup')
            })
        }else{
            console.log("Not success");
            res.redirect('/signup')
        }
    },
    doLogin:async (req,res)=>{
        console.log("Do login");
        let userExist = await user.findOne({email:req.body.email}).lean()
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

}