const user = require('../../models/user-model')
const nodemailer = require('nodemailer')
const config = require('../../config/config')

module.exports={
    login_otp:(req,res)=>{
        console.log(req.session.no_user)
        res.render('user/login-otp' ,{usererr:req.session.no_user})
    },
    sendEmail:(data)=>{

    },
    sendmail:(req,res)=>{
        req.session.email = req.body.email;
        user.find({email:req.session.email}).then((data)=>{
            if(data.length!=0){
                console.log("Send email inside")
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
                    to:req.session.email,
                    subject:'OTP LOGIN',
                    text:`Use this otp for logging in ${otp} `
                }
                transport.sendMail(mailObj ,async (err , status)=>{
                    if(err){
                        console.log('Err' , err)
                    }else{
                        console.log("Succes" ,req.session)
                        user.findOneAndUpdate({email:req.session.email} , {otp:req.session.otp},{new:true}).then((data)=>{
                            setTimeout(()=>{
                                user.findOneAndUpdate({otp:req.session.otp}, {$set:{otp:'0'}} , {new:true}).then((data)=>{
                                    console.log(data)
                                })
                                console.log("Settimeout");
                            },300000)
                            res.render('user/enter-login-otp' ,{id:data._id})
                        })
                    }
                })
            }else{
                req.session.no_user =true;
                res.redirect('/login-otp')
            }
        })
    },
    checkOtp:async (req,res)=>{
        console.log(req.params.id);
        console.log(req.body.otp.join(''))
        await user.findOne({_id:req.params.id}).then((userData)=>{
            console.log(userData);
            if(req.body.otp.join('') == userData.otp){
                req.session.loggedIn = true;
                req.session.user = userData;
                res.redirect('/')
            }else{
                res.redirect('/login')
            }
        })

    },
    resendOtp:(req,res)=>{
        res.send('Resend otp on progress...😉')
    }

}