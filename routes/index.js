const express = require('express');
const router = express.Router();
const userController = require('../controller/user/user-controller')
const auth = require('../Auth/auth')
const login_with_otp = require('../controller/user/login-with-otp')
const passport = require('passport')

/* GET home page. */
router.get('/',userController.loadHome);

router.get('/login' ,userController.Login_page)
router.post('/login' , userController.doLogin)
router.get('/signup', userController.signup_page)
router.post('/signup' , userController.otp_page)
router.post('/otp-page',userController.checkOtp)
// --------->LOGIN-WITH-OTP<-------------
router.get('/login-otp',login_with_otp.login_otp)
router.post('/login-otp',login_with_otp.sendmail)
router.post('/enter-login-otp/:id',login_with_otp.checkOtp)
router.get('/enter-login-otp',login_with_otp.resendOtp)
//------------>LOGIN-WITH-GOOGLE<---------------
router.get('/auth/google/callback',passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/sad', 
}));

router.get('/show-products', userController.showProducts)

router.get('/forget-password' , userController.forgetPassword)
router.post('/forget-password' , userController.sendTwillio)
router.post('/forget-pass-otp' , userController.forgetCheckOtp)
router.post('/reset-password' , userController.resetPass)

router.get('/profile/:id' , userController.showProfile)
router.get('/edit-profile/:id' , userController.showEditProfile)
router.post('/edit-profile/:id',userController.editProfile)

router.get('/product-detail-page/:id' , userController.showProductDetail)

router.get('/cart/:id' , userController.ShowCart)
router.post('/add-to-cart' , userController.AddToCart)
module.exports = router;
