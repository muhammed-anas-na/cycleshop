const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin/admin-controller')
const multer = require('multer')
const path = require('path');

/* GET users listing. */
router.get('/',adminController.dashboard);
router.get('/admin-login',adminController.login)
router.post('/admin-login',adminController.doLogin)

router.get('/category',adminController.category)

//----------------->Add Category<------------------
let pathname = Date.now()
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './Images');
    },
    filename: (req, file, cb) => {
      console.log(Date.now());
      console.log(path.extname(file.originalname));
      cb(null, pathname+'.webp');
    },
});
const upload = multer({ storage: storage });

router.post('/add-category',upload.single('image'), adminController.addCategory)
module.exports = router;
