const express = require('express');
const router = express.Router();
const multer = require('multer')
const path = require('path');
const categoryUpload = require("../multer/category-multer")
const productUpload = require("../multer/product-multer")
const adminController = require('../controller/admin/admin-controller')
const categoryController = require('../controller/admin/category-controller')
const productController = require('../controller/admin/product-controller')

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

module.exports = router;
