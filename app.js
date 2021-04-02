var createError = require('http-errors');
var express = require('express');
var path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("dotenv").config();
const configs = require('./configs');
// const dbMongo = require('./modules/database');
const dbMySQL = require('./modules/mySQL');
const fileUtils = require("./utils/fileUtils");
// dbMongo.connectDB();
dbMySQL.connectDB();

var usersRouter = require('./routes/userRouter');

var app = express();
const corsOptions = {
  origin: "*",
  optionSuccessStatus: 200,
};

var configsRouter = require('./routes/configRouter');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(cors(corsOptions));
app.set('trust proxy', true);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/configs', configsRouter);
app.use('/', configsRouter);

app.use(`${configs.apiVersion.v1}/users`, usersRouter);

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

app.disable("x-powered-by");
// require('./modules/redisService').connect();
fileUtils.mkdirs(configs.storeConfig.UPLOAD_FOLDER);

module.exports = app;
