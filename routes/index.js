const express = require('express');
const router = express.Router();
const userController = require('../controller/user-controller')
const auth = require('../Auth/auth')

/* GET home page. */
router.get('/', auth.isLogin,userController.loadHome);

router.get('/login' ,userController.Login_page)
router.post('/login' , userController.doLogin)
router.get('/signup', userController.signup_page)
router.post('/signup' , userController.otp_page)
router.post('/otp-page/:id',userController.checkOtp)

module.exports = router;
