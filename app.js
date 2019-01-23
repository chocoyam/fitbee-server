/**
 * 2018.07.17
 * fitbee server
 */
var express = require('express')
  , http = require('http')
  , path = require('path');

var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

var app = express();
app.use(bodyParser.json())
app.use(cookieParser())


const multer = require('multer');
const faceupload = multer({  
    storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './faces/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  }),
});
//const faceupload = multer({ dest: './faces/'});
const bodyupload = multer({ dest: './bodypic/'});

var port = 3000;
var database = require('mysql');
const dbConfig = {
   host: '',
   user: '',
   password: '',
   port: 3306,
   database: ''
};
const conn = database.createConnection(dbConfig);


//setting routes
var user = require('./routes/User.js');
app.post('/user', faceupload.array('image'), user.getUserInfo);
app.get('/user/inbody/:id', user.getInbody);
app.put('/user/inbody/:id', user.updateInbody);
//app.get('/user/change/:id', user.getChange);
app.get('/user/bodypic/:id', user.getBodyPic);
app.post('/user/bodypic/:id', bodyupload.array('image'), user.addBodyPic);
app.post('/user/new', faceupload.array('image'), user.addUser);
app.get('/test/:id', user.test);

var exercise = require('./routes/Exercise.js');
app.get('/routine/:id', exercise.getRoutine);
app.get('/routine/:id/:exerId', exercise.getSetCnt);
app.get('/demo', exercise.getDemoRoutine);
app.get('/demoCnt', exercise.getDemoCnt);

// start server
conn.connect( (err) => {
   if (err) {
      console.error('error db connecting: ', err);
      return;
   }
   console.log('success db connecting');
});
process.on('uncaughtException', function (err) {
	console.log('uncaughtException: ' + err);
	console.log(err.stack);
});
process.on('SIGTERM', function () {
    console.log("process end");
    app.close();
});
app.on('close', function () {
	console.log("Express object end & db close");
	conn.end();
});
app.listen(port, function(){
	console.log('server is listening @'+port);
})
