const express = require('express');
const router = express.Router();
const userController = require('../controller/user-controller')
const auth = require('../Auth/auth')
const login_with_otp = require('../controller/login-with-otp')
/* GET home page. */
router.get('/', auth.isLogin,userController.loadHome);

router.get('/login' ,userController.Login_page)
router.post('/login' , userController.doLogin)
router.get('/signup', userController.signup_page)
router.post('/signup' , userController.otp_page)
router.post('/otp-page/:id',userController.checkOtp)
// --------->LOGIN-WITH-OTP<-------------
router.get('/login-otp',login_with_otp.login_otp)
router.post('/login-otp',login_with_otp.sendmail)
router.post('/enter-login-otp/:id',login_with_otp.checkOtp)


module.exports = router;
