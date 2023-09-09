const express = require("express");
const router = express.Router();
const userController = require("../controller/user/user-controller");
const Auth = require("../Auth/auth");
const login_with_otp = require("../controller/user/login-with-otp");
const passport = require("passport");
const profileMulter = require('../multer/profile-multer')
const wishListController = require('../controller/user/wishlist-controller')
const coupenController = require('../controller/user/coupen-controller')
/* GET home page. */
router.get("/", userController.loadHome);

router.get("/login", userController.Login_page);
router.post("/login", userController.doLogin);
router.get("/signup", userController.signup_page);
router.post("/signup", userController.otp_page);
router.post("/otp-page", userController.checkOtp);
// --------->LOGIN-WITH-OTP<-------------
router.get("/login-otp", login_with_otp.login_otp);
router.post("/login-otp", login_with_otp.sendmail);
router.post("/enter-login-otp/:id", login_with_otp.checkOtp);
router.get("/enter-login-otp", login_with_otp.resendOtp);
//------------>LOGIN-WITH-GOOGLE<---------------
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/sad",
  })
);



router.get("/forget-password", userController.forgetPassword);
router.post("/forget-password", userController.sendTwillio);
router.post("/forget-pass-otp", userController.forgetCheckOtp);
router.post("/reset-password", userController.resetPass);

router.get("/profile",Auth.isLogin,userController.showProfile);
router.get("/edit-profile",Auth.isLogin,userController.showEditProfile);
router.post("/edit-profile/:id",Auth.isLogin,profileMulter.single('bannerImg'),userController.editProfile);

router.get("/product-detail-page/:id", userController.showProductDetail);

router.get("/cart",Auth.isLogin,userController.ShowCart);
router.post("/add-to-cart/:ProId",Auth.isLogin, userController.AddToCart);

router.get("/change-password/:id",Auth.isLogin, userController.ShowChangePass);
router.post("/change-password/:id",Auth.isLogin, userController.showNewPass);
router.post("/new-password/:id",Auth.isLogin, userController.SetNewPass);

//------AJAX POST CALLS-------
router.post("/change-quantity",Auth.isLogin, userController.changeQuantity);
router.post("/removeFromCart",Auth.isLogin, userController.removeFromCart);

router.get("/add-adress/:id",Auth.isLogin, userController.showAddAdress);
router.post("/add-adress",Auth.isLogin, userController.addAdress);
router.post("/remove-adress",Auth.isLogin, userController.removeAdress);
router.get("/show-edit-adress/:AdressId",Auth.isLogin, userController.ShowEditAdress);
router.post("/edit-adress/:AdressId",Auth.isLogin, userController.editAdress);

// router.post('/buy-now/:proId' , userController.showBuyNow)
router.get("/buy-now",Auth.isLogin, userController.showBuyNow);
router.post("/buy-now",Auth.isLogin, userController.BuyNow);
router.post("/verify-payment",Auth.isLogin, userController.VerifyPayment);

router.get("/orders/:id",Auth.isLogin, userController.ShowOrders);
router.post('/cancle-order' , userController.cancelOrder)

router.get('/search' , userController.search)
router.post('/search' , userController.searchProducts)
router.get('/wishlist' ,Auth.isLogin, wishListController.showWishList)
router.post('/add-to-wishlist' ,Auth.isLogin, wishListController.addToWishList)
router.post('/delete-wishlist' ,Auth.isLogin, wishListController.deleteWishList)

router.get("/show-products", userController.showProducts);
router.get('/coupen' ,Auth.isLogin, coupenController.ShowCoupen)
router.post('/change-status' ,Auth.isLogin, userController.changeStatus)

router.post('/apply-coupon' ,Auth.isLogin ,coupenController.applyCoupon)

router.get('/wallet' ,Auth.isLogin,userController.showWallet)
router.post('/add-money' , Auth.isLogin, userController.addMoney)

router.get('/logout', userController.LogOut)

router.get('/contact',userController.showContactUs)
module.exports = router;
