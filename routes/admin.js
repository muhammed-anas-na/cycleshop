const express = require('express');
const router = express.Router();
const multer = require('multer')
const path = require('path');
const adminController = require('../controller/admin/admin-controller')
const categoryController = require('../controller/admin/category-controller')


// router.use(express.static('Images'))
/* GET users listing. */
router.get('/',adminController.dashboard);
router.get('/admin-login',adminController.login)
router.post('/admin-login',adminController.doLogin)

router.get('/category',categoryController.category)

//----------------->Add Category<------------------
let pathname = Date.now()
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/upload/category');
    },
    filename: (req, file, cb) => {
      console.log(Date.now());
      console.log(path.extname(file.originalname));
      cb(null, pathname+'.webp');
    },
});
const upload = multer({ storage: storage });

router.post('/add-category',upload.single('image'), categoryController.addCategory)
module.exports = router;
