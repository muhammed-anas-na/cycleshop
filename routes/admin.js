const express = require('express');
const router = express.Router();
const categoryUpload = require("../multer/category-multer")
const productUpload = require("../multer/product-multer")
const adminController = require('../controller/admin/admin-controller')
const categoryController = require('../controller/admin/category-controller')
const productController = require('../controller/admin/product-controller')
const userController = require('../controller/admin/user-controller')
const orderController = require('../controller/admin/order-controller')
const bannerController = require('../controller/admin/banner-controller')
const bannerMulter = require('../multer/banner-multer')
const bannerCrop = require('../config/banner-crop')
const couponController = require('../controller/admin/coupen-controller')
const Auth = require('../Auth/auth')
// router.use(express.static('Images'))
/* GET users listing. */
router.get('/',Auth.isAdminLogin, adminController.dashboard);
router.get('/admin-login',adminController.login)
router.post('/admin-login',adminController.doLogin)

router.get('/category',Auth.isAdminLogin,categoryController.category)
router.post('/add-category',Auth.isAdminLogin,categoryUpload.single('image'), categoryController.addCategory)
router.get('/unlist-category/:id' ,Auth.isAdminLogin, categoryController.UnlistCat)
router.get('/list-category/:id' ,Auth.isAdminLogin, categoryController.ListCat)

router.get('/all-products' ,Auth.isAdminLogin, productController.allProduct);
router.get('/add-product',Auth.isAdminLogin, productController.showAddProduct);
router.post('/add-product',Auth.isAdminLogin,productUpload.array('image',4) ,productController.addProduct)

// router.get('/delete-product/:id',Auth.isAdminLogin,productController.deleteProduct)
router.post('/unlist-product' , productController.unListProduct)
router.post('/list-product' , productController.ListProduct)
router.get('/edit-product/:id' ,Auth.isAdminLogin, productController.showEdit)
router.post('/edit-product/:id'  ,Auth.isAdminLogin,productUpload.array('image',4),productController.editProduct)

router.get('/view-users',Auth.isAdminLogin, userController.viewUser) 
router.get('/block-user/:id',Auth.isAdminLogin,userController.blockUser)
router.get('/unBlock-user/:id',Auth.isAdminLogin,userController.unBlockUser)

router.get('/edit-category/:id' ,Auth.isAdminLogin, categoryController.showEditCateroty)
router.post('/edit-category/:id',Auth.isAdminLogin,categoryUpload.single('image'),categoryController.EditCategory)

router.get('/view-orders' ,Auth.isAdminLogin,orderController.showOrders)
router.get('/order-details/:orderId' ,Auth.isAdminLogin, orderController.showOrderDetails)
router.post('/change-order-status' ,Auth.isAdminLogin, orderController.changeStatus)

router.get('/salesToday' ,Auth.isAdminLogin, orderController.salesToday)
router.get('/salesWeekly' ,Auth.isAdminLogin, orderController.salesWeekly);
router.get('/salesMonthly' ,Auth.isAdminLogin, orderController.salesMonthly);
router.get('/salesYearly' ,Auth.isAdminLogin, orderController.salesYearly);

router.get('/monthly-report' ,Auth.isAdminLogin, orderController.monthlyreport)

router.get('/show-banner' ,Auth.isAdminLogin, bannerController.showBanner)
router.get('/add-banner' ,Auth.isAdminLogin, bannerController.ShowAddBanner)
router.post('/add-banner' ,Auth.isAdminLogin,bannerMulter.single('bannerImg') ,bannerCrop.resizeImages ,bannerController.addBanner)

router.get('/add-coupen',Auth.isAdminLogin,couponController.ShowBanner)
router.post('/add-coupen',Auth.isAdminLogin,couponController.AddCoupon)
// router.post('/add-banner',bannerSharp.resizeImages,bannerController.addBanner)
router.get('/invoice' ,Auth.isAdminLogin, orderController.invoice)
router.get('/logout' , Auth.isAdminLogin,adminController.logOut)

module.exports = router;
