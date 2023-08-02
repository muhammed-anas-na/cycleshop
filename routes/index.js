const express = require('express');
const router = express.Router();
const userController = require('../controller/user-controller')

/* GET home page. */
router.get('/', userController.loadHome);

router.get('/login' , userController.Login_page)
router.get('/signup', userController.signup_page)
router.post('/signup' , userController.otp_page)
router.post('/otp-page',userController.checkOtp)

module.exports = router;
