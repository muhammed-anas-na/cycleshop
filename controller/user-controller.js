const config = require('../config/config')
const nodemailer = require('nodemailer')

module.exports={
    loadHome:(req,res)=>{
        res.render('user/index')
    },
    Login_page:(req,res)=>{
        res.render('user/login-page')
    },
    signup_page:(req,res)=>{
        res.render('user/signup')
    },
    otp_page:(req,res)=>{

        res.render('user/otp-page' ,{email:req.body.email})
        let otp = Math.floor(1000 + Math.random() * 9000)
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
        transport.sendMail(mailObj , (err , status)=>{
            if(err){
                console.log('Err' , err)
            }else{
                req.session.otp = otp;
                console.log("Sucess")
            }
        })
        
    },
}