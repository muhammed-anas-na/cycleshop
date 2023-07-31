var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('user/index');
});

router.get('/login' , (req,res)=>{
  res.render('user/login-page.ejs')
})

module.exports = router;
