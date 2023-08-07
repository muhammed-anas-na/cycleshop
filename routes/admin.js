const express = require('express');
const router = express.Router();
const categoryUpload = require("../multer/category-multer")
const productUpload = require("../multer/product-multer")
const adminController = require('../controller/admin/admin-controller')
const categoryController = require('../controller/admin/category-controller')
const productController = require('../controller/admin/product-controller')
const userController = require('../controller/admin/user-controller')
// router.use(express.static('Images'))
/* GET users listing. */
router.get('/',adminController.dashboard);
router.get('/admin-login',adminController.login)
router.post('/admin-login',adminController.doLogin)

router.get('/category',categoryController.category)
router.post('/add-category',categoryUpload.single('image'), categoryController.addCategory)
router.get('/delete-category/:id' , categoryController.delete)

router.get('/all-products' , productController.allProduct);
router.get('/add-product', productController.showAddProduct);
router.post('/add-product',productUpload.array('image',4) ,productController.addProduct)
router.get('/delete-product/:id',productController.deleteProduct)

router.get('/view-users', userController.viewUser) 
router.get('/block-user/:id',userController.blockUser)
router.get('/unBlock-user/:id',userController.unBlockUser)
module.exports = router;
