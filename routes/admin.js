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
// router.use(express.static('Images'))
/* GET users listing. */
router.get('/',adminController.dashboard);
router.get('/admin-login',adminController.login)
router.post('/admin-login',adminController.doLogin)

router.get('/category',categoryController.category)
router.post('/add-category',categoryUpload.single('image'), categoryController.addCategory)
router.get('/unlist-category/:id' , categoryController.UnlistCat)
router.get('/list-category/:id' , categoryController.ListCat)

router.get('/all-products' , productController.allProduct);
router.get('/add-product', productController.showAddProduct);
router.post('/add-product',productUpload.array('image',4) ,productController.addProduct)

router.get('/delete-product/:id',productController.deleteProduct)

router.get('/edit-product/:id' , productController.showEdit)
router.post('/edit-product/:id'  ,productUpload.array('image',4),productController.editProduct)

router.get('/view-users', userController.viewUser) 
router.get('/block-user/:id',userController.blockUser)
router.get('/unBlock-user/:id',userController.unBlockUser)

router.get('/edit-category/:id' , categoryController.showEditCateroty)
router.post('/edit-category/:id',categoryUpload.single('image'),categoryController.EditCategory)

router.get('/view-orders' ,orderController.showOrders)
router.get('/order-details/:orderId' , orderController.showOrderDetails)
router.post('/change-order-status' , orderController.changeStatus)

router.get('/salesToday' , orderController.salesToday)
router.get('/salesWeekly' , orderController.salesWeekly);
router.get('/salesMonthly' , orderController.salesMonthly);
router.get('/salesYearly' , orderController.salesYearly);


router.get('/show-banner' , bannerController.showBanner)
router.get('/add-banner' , bannerController.ShowAddBanner)
router.post('/add-banner' ,bannerMulter.single('bannerImg') ,bannerCrop.resizeImages ,bannerController.addBanner)

router.get('/add-coupen',couponController.ShowBanner)
router.post('/add-coupen',couponController.AddCoupon)
// router.post('/add-banner',bannerSharp.resizeImages,bannerController.addBanner)
router.get('/invoice' , orderController.invoice)

module.exports = router;
