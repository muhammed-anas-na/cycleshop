const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin/admin-controller')

/* GET users listing. */
router.get('/',adminController.dashboard);
router.get('/admin-login',adminController.login)
router.post('/admin-login',adminController.doLogin)

module.exports = router;
