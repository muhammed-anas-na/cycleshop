const express = require('express');
const router = express.Router();
const multer = require('multer')
const path = require('path');
const adminController = require('../controller/admin/admin-controller')
const categoryController = require('../controller/admin/category-controller')
const productController = require('../controller/admin/product-controller')

// router.use(express.static('Images'))
/* GET users listing. */
router.get('/',adminController.dashboard);
router.get('/admin-login',adminController.login)
router.post('/admin-login',adminController.doLogin)

router.get('/category',categoryController.category)

//----------------->Add Category<------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/upload/category');
    },
    filename: (req, file, cb) => {
      const originalname = file.originalname;
      const extname = path.extname(originalname);
      const basename = path.basename(originalname, extname);
      const pathname = `${Date.now()}.webp`;
      cb(null, pathname);
    },
});
const upload = multer({ storage: storage });

router.post('/add-category',upload.single('image'), categoryController.addCategory)
router.get('/delete-category/:id' , categoryController.delete)

router.get('/all-products' , productController.allProduct);
router.get('/add-product', productController.addProduct);


module.exports = router;
