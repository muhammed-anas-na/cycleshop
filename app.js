const session = require('express-session')
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const ejsLayout = require('express-ejs-layouts')
const db = require('./mongoose/connection')
const googlePassport = require('./passports/google')
const passport = require('passport')
const nocache = require('nocache')

const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(express.static('public'));
app.set('layout' , './layout/layout')
app.set('partials' , './partials')
app.set('views-user', path.join(__dirname, 'views/user'));
app.set('views-admin', path.join(__dirname, 'views/admin'));
app.use(ejsLayout)

db.connect()
app.use(cookieParser());
app.use(session({
  secret:'secret-key',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(nocache())
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
